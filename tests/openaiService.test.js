/**
 * Tests for OpenAI Service
 * Run with: node tests/openaiService.test.js
 */

// Mock parseSelectionResponse function (copy from openaiService.js for testing)
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
    console.warn('Failed to parse JSON response:', e.message);
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

// Test runner
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`);
  }
}

// Tests
console.log('\n=== parseSelectionResponse Tests ===\n');

test('parses valid JSON response with image and reasoning', () => {
  const response = '{"image": 5, "reasoning": "This image has vibrant colors"}';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 4, reasoning: 'This image has vibrant colors' });
});

test('parses JSON with extra whitespace', () => {
  const response = '  { "image": 10, "reasoning": "Complex patterns" }  ';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 9, reasoning: 'Complex patterns' });
});

test('parses JSON embedded in text', () => {
  const response = 'Here is my choice: {"image": 3, "reasoning": "Great contrast"} That is my selection.';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 2, reasoning: 'Great contrast' });
});

test('handles missing reasoning field', () => {
  const response = '{"image": 7}';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 6, reasoning: '' });
});

test('handles image number at boundary (1)', () => {
  const response = '{"image": 1, "reasoning": "First image"}';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 0, reasoning: 'First image' });
});

test('handles image number at boundary (25)', () => {
  const response = '{"image": 25, "reasoning": "Last image"}';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 24, reasoning: 'Last image' });
});

test('falls back to number extraction for non-JSON response', () => {
  const response = 'I choose image 12';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 11, reasoning: 'No reasoning provided' });
});

test('falls back to number extraction for plain number', () => {
  const response = '15';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result, { index: 14, reasoning: 'No reasoning provided' });
});

test('handles invalid image number (too high)', () => {
  const response = '{"image": 30, "reasoning": "Out of range"}';
  const result = parseSelectionResponse(response, 25);
  // Should fall back to random since 30 > 25
  assertEqual(result.reasoning, 'Failed to parse AI response');
});

test('handles invalid image number (zero)', () => {
  const response = '{"image": 0, "reasoning": "Zero is not valid"}';
  const result = parseSelectionResponse(response, 25);
  // Should fall back since 0 < 1
  assertEqual(result.reasoning, 'Failed to parse AI response');
});

test('handles invalid image number (negative)', () => {
  const response = '{"image": -5, "reasoning": "Negative"}';
  const result = parseSelectionResponse(response, 25);
  // JSON parse finds -5 which is < 1, falls back to regex which finds 5
  assertEqual(result, { index: 4, reasoning: 'No reasoning provided' });
});

test('handles malformed JSON gracefully', () => {
  const response = '{"image": 5, "reasoning": "unclosed';
  const result = parseSelectionResponse(response, 25);
  // Falls back to number extraction
  assertEqual(result, { index: 4, reasoning: 'No reasoning provided' });
});

test('handles empty response', () => {
  const response = '';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result.reasoning, 'Failed to parse AI response');
});

test('handles response with special characters in reasoning', () => {
  const response = '{"image": 8, "reasoning": "Has \\"interesting\\" patterns & colors!"}';
  const result = parseSelectionResponse(response, 25);
  assertEqual(result.index, 7);
  assertEqual(result.reasoning.includes('interesting'), true);
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
