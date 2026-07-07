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
  email:      { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
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

// ---------- Route handler: /v1/email (Resend transactional send) ------------
// Sends a transactional email via Resend. Body: { to, subject, html, text?, replyTo? }
// FROM defaults to Resend's shared onboarding sender so no domain setup is needed.
async function handleEmail(request, env, corsHeaders) {
  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: 'Email not configured — missing RESEND_API_KEY secret' }, 500, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders);
  }

  const { to, subject, html, text } = body || {};
  if (!to || !subject || (!html && !text)) {
    return jsonResponse({ error: 'Missing required fields: to, subject, and html or text' }, 400, corsHeaders);
  }

  // Basic recipient sanity — only send to plausible email addresses.
  const recipients = Array.isArray(to) ? to : [to];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recipients.every(r => emailRe.test(r))) {
    return jsonResponse({ error: 'One or more recipients are not valid email addresses' }, 400, corsHeaders);
  }

  // FROM: use a configured sender if provided, else Resend's shared domain.
  const from = env.RESEND_FROM || 'Academy Sports + Outdoors <onboarding@resend.dev>';

  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return jsonResponse(
        { error: `Resend error (${upstream.status}): ${data?.message || upstream.statusText}` },
        upstream.status >= 500 ? 502 : upstream.status,
        corsHeaders
      );
    }
    return jsonResponse({ success: true, id: data?.id || null }, 200, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Email upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// ---------- Shared: low-level Resend send (used by route + cron) ------------
async function resendSend(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) return { success: false, error: 'missing RESEND_API_KEY' };
  const from = env.RESEND_FROM || 'Academy Sports + Outdoors <onboarding@resend.dev>';
  const recipients = Array.isArray(to) ? to : [to];
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: recipients, subject, ...(html ? { html } : {}), ...(text ? { text } : {}) }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { success: false, error: data?.message || `resend ${r.status}` };
    return { success: true, id: data?.id || null };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/* ===========================================================================
   AGENT STATE (KV-backed)
   The browser agent and the cron agent share one state document per persona,
   stored in KV under agent:<personaEmail>. Shape:
   {
     cart: [{ id, title, price, addedAt }],     // last reported by browser
     converted: bool, lastPurchaseAt,
     items: { [id]: { stage, lastEmailAt, acceptedAt } },  // escalation state
     updatedAt
   }
   ========================================================================== */
const AGENT_PREFIX = 'agent:';

async function kvGetAgent(env, key) {
  if (!env.AGENT_KV) return null;
  const raw = await env.AGENT_KV.get(AGENT_PREFIX + key);
  return raw ? JSON.parse(raw) : null;
}
async function kvPutAgent(env, key, doc) {
  if (!env.AGENT_KV) return false;
  doc.updatedAt = Date.now();
  await env.AGENT_KV.put(AGENT_PREFIX + key, JSON.stringify(doc), { expirationTtl: 60 * 60 * 24 * 7 });
  return true;
}

// POST /v1/agent/state — browser reports its cart/conversion snapshot.
// Body: { key, cart:[{id,title,price,addedAt}], converted, lastPurchaseAt }
async function handleAgentState(request, env, corsHeaders) {
  if (!env.AGENT_KV) return jsonResponse({ error: 'Agent storage not configured (bind AGENT_KV)' }, 500, corsHeaders);
  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'bad json' }, 400, corsHeaders); }
  const { key } = body || {};
  if (!key) return jsonResponse({ error: 'missing key' }, 400, corsHeaders);

  const existing = (await kvGetAgent(env, key)) || { items: {} };
  // Merge: keep escalation item-state, refresh cart + conversion from browser.
  const doc = {
    ...existing,
    cart: Array.isArray(body.cart) ? body.cart : (existing.cart || []),
    converted: body.converted ?? existing.converted ?? false,
    lastPurchaseAt: body.lastPurchaseAt ?? existing.lastPurchaseAt ?? null,
    items: existing.items || {},
  };
  await kvPutAgent(env, key, doc);
  return jsonResponse({ success: true, state: doc }, 200, corsHeaders);
}

// GET /v1/agent/state?key=... — browser reads back agent state (e.g. to learn
// the user clicked an email-offer link, so it can apply the discount in-app).
async function handleAgentStateGet(env, key, corsHeaders) {
  const doc = (await kvGetAgent(env, key)) || null;
  return jsonResponse({ state: doc }, 200, corsHeaders);
}

