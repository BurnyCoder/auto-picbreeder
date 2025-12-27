/**
 * API Connection Diagnostic Test
 * Run with: node tests/apiConnection.test.js
 *
 * This test helps diagnose "Failed to fetch" errors
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Try to load API key from .env file
let apiKey = process.env.VUE_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// Try loading from .env file manually if not in environment
if (!apiKey) {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VUE_APP_OPENAI_API_KEY=(.+)/);
      if (match) {
        apiKey = match[1].trim();
      }
    }
  } catch (e) {
    console.log('Could not read .env file:', e.message);
  }
}

async function runDiagnostics() {
  console.log('\n=== API Connection Diagnostics ===\n');

  // Test 1: Check API key
  console.log('1. Checking API key...');
  if (!apiKey) {
    console.log('   ✗ No API key found');
    console.log('   Set VUE_APP_OPENAI_API_KEY in .env file or environment');
    return;
  }
  console.log('   ✓ API key found (starts with:', apiKey.substring(0, 7) + '...)');

  // Test 2: Check network connectivity to OpenAI
  console.log('\n2. Testing network connectivity...');
  try {
    const dns = require('dns').promises;
    await dns.lookup('api.openai.com');
    console.log('   ✓ DNS resolution successful');
  } catch (e) {
    console.log('   ✗ DNS resolution failed:', e.message);
    return;
  }

  // Test 3: Test simple API call
  console.log('\n3. Testing API connection...');
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "connected"' }],
        max_tokens: 10
      })
    });

    console.log('   Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('   ✗ API error:', errorData.error?.message || response.statusText);

      if (response.status === 401) {
        console.log('   → Invalid API key');
      } else if (response.status === 429) {
        console.log('   → Rate limited or quota exceeded');
      } else if (response.status === 404) {
        console.log('   → Model not found - check model name');
      }
      return;
    }

    const data = await response.json();
    console.log('   ✓ API connection successful');
    console.log('   Response:', data.choices?.[0]?.message?.content);

  } catch (error) {
    console.log('   ✗ Fetch failed:', error.message);
    console.log('   Error type:', error.name);

    if (error.cause) {
      console.log('   Cause:', error.cause);
    }

    if (error.message.includes('fetch')) {
      console.log('\n   Possible causes:');
      console.log('   - No internet connection');
      console.log('   - Firewall blocking requests');
      console.log('   - Node.js version < 18 (fetch not available)');
    }
  }

  // Test 4: Check Node.js version
  console.log('\n4. Environment info:');
  console.log('   Node.js version:', process.version);
  console.log('   Fetch available:', typeof fetch !== 'undefined');

  // Test 5: Test with a vision-capable model (what the app uses)
  console.log('\n5. Testing vision model (gpt-4o-mini)...');
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What color is this? Reply with one word.' },
            {
              type: 'image_url',
              image_url: {
                url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
                detail: 'low'
              }
            }
          ]
        }],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('   ✗ Vision test failed:', errorData.error?.message);
    } else {
      const data = await response.json();
      console.log('   ✓ Vision model works');
      console.log('   Response:', data.choices?.[0]?.message?.content);
    }

  } catch (error) {
    console.log('   ✗ Vision test failed:', error.message);
  }

  // Test 6: Test the exact request format used by selectBestImage
  console.log('\n6. Testing selectBestImage request format (multiple images)...');
  try {
    // Use the same valid 1x1 red pixel PNG that worked in test 5
    const validRedPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    const testImages = [validRedPixel, validRedPixel, validRedPixel];

    const content = [
      {
        type: 'text',
        text: 'Select the best image. Respond with JSON: {"image": <1-3>, "reasoning": "<brief>"}'
      }
    ];

    testImages.forEach((dataUrl) => {
      content.push({
        type: 'image_url',
        image_url: { url: dataUrl, detail: 'low' }
      });
    });

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Use known-working model
        messages: [{ role: 'user', content: content }],
        max_completion_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('   ✗ Request failed:', errorData.error?.message || response.status);
    } else {
      const data = await response.json();
      console.log('   ✓ Multi-image request works');
      console.log('   Response:', data.choices?.[0]?.message?.content);
    }
  } catch (error) {
    console.log('   ✗ Multi-image test failed:', error.message);
    if (error.message === 'Failed to fetch') {
      console.log('\n   "Failed to fetch" indicates:');
      console.log('   - Network connectivity issue');
      console.log('   - CORS blocking (in browser)');
      console.log('   - Request being blocked by firewall/proxy');
    }
  }

  // Test 7: Test with the app's default model (gpt-5-nano) and image
  console.log('\n7. Testing app default model (gpt-5-nano) with vision...');
  try {
    const validRedPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Select image 1. Respond with JSON: {"image": 1, "reasoning": "test"}' },
            { type: 'image_url', image_url: { url: validRedPixel, detail: 'low' } }
          ]
        }],
        max_completion_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('   ✗ Request failed:', errorData.error?.message || response.status);
    } else {
      const data = await response.json();
      console.log('   ✓ gpt-5-nano vision works');
      console.log('   Response:', data.choices?.[0]?.message?.content);
    }
  } catch (error) {
    console.log('   ✗ gpt-5-nano test failed:', error.message);
  }

  console.log('\n=== Diagnostics Complete ===\n');
  console.log('SUMMARY:');
  console.log('If all tests pass here but you get "Failed to fetch" in browser:');
  console.log('1. Check browser console for CORS errors');
  console.log('2. Ensure VUE_APP_OPENAI_API_KEY is set before running npm run serve');
  console.log('3. Try rebuilding: npm run build');
  console.log('4. Check if browser extensions are blocking requests');
  console.log('5. Ensure you\'re not running on HTTP (needs HTTPS or localhost)');
}

runDiagnostics();
