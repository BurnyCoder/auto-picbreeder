const STORAGE_KEY = 'picbreeder_history';
const MAX_ENTRIES = 150;

export const historyStorage = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading history:', e);
      return [];
    }
  },

  getById(id) {
    const entries = this.getAll();
    return entries.find(entry => entry.id === id) || null;
  },

  save(genomeJSON, thumbnailDataURL) {
    const entries = this.getAll();

    const newEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      thumbnail: thumbnailDataURL,
      genome: genomeJSON
    };

    entries.unshift(newEntry);

    while (entries.length > MAX_ENTRIES) {
      entries.pop();
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return newEntry.id;
    } catch (e) {
      console.error('Error saving to history:', e);
      if (e.name === 'QuotaExceededError') {
        entries.splice(Math.floor(entries.length / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      }
      return null;
    }
  },

  delete(id) {
    const entries = this.getAll();
    const filtered = entries.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  },

  getStats() {
    const entries = this.getAll();
    const dataSize = new Blob([JSON.stringify(entries)]).size;
    return {
      count: entries.length,
      sizeBytes: dataSize,
      sizeKB: Math.round(dataSize / 1024),
      percentFull: Math.round((dataSize / (5 * 1024 * 1024)) * 100)
    };
  }
};

export default historyStorage;