// GET /v1/agent/accept?key=...&item=...  — the email discount link target.
// Marks the item accepted (+ applies discount flag) and returns a friendly HTML page.
async function handleAgentAccept(env, key, itemId, corsHeaders) {
  if (!key) return new Response('Missing parameters.', { status: 400, headers: { 'Content-Type': 'text/html' } });
  const doc = (await kvGetAgent(env, key)) || { items: {} };
  doc.items = doc.items || {};
  doc.items[itemId] = { ...(doc.items[itemId] || {}), acceptedAt: Date.now(), discountApplied: true, stage: 'accepted' };
  await kvPutAgent(env, key, doc);
  // Friendly confirmation page (the app will also detect acceptance on next poll).
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offer applied</title>
  <style>body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#e8e8ec;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .card{max-width:420px;padding:40px;text-align:center;background:#14141c;border:1px solid #2a2a35;border-radius:16px}
  .check{font-size:48px}.h{font-size:22px;margin:16px 0 8px}.p{color:#9a9aa5;line-height:1.5}.b{display:inline-block;margin-top:20px;padding:12px 22px;background:#22d3ee;color:#0a0a0f;border-radius:999px;text-decoration:none;font-weight:700}</style></head>
  <body><div class="card"><div class="check">✅</div><div class="h">Your discount is applied!</div>
  <p class="p">We've locked in your offer. Head back to your cart to complete your order — the discount is waiting for you.</p>
  <a class="b" href="https://anant2510.github.io/asodemo/">Return to cart →</a></div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', ...corsHeaders } });
}

// ---------- Cron agent: scans all persona states, escalates abandoned carts --
// This is the "always-on" backend story. It works on what the browser has
// reported to KV (cart snapshots + conversion). It can't see a live in-memory
// cart, but once the browser syncs state, the cron carries on without the tab.
const ABANDON_STAGE1_MS = 30 * 60 * 1000;   // 30 min → highlights email
const ABANDON_STAGE2_MS = 2 * 60 * 60 * 1000; // 2 hr → discount email

async function runCronAgent(env) {
  if (!env.AGENT_KV) return;
  const list = await env.AGENT_KV.list({ prefix: AGENT_PREFIX });
  const now = Date.now();
  for (const k of list.keys) {
    const key = k.name.slice(AGENT_PREFIX.length);
    const doc = await kvGetAgent(env, key);
    if (!doc || doc.converted || !Array.isArray(doc.cart) || doc.cart.length === 0) continue;
    doc.items = doc.items || {};
    let changed = false;
    for (const item of doc.cart) {
      const age = now - (item.addedAt || now);
      const st = doc.items[item.id] || { stage: 'none', lastEmailAt: 0 };
      if (st.acceptedAt || st.stage === 'accepted' || st.stage === 'converted') continue;
      // Stage 2: discount (only if stage1 already sent and 2hr elapsed)
      if (age >= ABANDON_STAGE2_MS && st.stage === 'stage1') {
        const res = await resendSend(env, {
          to: key,
          subject: `Still thinking about the ${item.title}? Here's 10% off`,
          html: `<p>We saved your ${item.title} — and here's <strong>10% off</strong> if you complete your order in the next 30 minutes.</p><p><a href="${cronAcceptUrl(env, key, item.id)}">Apply my discount →</a></p><p>— The Academy Sports + Outdoors Team</p>`,
        });
        if (res.success) { doc.items[item.id] = { ...st, stage: 'stage2', lastEmailAt: now }; changed = true; }
      // Stage 1: highlights (first nudge)
      } else if (age >= ABANDON_STAGE1_MS && (st.stage === 'none' || !st.stage)) {
        const res = await resendSend(env, {
          to: key,
          subject: `You left the ${item.title} in your cart`,
          html: `<p>The ${item.title} is still in your cart. It's one of our top-rated picks — shoppers love it for quality and value.</p><p>Complete your order before it sells out.</p><p>— The Academy Sports + Outdoors Team</p>`,
        });
        if (res.success) { doc.items[item.id] = { ...st, stage: 'stage1', lastEmailAt: now }; changed = true; }
      }
    }
    if (changed) await kvPutAgent(env, key, doc);
  }
}

function cronAcceptUrl(env, key, itemId) {
  const base = env.PUBLIC_WORKER_URL || 'https://aso-demo-proxy.anant-jadon25.workers.dev';
  return `${base}/v1/agent/accept?key=${encodeURIComponent(key)}&item=${encodeURIComponent(itemId)}`;
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

    // --- GET routes (status + agent reads + email accept link) ---
    if (request.method === 'GET') {
      // Email discount link target — no origin restriction (opened from email client).
      if (path === '/v1/agent/accept') {
        return handleAgentAccept(env, url.searchParams.get('key'), url.searchParams.get('item') || 'cart', cors(origin, true));
      }
      // Browser polls agent state (origin-restricted).
      if (path === '/v1/agent/state') {
        if (!allowed) return jsonResponse({ error: 'Origin not allowed' }, 403, {});
        return handleAgentStateGet(env, url.searchParams.get('key'), corsHeaders);
      }
      return jsonResponse({
        status: 'ok',
        service: 'ASO Demo · Proxy',
        endpoints: ['POST /v1/messages', 'POST /v1/transcribe', 'POST /v1/email', 'POST /v1/agent/state', 'GET /v1/agent/state', 'GET /v1/agent/accept'],
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

    if (path === '/v1/agent/state') {
      return handleAgentState(request, env, corsHeaders);
    }

    if (path === '/v1/transcribe') {
      const rl = checkRateLimit('transcribe', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleTranscribe(request, env, corsHeaders);
    }

    if (path === '/v1/email') {
      const rl = checkRateLimit('email', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleEmail(request, env, corsHeaders);
    }

    // Default: chat (covers /v1/messages AND legacy "/" POST for backward compat)
    if (path === '/v1/messages' || path === '' || path === '/') {
      const rl = checkRateLimit('messages', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleMessages(request, env, corsHeaders);
    }

    return jsonResponse({ error: `Unknown route: ${path}` }, 404, corsHeaders);
  },

  // Cron trigger entry point — the "always-on" backend agent.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCronAgent(env));
  },
};
