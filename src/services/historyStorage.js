const STORAGE_KEY = 'picbreeder_history';
const MAX_SESSIONS = 50;
const DB_NAME = 'picbreeder_db';
const DB_STORE = 'fileHandles';
const IMAGES_FOLDER_KEY = 'imagesFolder';
const SERVER_URL = 'http://localhost:3001';

// IndexedDB for storing file handle
let dbPromise = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(DB_STORE);
      };
    });
  }
  return dbPromise;
}

export const historyStorage = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Filter to only valid session objects (have images array with content)
      // This handles migration from old format and removes empty sessions
      const validSessions = parsed.filter(item =>
        item && item.id && item.timestamp && Array.isArray(item.images) && item.images.length > 0
      );

      // If we filtered out invalid data, save the cleaned version
      if (validSessions.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
      }

      return validSessions;
    } catch (e) {
      console.error('Error reading history:', e);
      return [];
    }
  },

  getSessionById(sessionId) {
    const sessions = this.getAll();
    return sessions.find(session => session.id === sessionId) || null;
  },

  getImageById(sessionId, imageId) {
    const session = this.getSessionById(sessionId);
    if (!session) return null;
    return session.images.find(img => img.id === imageId) || null;
  },

  createSession() {
    // Create a new empty session and return its ID
    const sessions = this.getAll();

    const newSession = {
      id: this.generateId(),
      timestamp: Date.now(),
      images: []
    };

    sessions.unshift(newSession);

    while (sessions.length > MAX_SESSIONS) {
      sessions.pop();
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return newSession.id;
    } catch (e) {
      console.error('Error creating session:', e);
      return null;
    }
  },

  addToSession(sessionId, images) {
    // Add images to an existing session
    // images is an array of { genome: genomeJSON, thumbnail: dataURL }
    if (!images || images.length === 0) return false;

    const sessions = this.getAll();
    const session = sessions.find(s => s.id === sessionId);

    let newImages;
    if (!session) {
      // Session doesn't exist, create new one with these images
      newImages = images.map(img => ({
        id: this.generateId(),
        thumbnail: img.thumbnail,
        genome: img.genome
      }));
      const newSession = {
        id: sessionId || this.generateId(),
        timestamp: Date.now(),
        images: newImages
      };
      sessions.unshift(newSession);
    } else {
      // Add images to existing session
      newImages = images.map(img => ({
        id: this.generateId(),
        thumbnail: img.thumbnail,
        genome: img.genome
      }));
      session.images.push(...newImages);
      // Update timestamp to latest mutation time
      session.timestamp = Date.now();
    }

    while (sessions.length > MAX_SESSIONS) {
      sessions.pop();
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      // Auto-save to file if folder is configured
      this.saveToFile();
      // Auto-save images as PNG files if images folder is configured
      this.saveImagesToDisk(sessionId, newImages);
      // Auto-save images to server (for local dev)
      this.saveImagesToServer(sessionId, newImages);
      return true;
    } catch (e) {
      console.error('Error saving to history:', e);
      if (e.name === 'QuotaExceededError') {
        sessions.splice(Math.floor(sessions.length / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      }
      return false;
    }
  },

  deleteSession(sessionId) {
    const sessions = this.getAll();
    const filtered = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  deleteImage(sessionId, imageId) {
    const sessions = this.getAll();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.images = session.images.filter(img => img.id !== imageId);
      if (session.images.length === 0) {
        const filtered = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      }
    }
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  },

  getStats() {
    const sessions = this.getAll();
    const totalImages = sessions.reduce((sum, s) => sum + s.images.length, 0);
    const dataSize = new Blob([JSON.stringify(sessions)]).size;
    return {
      sessionCount: sessions.length,
      imageCount: totalImages,
      sizeBytes: dataSize,
      sizeKB: Math.round(dataSize / 1024),
      percentFull: Math.round((dataSize / (5 * 1024 * 1024)) * 100)
    };
  },

  // File System Access API methods for auto-saving to disk
  async selectSaveFolder() {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const db = await getDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(dirHandle, 'saveFolder');
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error selecting folder:', e);
      }
      return false;
    }
  },

  async getSaveFolder() {
    try {
      const db = await getDB();
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get('saveFolder');
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  async clearSaveFolder() {
    try {
      const db = await getDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete('saveFolder');
    } catch (e) {
      console.error('Error clearing folder:', e);
    }
  },

  async saveToFile() {
    const dirHandle = await this.getSaveFolder();
    if (!dirHandle) return false;

    try {
      // Verify we still have permission
      const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        const request = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (request !== 'granted') return false;
      }

      const data = this.getAll();
      const fileName = 'picbreeder-history.json';
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      return true;
    } catch (e) {
      console.error('Error saving to file:', e);
      return false;
    }
  },

  async hasSaveFolder() {
    const handle = await this.getSaveFolder();
    return handle !== null;
  },

  // Image folder methods for saving PNG files
  async selectImagesFolder() {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const db = await getDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(dirHandle, IMAGES_FOLDER_KEY);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error selecting images folder:', e);
      }
      return false;
    }
  },

  async getImagesFolder() {
    try {
      const db = await getDB();
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get(IMAGES_FOLDER_KEY);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  async hasImagesFolder() {
    const handle = await this.getImagesFolder();
    return handle !== null;
  },

  async clearImagesFolder() {
    try {
      const db = await getDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(IMAGES_FOLDER_KEY);
    } catch (e) {
      console.error('Error clearing images folder:', e);
    }
  },

  // Convert data URL to Blob
  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },

  // Save images to disk as PNG files in session subfolders (browser File System API)
  async saveImagesToDisk(sessionId, images) {
    const dirHandle = await this.getImagesFolder();
    if (!dirHandle) return false;

    try {
      // Verify permission
      const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        const request = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (request !== 'granted') return false;
      }

      // Create or get session subfolder
      const sessionFolderHandle = await dirHandle.getDirectoryHandle(sessionId, { create: true });

      // Save each image
      for (const img of images) {
        const timestamp = Date.now();
        const fileName = `${img.id || timestamp}.png`;
        const fileHandle = await sessionFolderHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        const blob = this.dataURLtoBlob(img.thumbnail);
        await writable.write(blob);
        await writable.close();
      }

      return true;
    } catch (e) {
      console.error('Error saving images to disk:', e);
      return false;
    }
  },

  // Save images to server (automatic, no user permission needed)
  async saveImagesToServer(sessionId, images) {
    try {
      for (const img of images) {
        await fetch(`${SERVER_URL}/api/save-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            imageId: img.id,
            imageData: img.thumbnail
          })
        });
      }
      return true;
    } catch (e) {
      // Server might not be running - fail silently
      console.debug('Server save skipped:', e.message);
      return false;
    }
  }
};

export default historyStorage;
