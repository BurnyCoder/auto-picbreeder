<!--
Southwestern University Computer Science Capstone - Spring 2020

Extended with History feature
-->

<template>
  <div class="history">
    <NavBar/>
    <div class="history-container">
      <h2>Evolution History</h2>
      <p class="history-stats" v-if="stats.sessionCount > 0">
        {{ stats.sessionCount }} mutation sessions, {{ stats.imageCount }} total images ({{ stats.sizeKB }}KB used)
      </p>

      <div class="history-controls">
        <button class="btn btn-primary btn-sm" @click="exportToFile">
          Export to File
        </button>
        <label class="btn btn-secondary btn-sm import-btn">
          Import from File
          <input type="file" accept=".json" @change="importFromFile" hidden />
        </label>
        <button class="btn btn-danger btn-sm" v-if="sessions.length > 0" @click="confirmClearAll">
          Clear All History
        </button>
      </div>

      <div class="sessions-list" v-if="sessions.length > 0">
        <div class="session-card" v-for="session in sessions" :key="session.id">
          <div class="session-header">
            <span class="session-date">{{ formatDateTime(session.timestamp) }}</span>
            <span class="session-count">{{ session.images.length }} parent{{ session.images.length > 1 ? 's' : '' }}</span>
            <button class="delete-session-btn" @click="deleteSession(session.id)">Delete Session</button>
          </div>
          <div class="session-images">
            <div
              class="session-image"
              v-for="image in session.images"
              :key="image.id"
              @click="selectImage(session, image)"
            >
              <img :src="image.thumbnail" :alt="'Parent image'" />
              <button class="delete-img-btn" @click.stop="deleteImage(session.id, image.id)">x</button>
            </div>
          </div>
        </div>
      </div>

      <div class="history-empty" v-else>
        <p>No saved images yet.</p>
        <p>Select images in the <router-link to="/evolve">Evolve</router-link> page and click "mutate" to save them automatically.</p>
      </div>

      <!-- Detail Modal -->
      <div class="history-modal" v-if="selectedImage" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">x</button>
          <img :src="selectedImage.thumbnail" class="modal-image" />
          <div class="modal-info">
            <p><strong>Session:</strong> {{ formatDateTime(selectedSession.timestamp) }}</p>
            <p><strong>Image ID:</strong> {{ selectedImage.id }}</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-success" @click="loadIntoEvolve">
              Load into Evolve
            </button>
            <button class="btn btn-info" @click="downloadImage">
              Download PNG
            </button>
            <button class="btn btn-secondary" @click="copyGenome">
              Copy Genome JSON
            </button>
            <button class="btn btn-danger" @click="deleteAndClose">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'
import historyStorage from '../services/historyStorage.js'

export default {
  name: 'History',
  components: {
    NavBar,
    Footer,
  },
  data() {
    return {
      sessions: [],
      stats: { sessionCount: 0, imageCount: 0, sizeKB: 0 },
      selectedSession: null,
      selectedImage: null
    }
  },
  mounted() {
    this.loadSessions();
  },
  methods: {
    loadSessions() {
      this.sessions = historyStorage.getAll();
      this.stats = historyStorage.getStats();
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString();
    },
    formatDateTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
    selectImage(session, image) {
      this.selectedSession = session;
      this.selectedImage = image;
    },
    closeModal() {
      this.selectedSession = null;
      this.selectedImage = null;
    },
    deleteSession(sessionId) {
      if (confirm('Delete this entire mutation session?')) {
        historyStorage.deleteSession(sessionId);
        this.loadSessions();
      }
    },
    deleteImage(sessionId, imageId) {
      if (confirm('Delete this image?')) {
        historyStorage.deleteImage(sessionId, imageId);
        this.loadSessions();
      }
    },
    deleteAndClose() {
      if (this.selectedImage && this.selectedSession) {
        historyStorage.deleteImage(this.selectedSession.id, this.selectedImage.id);
        this.closeModal();
        this.loadSessions();
      }
    },
    confirmClearAll() {
      if (confirm('Delete ALL saved images? This cannot be undone.')) {
        historyStorage.clearAll();
        this.loadSessions();
      }
    },
    loadIntoEvolve() {
      sessionStorage.setItem('picbreeder_load_genome', JSON.stringify(this.selectedImage.genome));
      this.$router.push('/evolve');
    },
    downloadImage() {
      const link = document.createElement('a');
      link.download = `picbreeder-${this.selectedImage.id}.png`;
      link.href = this.selectedImage.thumbnail;
      link.click();
    },
    copyGenome() {
      const genomeStr = JSON.stringify(this.selectedImage.genome, null, 2);
      navigator.clipboard.writeText(genomeStr).then(() => {
        alert('Genome JSON copied to clipboard!');
      });
    },
    exportToFile() {
      const data = historyStorage.getAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `picbreeder-history-${new Date().toISOString().slice(0,10)}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    },
    importFromFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) {
            alert('Invalid file format');
            return;
          }

          const validSessions = imported.filter(item =>
            item && item.id && item.timestamp && Array.isArray(item.images)
          );

          if (validSessions.length === 0) {
            alert('No valid sessions found in file');
            return;
          }

          // Merge with existing sessions
          const existing = historyStorage.getAll();
          const existingIds = new Set(existing.map(s => s.id));
          const newSessions = validSessions.filter(s => !existingIds.has(s.id));

          const merged = [...newSessions, ...existing];
          merged.sort((a, b) => b.timestamp - a.timestamp);

          localStorage.setItem('picbreeder_history', JSON.stringify(merged));
          this.loadSessions();
          alert(`Imported ${newSessions.length} new session(s)`);
        } catch (err) {
          alert('Error reading file: ' + err.message);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  }
}
</script>

<style scoped>
.history-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 60vh;
}

.history-stats {
  color: #666;
  font-size: 14px;
}

.history-controls {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.import-btn {
  cursor: pointer;
  margin: 0;
}

.sessions-list {
  margin-top: 20px;
}

.session-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.session-header {
  background: #f5f5f5;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #ddd;
}

.session-date {
  font-weight: bold;
}

.session-count {
  color: #666;
  font-size: 14px;
}

.delete-session-btn {
  margin-left: auto;
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-session-btn:hover {
  background: #c82333;
}

.session-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
}

.session-image {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  width: 90px;
  height: 90px;
}

.session-image:hover {
  border-color: #42b983;
}

.session-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.delete-img-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255,0,0,0.7);
  color: white;
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-image:hover .delete-img-btn {
  opacity: 1;
}

.history-empty {
  text-align: center;
  padding: 50px;
  color: #666;
}

.history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-image {
  width: 320px;
  height: 320px;
  display: block;
  margin: 0 auto 15px;
  image-rendering: pixelated;
}

.modal-info {
  margin: 15px 0;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.modal-actions .btn {
  flex: 1;
  min-width: 120px;
}
</style>
