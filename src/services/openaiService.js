/**
 * OpenAI Service for AI-assisted image selection
 * Uses GPT-5 models with vision capabilities to select the best image from mutations
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Available models with vision support
export const AVAILABLE_MODELS = [
  { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Best for coding and agentic tasks' },
  { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Configurable reasoning effort' },
  { id: 'gpt-5', name: 'GPT-5', description: 'Previous reasoning model' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Faster, cost-efficient' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Fastest, most cost-efficient' }
];

// Reasoning effort levels
export const REASONING_EFFORTS = [
  { id: 'none', name: 'None', description: 'No reasoning (fastest)' },
  { id: 'minimal', name: 'Minimal', description: 'Few reasoning tokens' },
  { id: 'low', name: 'Low', description: 'Speed over deliberation' },
  { id: 'medium', name: 'Medium', description: 'Balanced (default)' },
  { id: 'high', name: 'High', description: 'More complete reasoning' },
  { id: 'xhigh', name: 'Extra High', description: 'Maximum reasoning (GPT-5.1+)' }
];

// Default settings
const DEFAULT_MODEL = 'gpt-5-nano';
const DEFAULT_REASONING_EFFORT = 'medium';

// Local storage keys
const API_KEY_STORAGE_KEY = 'picbreeder_openai_api_key';
const AI_ENABLED_STORAGE_KEY = 'picbreeder_ai_enabled';
const MODEL_STORAGE_KEY = 'picbreeder_ai_model';
const REASONING_EFFORT_STORAGE_KEY = 'picbreeder_reasoning_effort';
const AUTO_CONTINUE_STORAGE_KEY = 'picbreeder_auto_continue';

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
 * Get the selected model
 */
export function getModel() {
  return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
}

/**
 * Set the model
 */
export function setModel(model) {
  localStorage.setItem(MODEL_STORAGE_KEY, model);
}

/**
 * Get the reasoning effort level
 */
export function getReasoningEffort() {
  return localStorage.getItem(REASONING_EFFORT_STORAGE_KEY) || DEFAULT_REASONING_EFFORT;
}

/**
 * Set the reasoning effort level
 */
export function setReasoningEffort(effort) {
  localStorage.setItem(REASONING_EFFORT_STORAGE_KEY, effort);
}

/**
 * Check if auto-continue is enabled
 */
export function isAutoContinue() {
  return localStorage.getItem(AUTO_CONTINUE_STORAGE_KEY) === 'true';
}

/**
 * Enable or disable auto-continue
 */
export function setAutoContinue(enabled) {
  localStorage.setItem(AUTO_CONTINUE_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Select the best image from an array of image data URLs using GPT-5 models
 * @param {Array<{index: number, dataUrl: string}>} images - Array of images with index and data URL
 * @param {string} criteria - Optional criteria for selection (default: aesthetic appeal)
 * @returns {Promise<{index: number, reasoning: string}>} - Index and reasoning for the selected image
 */
export async function selectBestImage(images, criteria = null) {
  const apiKey = getApiKey();
  const model = getModel();
  const reasoningEffort = getReasoningEffort();

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
  images.forEach((img) => {
    content.push({
      type: 'image_url',
      image_url: {
        url: img.dataUrl,
        detail: 'low' // Use low detail to reduce tokens/cost
      }
    });
  });

  // Build request body
  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user',
        content: content
      }
    ],
    max_completion_tokens: 1500,
    response_format: { type: 'json_object' }
  };

  // Add reasoning_effort for GPT-5 reasoning models (not needed for none)
  if (reasoningEffort !== 'none') {
    requestBody.reasoning_effort = reasoningEffort;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response to extract selection and reasoning
    const result = parseSelectionResponse(responseText, images.length);

    return result;
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

Respond with JSON only in this exact format:
{"image": <number 1-${imageCount}>, "reasoning": "<brief explanation>"}`;
}

/**
 * Parse the AI response to extract the selected image number and reasoning
 * @returns {{index: number, reasoning: string}}
 */
function parseSelectionResponse(response, maxIndex) {
  // Try to parse as JSON first
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const num = parsed.image;
      const reasoning = parsed.reasoning || '';

      if (num >= 1 && num <= maxIndex) {
        return { index: num - 1, reasoning: reasoning };
      }
    }
  } catch (e) {
    console.warn('Failed to parse JSON response:', e);
  }

  // Fallback: try to extract just a number
  const matches = response.match(/\d+/);
  if (matches) {
    const num = parseInt(matches[0], 10);
    if (num >= 1 && num <= maxIndex) {
      return { index: num - 1, reasoning: 'No reasoning provided' };
    }
  }

  // If parsing fails, return a random index as fallback
  console.warn('Could not parse AI response, selecting randomly:', response);
  return { index: Math.floor(Math.random() * maxIndex), reasoning: 'Failed to parse AI response' };
}

/**
 * Test the API connection
 */
export async function testConnection() {
  const apiKey = getApiKey();
  const model = getModel();

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
        model: model,
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
  AVAILABLE_MODELS,
  REASONING_EFFORTS,
  getApiKey,
  setApiKey,
  isEnvApiKey,
  isAiEnabled,
  setAiEnabled,
  getModel,
  setModel,
  getReasoningEffort,
  setReasoningEffort,
  isAutoContinue,
  setAutoContinue,
  selectBestImage,
  testConnection
};
