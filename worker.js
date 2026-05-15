/**
 * Cloudflare Worker — Anthropic API Proxy
 * ----------------------------------------------------------------------------
 * Receives chat requests from the ASO TechDay demo (anant2510.github.io/asodemo/),
 * adds the Anthropic API key from environment secrets, and forwards to Claude.
 *
 * The key NEVER leaves this Worker — clients see only the chat response.
 *
 * Setup (one-time):
 *   1. Paste this entire file into the Cloudflare Worker editor
 *   2. Deploy
 *   3. Settings → Variables and Secrets → Add Secret:
 *        Name:  ANTHROPIC_API_KEY
 *        Value: sk-ant-api03-...  (your real key)
 *   4. Copy the Worker URL (looks like https://name.username.workers.dev)
 *   5. Paste it into App.jsx as PROXY_URL
 *
 * Protections enabled:
 *   - Origin allowlist (only the GitHub Pages site can call)
 *   - Rate limit: 30 messages per IP per hour
 *   - Daily global cap: 500 total messages (resets at UTC midnight)
 */

// EDIT THIS: add the origins you want to allow.
// During dev you can include http://localhost:4173 and :5173 too.
const ALLOWED_ORIGINS = [
  'https://anant2510.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
];

// Per-IP rate limit
const RATE_LIMIT_PER_HOUR = 30;

// Daily global cap (across all visitors). Prevents runaway cost if traffic spikes.
const DAILY_GLOBAL_CAP = 500;

// In-memory counters. Cloudflare Workers are stateless across regions, so these
// reset when the Worker is redeployed or scaled. Good enough for demo-scale
// abuse prevention. For production, use Cloudflare KV or Durable Objects.
const ipBuckets = new Map();     // ip -> { count, resetAt }
let dailyCount = 0;
let dailyResetAt = nextUtcMidnight();

function nextUtcMidnight() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.getTime();
}

function checkRateLimit(ip) {
  const now = Date.now();

  // Reset daily counter at UTC midnight
  if (now > dailyResetAt) {
    dailyCount = 0;
    dailyResetAt = nextUtcMidnight();
  }

  if (dailyCount >= DAILY_GLOBAL_CAP) {
    return { ok: false, reason: 'Demo daily limit reached. Try again tomorrow.' };
  }

  // Per-IP bucket
  const bucket = ipBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  } else if (bucket.count >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, reason: 'Rate limit reached. Try again in an hour.' };
  } else {
    bucket.count++;
  }

  dailyCount++;
  return { ok: true };
}

function cors(origin, allowed) {
  // Reflect the origin if it's in the allowlist; otherwise no CORS headers.
  if (allowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }
  return {};
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const corsHeaders = cors(origin, allowed);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'ASO Demo · Anthropic Proxy',
          allowedOrigins: ALLOWED_ORIGINS,
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Block disallowed origins
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Origin not allowed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Key configured?
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Proxy not configured — missing ANTHROPIC_API_KEY secret' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Rate limit by IP (Cloudflare provides this header)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return new Response(
        JSON.stringify({ error: rl.reason }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate shape — only accept the fields we expect; never forward arbitrary fields
    const { model, system, messages, max_tokens } = body;
    if (!model || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: model, messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Forward to Anthropic
    try {
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          system,
          messages,
          max_tokens: max_tokens || 1024,
        }),
      });

      const data = await anthropicResponse.json();
      return new Response(JSON.stringify(data), {
        status: anthropicResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Upstream error: ' + err.message }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
};
