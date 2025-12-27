/**
 * Test OpenAI image selection with real images
 * Run with: node tests/realImageTest.js
 */

const fs = require('fs');
const path = require('path');

// Load API key from .env
require('dotenv').config ? require('dotenv').config() : null;
const API_KEY = process.env.VUE_APP_OPENAI_API_KEY;

if (!API_KEY) {
  console.error('Error: VUE_APP_OPENAI_API_KEY not found in .env');
  process.exit(1);
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5-nano';

// Find images in the images folder
function findImages(dir, max = 5) {
  const images = [];

  function scan(folder) {
    if (images.length >= max) return;
    const items = fs.readdirSync(folder);
    for (const item of items) {
      if (images.length >= max) break;
      const fullPath = path.join(folder, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.png') || item.endsWith('.jpg')) {
        images.push(fullPath);
      }
    }
  }

  scan(dir);
  return images;
}

// Convert image file to base64 data URL
function imageToDataUrl(filePath) {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${base64}`;
}

// Build prompt
function buildPrompt(imageCount) {
  return `You are an art curator helping select evolved digital art. You will see ${imageCount} abstract images numbered 1 to ${imageCount}.

Select the ONE image that is the most visually interesting, aesthetically pleasing, and artistically compelling.

Consider:
- Visual complexity and interesting patterns
- Color harmony and contrast
- Unique or unusual features
- Overall aesthetic appeal

Respond with JSON only in this exact format:
{"image": <number 1-${imageCount}>, "reasoning": "<brief explanation>"}`;
}

// Call OpenAI API
async function selectBestImage(images) {
  const content = [
    { type: 'text', text: buildPrompt(images.length) }
  ];

  // Add each image
  images.forEach((img, i) => {
    content.push({
      type: 'image_url',
      image_url: {
        url: img.dataUrl,
        detail: 'low'
      }
    });
  });

  console.log(`\nSending ${images.length} images to GPT-5-Nano...`);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: content }],
      max_completion_tokens: 1500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Full API response:', JSON.stringify(data, null, 2));
  return data.choices?.[0]?.message?.content || '';
}

// Main test
async function main() {
  console.log('=== Real Image Test ===\n');

  // Find images
  const imagesDir = path.join(__dirname, '..', 'images');
  const imagePaths = findImages(imagesDir, 5);

  if (imagePaths.length === 0) {
    console.error('No images found in images/ folder');
    process.exit(1);
  }

  console.log('Found images:');
  imagePaths.forEach((p, i) => {
    console.log(`  ${i + 1}. ${path.basename(p)}`);
  });

  // Convert to data URLs
  const images = imagePaths.map((p, i) => ({
    index: i,
    path: p,
    dataUrl: imageToDataUrl(p)
  }));

  try {
    const responseText = await selectBestImage(images);
    console.log('\nRaw API Response:');
    console.log(responseText);

    // Parse response
    const parsed = JSON.parse(responseText);
    console.log('\n=== Result ===');
    console.log(`Selected: Image #${parsed.image} (${path.basename(imagePaths[parsed.image - 1])})`);
    console.log(`Reasoning: ${parsed.reasoning}`);

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
