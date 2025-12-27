/**
 * OpenAI Service for AI-assisted image selection
 * Uses GPT-5-Nano with vision capabilities to select the best image from mutations
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5-nano';

// Local storage key for API key
const API_KEY_STORAGE_KEY = 'picbreeder_openai_api_key';
const AI_ENABLED_STORAGE_KEY = 'picbreeder_ai_enabled';

/**
 * Get the OpenAI API key
 * Priority: 1) localStorage (user override), 2) .env file (VUE_APP_OPENAI_API_KEY)
 */
export function getApiKey() {
  // Check localStorage first (allows user to override .env)
  const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (storedKey) {
    return storedKey;
  }

  // Fall back to environment variable from .env
  // Vue CLI exposes env vars prefixed with VUE_APP_
  return process.env.VUE_APP_OPENAI_API_KEY || '';
}

/**
 * Check if API key is from environment variable
 */
export function isEnvApiKey() {
  const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  return !storedKey && !!process.env.VUE_APP_OPENAI_API_KEY;
}

/**
 * Set the OpenAI API key
 */
export function setApiKey(apiKey) {
  if (apiKey) {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

/**
 * Check if AI selection is enabled
 */
export function isAiEnabled() {
  return localStorage.getItem(AI_ENABLED_STORAGE_KEY) === 'true';
}

/**
 * Enable or disable AI selection
 */
export function setAiEnabled(enabled) {
  localStorage.setItem(AI_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Convert canvas data URL to base64 (strip the data URL prefix)
 */
function dataUrlToBase64(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * Select the best image from an array of image data URLs using GPT-5-Nano
 * @param {Array<{index: number, dataUrl: string}>} images - Array of images with index and data URL
 * @param {string} criteria - Optional criteria for selection (default: aesthetic appeal)
 * @returns {Promise<number>} - Index of the selected image
 */
export async function selectBestImage(images, criteria = null) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (!images || images.length === 0) {
    throw new Error('No images provided');
  }

  // Build the content array with text prompt and all images
  const content = [
    {
      type: 'text',
      text: buildPrompt(images.length, criteria)
    }
  ];

  // Add each image to the content array
  images.forEach((img, i) => {
    content.push({
      type: 'image_url',
      image_url: {
        url: img.dataUrl,
        detail: 'low' // Use low detail to reduce tokens/cost
      }
    });
  });

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        max_completion_tokens: 50
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    // Parse the response to extract the selected image number
    const selectedIndex = parseSelectionResponse(responseText, images.length);

    return selectedIndex;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Build the prompt for image selection
 */
function buildPrompt(imageCount, criteria) {
  const defaultCriteria = 'most visually interesting, aesthetically pleasing, and artistically compelling';
  const selectionCriteria = criteria || defaultCriteria;

  return `You are an art curator helping select evolved digital art. You will see ${imageCount} abstract images numbered 1 to ${imageCount}.

Select the ONE image that is the ${selectionCriteria}.

Consider:
- Visual complexity and interesting patterns
- Color harmony and contrast
- Unique or unusual features
- Overall aesthetic appeal

Respond with ONLY the number of your chosen image (1-${imageCount}). Do not include any other text.`;
}

/**
 * Parse the AI response to extract the selected image number
 */
function parseSelectionResponse(response, maxIndex) {
  // Try to extract a number from the response
  const matches = response.match(/\d+/);

  if (matches) {
    const num = parseInt(matches[0], 10);
    // Convert 1-indexed response to 0-indexed
    if (num >= 1 && num <= maxIndex) {
      return num - 1;
    }
  }

  // If parsing fails, return a random index as fallback
  console.warn('Could not parse AI response, selecting randomly:', response);
  return Math.floor(Math.random() * maxIndex);
}

/**
 * Test the API connection
 */
export async function testConnection() {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { success: false, error: 'No API key configured' };
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: 'Say "connected" if you can read this.' }
        ],
        max_completion_tokens: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default {
  getApiKey,
  setApiKey,
  isEnvApiKey,
  isAiEnabled,
  setAiEnabled,
  selectBestImage,
  testConnection
};
