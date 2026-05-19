/**
 * Cloudflare Worker — ASO TechDay Demo Proxy
 * ----------------------------------------------------------------------------
 * Two endpoints, two upstream APIs, one shared key store:
 *
 *   POST /v1/messages   → forwards to Anthropic (Claude) using ANTHROPIC_API_KEY
 *   POST /v1/transcribe → forwards audio to Deepgram using DEEPGRAM_API_KEY
 *
 * Both keys NEVER leave this Worker — clients only see the response.
 * Legacy: POST / (no path) is also routed to /v1/messages for backward compat.
 *
 * Setup:
 *   Settings → Variables and Secrets → Add Secret:
 *     ANTHROPIC_API_KEY = sk-ant-api03-...
 *     DEEPGRAM_API_KEY  = (your Deepgram key)
 *
 * Protections:
 *   - Origin allowlist (only your GitHub Pages site can call)
 *   - Rate limit: 30 chat / 30 transcribe per IP per hour (separate buckets)
 *   - Daily global cap: 500 chat + 500 transcribe (resets at UTC midnight)
 */

const ALLOWED_ORIGINS = [
  'https://anant2510.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
];

const RATE_LIMIT_PER_HOUR = 30;
const DAILY_GLOBAL_CAP = 500;

// In-memory counters per route. Reset when the Worker scales/redeploys.
// For production with real traffic, use Cloudflare KV or Durable Objects.
const buckets = {
  messages:   { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
  transcribe: { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
};

function nextUtcMidnight() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.getTime();
}

function checkRateLimit(route, ip) {
  const bucket = buckets[route];
  if (!bucket) return { ok: false, reason: 'Unknown route' };

  const now = Date.now();
  if (now > bucket.dailyResetAt) {
    bucket.daily = 0;
    bucket.dailyResetAt = nextUtcMidnight();
  }
  if (bucket.daily >= DAILY_GLOBAL_CAP) {
    return { ok: false, reason: 'Demo daily limit reached. Try again tomorrow.' };
  }

  const ipBucket = bucket.ipMap.get(ip);
  if (!ipBucket || now > ipBucket.resetAt) {
    bucket.ipMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  } else if (ipBucket.count >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, reason: 'Rate limit reached. Try again in an hour.' };
  } else {
    ipBucket.count++;
  }

  bucket.daily++;
  return { ok: true };
}

function cors(origin, allowed) {
  if (allowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      // Audio uploads use a binary Content-Type (audio/webm, audio/mp4, etc).
      // Browsers consider these "non-simple" so they preflight; we must allow
      // Content-Type explicitly in the preflight response.
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }
  return {};
}

function jsonResponse(payload, status, corsHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// ---------- Route handler: /v1/messages (Claude chat) -----------------------
async function handleMessages(request, env, corsHeaders) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'Proxy not configured — missing ANTHROPIC_API_KEY secret' }, 500, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders);
  }
  const { model, system, messages, max_tokens } = body;
  if (!model || !messages || !Array.isArray(messages)) {
    return jsonResponse({ error: 'Missing required fields: model, messages' }, 400, corsHeaders);
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, system, messages, max_tokens: max_tokens || 1024 }),
    });
    const data = await upstream.json();
    return jsonResponse(data, upstream.status, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// ---------- Route handler: /v1/transcribe (Deepgram audio → text) -----------
async function handleTranscribe(request, env, corsHeaders) {
  if (!env.DEEPGRAM_API_KEY) {
    return jsonResponse({ error: 'Voice transcription not configured — missing DEEPGRAM_API_KEY secret' }, 500, corsHeaders);
  }

  // The request body IS the audio blob. We forward it verbatim to Deepgram.
  // Content-Type tells Deepgram what codec it is (audio/webm, audio/mp4, etc).
  const contentType = request.headers.get('Content-Type') || 'audio/webm';
  if (!contentType.startsWith('audio/')) {
    return jsonResponse({ error: `Expected audio/* Content-Type, got ${contentType}` }, 400, corsHeaders);
  }

  // Lightweight size guard. Cloudflare allows up to 100MB request bodies but
  // for short voice prompts anything over ~5MB is suspicious.
  const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
  if (contentLength > 5 * 1024 * 1024) {
    return jsonResponse({ error: 'Audio too large (max 5MB).' }, 413, corsHeaders);
  }

  // Deepgram REST endpoint. Nova-2 is the latest accurate model.
  // smart_format=true adds punctuation/capitalization.
  // Pricing: ~$0.0043/min for Nova-2 (free credit covers thousands of demos).
  const dgUrl = 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&language=en';

  try {
    const upstream = await fetch(dgUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.DEEPGRAM_API_KEY}`,
        'Content-Type': contentType,
      },
      // Stream the body straight through — no buffering, no JSON wrapping.
      body: request.body,
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return jsonResponse(
        { error: `Deepgram error (${upstream.status}): ${errText.slice(0, 200) || upstream.statusText}` },
        upstream.status >= 500 ? 502 : upstream.status,
        corsHeaders
      );
    }

    const data = await upstream.json();
    // Deepgram response shape: results.channels[0].alternatives[0].transcript
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    return jsonResponse({ transcript }, 200, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Transcription upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// ---------- Main dispatcher --------------------------------------------------
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const corsHeaders = cors(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');   // strip trailing slash

    if (request.method === 'GET') {
      return jsonResponse({
        status: 'ok',
        service: 'ASO Demo · Proxy',
        endpoints: ['POST /v1/messages (Claude chat)', 'POST /v1/transcribe (Deepgram audio→text)'],
        allowedOrigins: ALLOWED_ORIGINS,
      }, 200, corsHeaders);
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!allowed) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, {});
    }

    // Route + rate-limit
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // Routes:
    //   /v1/messages  → chat (with legacy fallback at "" or "/")
    //   /v1/transcribe → audio
    if (path === '/v1/transcribe') {
      const rl = checkRateLimit('transcribe', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleTranscribe(request, env, corsHeaders);
    }

    // Default: chat (covers /v1/messages AND legacy "/" POST for backward compat)
    if (path === '/v1/messages' || path === '' || path === '/') {
      const rl = checkRateLimit('messages', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleMessages(request, env, corsHeaders);
    }

    return jsonResponse({ error: `Unknown route: ${path}` }, 404, corsHeaders);
  },
};
