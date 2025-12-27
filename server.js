const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const IMAGES_DIR = path.join(__dirname, 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Save image endpoint
app.post('/api/save-image', (req, res) => {
  try {
    const { sessionId, imageId, imageData, genome } = req.body;

    if (!sessionId || !imageId || !imageData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create session subfolder
    const sessionDir = path.join(IMAGES_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Convert base64 data URL to buffer
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save image
    const pngPath = path.join(sessionDir, `${imageId}.png`);
    fs.writeFileSync(pngPath, buffer);

    // Save genome JSON if provided
    if (genome) {
      const jsonPath = path.join(sessionDir, `${imageId}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(genome, null, 2));
      console.log(`Saved: ${pngPath} + ${jsonPath}`);
    } else {
      console.log(`Saved: ${pngPath}`);
    }

    res.json({ success: true, path: pngPath });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', imagesDir: IMAGES_DIR });
});

app.listen(PORT, () => {
  console.log(`Image save server running on http://localhost:${PORT}`);
  console.log(`Images will be saved to: ${IMAGES_DIR}`);
});
