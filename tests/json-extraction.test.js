/**
 * Robustness tests for the JSON extractor.
 *
 * Claude can wrap JSON in many ways: code fences, prefix text, trailing
 * commentary, nested objects. The extractor must survive all of them.
 */

import { describe, it, expect } from 'vitest';

// Mirror of the actual implementation (kept in sync via copy-paste — these tests
// document the contract).
const extractJsonFromLLM = (text) => {
  if (!text) return null;
  let cleaned = text;
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1];
  }
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return cleaned.slice(firstBrace, i + 1);
    }
  }
  return null;
};

describe('extractJsonFromLLM: pure JSON', () => {
  it('handles plain JSON object', () => {
    const r = extractJsonFromLLM('{"a":1}');
    expect(JSON.parse(r)).toEqual({ a: 1 });
  });

  it('handles JSON with whitespace', () => {
    const r = extractJsonFromLLM('  \n  {"a":1}  \n');
    expect(JSON.parse(r)).toEqual({ a: 1 });
  });

  it('handles deeply nested JSON', () => {
    const input = '{"a":{"b":{"c":{"d":1}}}}';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: { b: { c: { d: 1 } } } });
  });

  it('handles JSON with arrays of objects', () => {
    const input = '{"results":[{"id":"a"},{"id":"b"}]}';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r).results).toHaveLength(2);
  });
});

describe('extractJsonFromLLM: markdown code fences', () => {
  it('strips ```json fence', () => {
    const input = '```json\n{"a":1}\n```';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: 1 });
  });

  it('strips ``` fence (no language tag)', () => {
    const input = '```\n{"a":1}\n```';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: 1 });
  });

  it('strips fence with extra whitespace', () => {
    const input = '```json   \n  {"a":1}  \n   ```';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: 1 });
  });
});

describe('extractJsonFromLLM: real-world Claude responses', () => {
  it('THE EXACT BUG: JSON with trailing markdown commentary outside fence', () => {
    // This is the actual response we got from Claude that broke vision search
    const input = `\`\`\`json
{
  "identified": "A beige/tan quilted crossbody messenger-style bag",
  "results": [
    { "id": "t006", "reason": "Closest bag match — youth duffel" }
  ]
}
\`\`\`

> **Note:** This appears to be a fashion/work messenger bag, which is **not a category we directly carry**. The results above are the closest available bag and carry alternatives from our catalog.`;

    const extracted = extractJsonFromLLM(input);
    expect(extracted).not.toBeNull();
    const parsed = JSON.parse(extracted);
    expect(parsed.identified).toContain('messenger');
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].id).toBe('t006');
  });

  it('JSON with preamble text', () => {
    const input = `Sure, here are the products:

{"results":[{"id":"a"}]}`;
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r).results[0].id).toBe('a');
  });

  it('JSON with trailing text (no fence)', () => {
    const input = `{"results":[{"id":"a"}]}

Hope this helps!`;
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r).results[0].id).toBe('a');
  });

  it('JSON inside fence with note outside', () => {
    const input = `\`\`\`json
{"a":1}
\`\`\`

Note: only carrying this one item.`;
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: 1 });
  });
});

describe('extractJsonFromLLM: tricky string contents', () => {
  it('strings containing curly braces do not confuse depth counter', () => {
    const input = '{"a":"text with } in it","b":1}';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: 'text with } in it', b: 1 });
  });

  it('strings containing escape sequences', () => {
    const input = '{"a":"quote \\" inside","b":"path\\\\back"}';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ a: 'quote " inside', b: 'path\\back' });
  });

  it('strings with embedded JSON-looking text', () => {
    const input = '{"a":"someone wrote {\\"fake\\":1}","b":2}';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r).a).toContain('fake');
    expect(JSON.parse(r).b).toBe(2);
  });
});

describe('extractJsonFromLLM: failure modes', () => {
  it('returns null on empty string', () => {
    expect(extractJsonFromLLM('')).toBeNull();
  });

  it('returns null on null/undefined', () => {
    expect(extractJsonFromLLM(null)).toBeNull();
    expect(extractJsonFromLLM(undefined)).toBeNull();
  });

  it('returns null on text with no JSON object', () => {
    expect(extractJsonFromLLM('Just some prose with no JSON.')).toBeNull();
  });

  it('returns null on unbalanced braces', () => {
    expect(extractJsonFromLLM('{"a":1')).toBeNull();
  });

  it('extracts FIRST balanced object when multiple are present', () => {
    // First-match wins behavior — that's a deliberate choice
    const input = '{"first":1}{"second":2}';
    const r = extractJsonFromLLM(input);
    expect(JSON.parse(r)).toEqual({ first: 1 });
  });
});
