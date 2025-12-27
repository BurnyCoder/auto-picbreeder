const STORAGE_KEY = 'picbreeder_history';
const MAX_SESSIONS = 50;

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

    if (!session) {
      // Session doesn't exist, create new one with these images
      const newSession = {
        id: sessionId || this.generateId(),
        timestamp: Date.now(),
        images: images.map(img => ({
          id: this.generateId(),
          thumbnail: img.thumbnail,
          genome: img.genome
        }))
      };
      sessions.unshift(newSession);
    } else {
      // Add images to existing session
      const newImages = images.map(img => ({
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
  }
};

export default historyStorage;
