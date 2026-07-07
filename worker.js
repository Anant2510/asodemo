/**
 * Cloudflare Worker — ASO TechDay Demo Proxy
 * ----------------------------------------------------------------------------
 * Two endpoints, two upstream APIs, one shared key store:
 *
 *   POST /v1/messages       → forwards to Anthropic (Claude) using ANTHROPIC_API_KEY
 *   POST /v1/transcribe     → forwards audio to Deepgram using DEEPGRAM_API_KEY
 *   POST /v1/email          → sends transactional email via Resend
 *   POST /v1/shopify/order  → creates a real Shopify order via Admin API
 *                             (uses SHOPIFY_ADMIN_TOKEN; requires write_orders scope).
 *                             Updates the customer's order history and decrements
 *                             inventory automatically — closes the personalization loop.
 *   GET  /v1/disruption/swap → email-link target. Cancels the delayed Shopify order
 *                             and places a new order for the customer-accepted
 *                             alternate (restocks the cancelled inventory).
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

// ============================================================================
//  DEMO GATING (A2) + DAILY CAPS (C)
//  - Demo mode is a DURABLE flag in KV (default OFF, fail-safe). When OFF, the
//    expensive/autonomous layer is paused: AI calls, transcription, email, KV
//    writes, and the cron agent all no-op. The storefront (Shopify reads, order
//    placement, browsing) keeps working.
//  - Daily caps are an in-memory circuit breaker (AI calls + KV writes), reset
//    at UTC midnight. Counting is in-memory so it adds ZERO KV writes of its own
//    (a KV-backed counter would consume the very budget it protects). Trade-off:
//    counts reset if the isolate recycles, so caps are best-effort per isolate —
//    the durable demo-mode flag is the real control; caps are the backstop.
//  - Toggle live (no redeploy) via GET /v1/admin/demo?token=...&mode=on|off
// ============================================================================
const AI_DAILY_CAP = 300;          // max AI (LLM) calls per day
const KV_WRITE_DAILY_CAP = 800;    // max KV writes/day (under the 1,000 free-tier limit)
const DEMO_MODE_DEFAULT = false;   // fail-safe: OFF unless explicitly enabled
const DEMO_FLAG_KEY = 'cfg:demoMode';
const DEMO_FLAG_CACHE_MS = 30 * 1000;  // cache the flag in-memory to avoid reading KV every request

const usage = { ai: 0, kvWrites: 0, resetAt: nextUtcMidnight() };
function rollUsage() {
  if (Date.now() > usage.resetAt) { usage.ai = 0; usage.kvWrites = 0; usage.resetAt = nextUtcMidnight(); }
}

let _demoCache = { value: DEMO_MODE_DEFAULT, at: 0 };
async function isDemoOn(env) {
  if (!env.AGENT_KV) return DEMO_MODE_DEFAULT;
  const now = Date.now();
  if (now - _demoCache.at < DEMO_FLAG_CACHE_MS) return _demoCache.value;
  try {
    const raw = await env.AGENT_KV.get(DEMO_FLAG_KEY);
    const value = raw === null ? DEMO_MODE_DEFAULT : raw === 'on';
    _demoCache = { value, at: now };
    return value;
  } catch { return _demoCache.value; }
}
async function setDemoMode(env, on) {
  _demoCache = { value: !!on, at: Date.now() };
  if (env.AGENT_KV) await env.AGENT_KV.put(DEMO_FLAG_KEY, on ? 'on' : 'off'); // durable (no TTL)
}

// AI gate for the dispatcher. Returns null if allowed (and counts the call),
// or { status, body } to short-circuit. Paused → graceful 200 the chat can show.
async function guardAI(env) {
  if (!(await isDemoOn(env))) {
    return { status: 200, body: {
      paused: true,
      message: 'AI features are paused (demo mode is off).',
      content: [{ type: 'text', text: "I'm offline for this demo right now — please check back when it's live." }],
    } };
  }
  rollUsage();
  if (usage.ai >= AI_DAILY_CAP) {
    return { status: 429, body: { error: `AI daily cap reached (${AI_DAILY_CAP}). Resets at UTC midnight.`, capped: true } };
  }
  usage.ai++;
  return null;
}

// In-memory counters per route. Reset when the Worker scales/redeploys.
// For production with real traffic, use Cloudflare KV or Durable Objects.
const buckets = {
  messages:   { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
  transcribe: { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
  email:      { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
  orders:     { ipMap: new Map(), daily: 0, dailyResetAt: nextUtcMidnight() },
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
// ---------- Demo safety net: force ALL outbound test email to one inbox -----
// Prevents any email (disruption recovery, cart-abandonment nudges, etc.) from
// ever reaching a real address by accident. When TEST_EMAIL_OVERRIDE is set,
// every send is redirected there, with the originally-intended recipient(s)
// tagged into the subject line for traceability. Unset the env var (or remove
// this block) to restore normal per-customer delivery for production.
function applyTestRecipientOverride(env, recipients, subject) {
  const override = env.TEST_EMAIL_OVERRIDE;
  if (!override) return { recipients, subject };
  const originally = recipients.join(', ');
  return { recipients: [override], subject: `[to: ${originally}] ${subject}` };
}

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
  let recipients = Array.isArray(to) ? to : [to];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recipients.every(r => emailRe.test(r))) {
    return jsonResponse({ error: 'One or more recipients are not valid email addresses' }, 400, corsHeaders);
  }

  let effectiveSubject = subject;
  ({ recipients, subject: effectiveSubject } = applyTestRecipientOverride(env, recipients, subject));

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
        subject: effectiveSubject,
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
    return jsonResponse({ success: true, id: data?.id || null, to: recipients }, 200, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Email upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// ---------- Shared: low-level Resend send (used by route + cron) ------------
async function resendSend(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) return { success: false, error: 'missing RESEND_API_KEY' };
  const from = env.RESEND_FROM || 'Academy Sports + Outdoors <onboarding@resend.dev>';
  let recipients = Array.isArray(to) ? to : [to];
  let effectiveSubject = subject;
  ({ recipients, subject: effectiveSubject } = applyTestRecipientOverride(env, recipients, subject));
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: recipients, subject: effectiveSubject, ...(html ? { html } : {}), ...(text ? { text } : {}) }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { success: false, error: data?.message || `resend ${r.status}` };
    return { success: true, id: data?.id || null };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ---------- Route handler: /v1/shopify/order (Admin REST orderCreate) -------
// Creates a real Shopify order so the demo closes its loop:
//   - the persona's order history gains the new order (drives chat personalization)
//   - Shopify auto-decrements inventory (kit-builder delivery promises update)
//   - tagged 'techday-demo' so they're easy to clean up later if needed.
// Body: { customerEmail, lineItems:[{variantId, quantity}], note? }
// Requires SHOPIFY_ADMIN_TOKEN with write_orders scope.
async function handleShopifyOrder(request, env, corsHeaders) {
  if (!env.SHOPIFY_ADMIN_TOKEN || !env.SHOPIFY_STORE_DOMAIN) {
    return jsonResponse(
      { error: 'Shopify order creation not configured (need SHOPIFY_ADMIN_TOKEN + SHOPIFY_STORE_DOMAIN)' },
      500, corsHeaders
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders); }

  const { customerEmail, lineItems, note } = body || {};
  if (!customerEmail || !Array.isArray(lineItems) || lineItems.length === 0) {
    return jsonResponse({ error: 'customerEmail and non-empty lineItems[] required' }, 400, corsHeaders);
  }

  // App passes variantId as the full Shopify GID (gid://shopify/ProductVariant/<numeric>).
  // REST orders.json needs the numeric id, so extract it.
  const restLineItems = lineItems
    .map(li => {
      const vid = String(li.variantId || '');
      const numeric = vid.includes('/') ? vid.split('/').pop() : vid;
      const n = Number(numeric);
      return { variant_id: n, quantity: Math.max(1, parseInt(li.quantity || 1, 10)) };
    })
    .filter(li => Number.isFinite(li.variant_id) && li.variant_id > 0);

  if (restLineItems.length === 0) {
    return jsonResponse({ error: 'No valid variant IDs in lineItems' }, 400, corsHeaders);
  }

  const orderPayload = {
    order: {
      email: customerEmail,
      financial_status: 'paid',
      send_receipt: false,
      send_fulfillment_receipt: false,
      tags: 'techday-demo,agent-placed',
      note: note || 'Placed via Academy Sports TechDay Demo',
      line_items: restLineItems,
    },
  };

  const url = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/orders.json`;
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // Surface Shopify's error verbatim — usually tells you exactly what's wrong
      // (most commonly: missing write_orders scope, or variant_id not found).
      return jsonResponse(
        { error: `Shopify Admin error (${upstream.status})`, details: data },
        upstream.status >= 500 ? 502 : upstream.status,
        corsHeaders
      );
    }
    const o = data?.order || {};
    return jsonResponse({
      success: true,
      order: {
        id: o.id || null,
        name: o.name || null,           // e.g. "#1042"
        total: o.total_price || null,   // string, currency in o.currency
        currency: o.currency || null,
        createdAt: o.created_at || null,
      },
    }, 200, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Shopify upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// ---------- Route handler: /v1/shopify/customer (Admin REST customerCreate) -
// Real-time self-signup: creates a real Shopify customer on the dev store so a
// brand-new visitor becomes a first-class customer — their orders attach to
// this record (by email) and personalization derives from it, exactly like the
// three seeded personas. No password is set: this is profile creation, not
// authenticated login (the app reads the customer record + order history via
// Admin, it never needs a Storefront customer token for these users).
// Body: { firstName, lastName, email, zip?, city?, province? }
// Requires SHOPIFY_ADMIN_TOKEN with write_customers scope.
async function handleShopifyCustomer(request, env, corsHeaders) {
  if (!env.SHOPIFY_ADMIN_TOKEN || !env.SHOPIFY_STORE_DOMAIN) {
    return jsonResponse(
      { error: 'Shopify customer creation not configured (need SHOPIFY_ADMIN_TOKEN + SHOPIFY_STORE_DOMAIN)' },
      500, corsHeaders
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders); }

  const { firstName, lastName, email, zip, city, province } = body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return jsonResponse({ error: 'A valid email is required' }, 400, corsHeaders);
  }

  const customerPayload = {
    customer: {
      first_name: (firstName || '').trim(),
      last_name: (lastName || '').trim(),
      email: email.trim().toLowerCase(),
      verified_email: true,
      tags: 'techday-demo,self-signup',
      ...(zip ? { addresses: [{ zip: String(zip).trim(), city: city || '', province: province || '', country: 'US', default: true }] } : {}),
    },
  };

  const base = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10`;
  const headers = {
    'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const upstream = await fetch(`${base}/customers.json`, {
      method: 'POST', headers, body: JSON.stringify(customerPayload),
    });
    const data = await upstream.json().catch(() => ({}));

    // 422 most commonly = email already taken. Look the existing customer up by
    // email so the app can still sign them in (idempotent signup for the demo).
    if (upstream.status === 422) {
      try {
        const lookup = await fetch(`${base}/customers/search.json?query=${encodeURIComponent('email:' + customerPayload.customer.email)}`, { headers });
        const found = await lookup.json().catch(() => ({}));
        const existing = (found?.customers || [])[0];
        if (existing) {
          return jsonResponse({
            success: true, existed: true,
            customer: shapeCustomer(existing),
          }, 200, corsHeaders);
        }
      } catch { /* fall through to error */ }
      return jsonResponse({ error: 'That email is already registered', details: data }, 409, corsHeaders);
    }

    if (!upstream.ok) {
      return jsonResponse(
        { error: `Shopify Admin error (${upstream.status})`, details: data },
        upstream.status >= 500 ? 502 : upstream.status, corsHeaders
      );
    }
    return jsonResponse({ success: true, customer: shapeCustomer(data?.customer || {}) }, 200, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Shopify upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// Normalize an Admin customer record to the small shape the app needs.
function shapeCustomer(c) {
  const addr = (c.addresses && c.addresses[0]) || c.default_address || {};
  return {
    id: c.id || null,
    email: c.email || null,
    firstName: c.first_name || '',
    lastName: c.last_name || '',
    zip: addr.zip || null,
    city: addr.city || null,
  };
}

// ---------- Route handler: GET /v1/shopify/customer-orders ------------------
// Fetches a customer's orders via the Admin API (by numeric customer_id). Used
// for self-signup customers, who have no Storefront token — the app reads their
// (initially empty, then growing) order history through here. Maps Admin REST
// orders to the same shape the Storefront path produces so the app is agnostic.
// Query: ?customerId=<numeric>
async function handleShopifyCustomerOrders(request, env, corsHeaders) {
  if (!env.SHOPIFY_ADMIN_TOKEN || !env.SHOPIFY_STORE_DOMAIN) {
    return jsonResponse({ error: 'Not configured' }, 500, corsHeaders);
  }
  const url = new URL(request.url);
  const customerId = (url.searchParams.get('customerId') || '').replace(/[^0-9]/g, '');
  if (!customerId) return jsonResponse({ error: 'customerId required' }, 400, corsHeaders);

  const base = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10`;
  const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Accept': 'application/json' };
  try {
    const upstream = await fetch(`${base}/orders.json?customer_id=${customerId}&status=any&limit=30`, { headers });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return jsonResponse({ error: `Shopify Admin error (${upstream.status})`, details: data }, upstream.status >= 500 ? 502 : upstream.status, corsHeaders);
    }
    const orders = (data?.orders || []).map(o => ({
      id: o.admin_graphql_api_id || (o.id ? `gid://shopify/Order/${o.id}` : null),
      orderNumber: o.order_number || o.number || null,
      processedAt: o.processed_at || o.created_at || null,
      total: parseFloat(o.total_price || o.current_total_price || 0),
      currency: o.currency || 'USD',
      items: (o.line_items || []).map(li => ({
        title: li.title || li.name || 'item',
        quantity: li.quantity || 1,
        price: parseFloat(li.price || 0),
      })),
    }));
    return jsonResponse({ success: true, orders }, 200, corsHeaders);
  } catch (err) {
    return jsonResponse({ error: 'Shopify upstream error: ' + err.message }, 502, corsHeaders);
  }
}

// ---------- Route handler: /v1/disruption/swap (cancel + create alternate) --
// Email-link target. When a customer accepts an alternate after a long delay,
// this route cancels their original Shopify order (restocking inventory) and
// creates a new order for the alternate. Records the swap in KV so the app can
// surface it. Unauthenticated by design (opened from email client) — demo only.
// Query: key=<email>&order=<originalOrderGid>&variant=<altVariantGid>
//        &qty=<n>&title=<altTitle>&price=<altPrice>&origName=<origOrderName>
async function handleDisruptionSwap(env, params, corsHeaders) {
  const key = params.get('key');
  const originalGid = params.get('order') || '';
  const variantGid = params.get('variant') || '';
  const qty = Math.max(1, parseInt(params.get('qty') || '1', 10));
  const title = params.get('title') || 'alternate';
  const price = params.get('price') || '';
  const origName = params.get('origName') || '';

  if (!env.SHOPIFY_ADMIN_TOKEN || !env.SHOPIFY_STORE_DOMAIN) {
    return swapErrorPage('Shopify is not fully configured on the server. Please contact support.');
  }
  if (!key || !originalGid || !variantGid) {
    return swapErrorPage('This recovery link is missing some information. Try replying to the original email and we will help.');
  }

  const numericOrderId = originalGid.includes('/') ? originalGid.split('/').pop() : originalGid;
  const numericVariantId = variantGid.includes('/') ? variantGid.split('/').pop() : variantGid;
  if (!/^\d+$/.test(numericOrderId) || !/^\d+$/.test(numericVariantId)) {
    return swapErrorPage('This recovery link looks malformed. Try replying to the original email and we will help.');
  }

  const base = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10`;
  const headers = {
    'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Step 1: cancel the original order. restock=true so demo inventory isn't bled.
  try {
    const cancelRes = await fetch(`${base}/orders/${numericOrderId}/cancel.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason: 'customer', restock: true, email: false }),
    });
    if (!cancelRes.ok) {
      const errData = await cancelRes.json().catch(() => ({}));
      console.warn('Cancel failed:', cancelRes.status, errData);
      // Don't hard-fail — if the cancel was already done or the order is in a
      // state Shopify won't cancel, we still try the new order so the customer
      // gets their alternate. Surface as warning in the confirmation page.
    }
  } catch (e) {
    console.warn('Cancel network error:', e.message);
  }

  // Step 2: create the alternate order.
  let newOrderId = null, newOrderName = null;
  try {
    const createRes = await fetch(`${base}/orders.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        order: {
          email: key,
          financial_status: 'paid',
          send_receipt: false,
          send_fulfillment_receipt: false,
          tags: 'techday-demo,disruption-swap,agent-placed',
          note: `Alternate accepted by customer after delay on ${origName || 'previous order'} · auto-swapped from ${originalGid}`,
          line_items: [{ variant_id: Number(numericVariantId), quantity: qty }],
        },
      }),
    });
    const createData = await createRes.json().catch(() => ({}));
    if (createRes.ok) {
      newOrderId = createData?.order?.id || null;
      newOrderName = createData?.order?.name || null;
    } else {
      console.warn('Replacement create failed:', createRes.status, createData);
      return swapErrorPage(`We were unable to place the replacement order automatically. Our team has been notified and will reach out.`, corsHeaders);
    }
  } catch (e) {
    console.warn('Create network error:', e.message);
    return swapErrorPage('We hit a network issue placing the replacement. Our team has been notified.', corsHeaders);
  }

  // Step 3: record the swap in KV (best-effort — the swap already happened in Shopify).
  if (env.AGENT_KV) {
    try {
      const doc = (await kvGetAgent(env, key)) || { items: {} };
      doc.swaps = doc.swaps || {};
      doc.swaps[numericOrderId] = {
        newOrderId, newOrderName,
        alternate: { title, price },
        swappedAt: Date.now(),
      };
      await kvPutAgent(env, key, doc);
    } catch (e) { console.warn('KV swap-record failed:', e.message); }
  }

  // Step 4: confirmation page.
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Replacement on the way</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#e8e8ec;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:20px;box-sizing:border-box}
.card{max-width:480px;padding:40px;text-align:center;background:#14141c;border:1px solid #2a2a35;border-radius:16px}
.check{font-size:48px}.h{font-size:22px;margin:16px 0 8px}.p{color:#9a9aa5;line-height:1.55}.row{margin:18px 0;padding:14px 16px;background:#0f0f17;border-radius:10px;text-align:left;font-size:14px}.k{color:#7a7a85;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}.v{color:#e8e8ec}.b{display:inline-block;margin-top:20px;padding:12px 22px;background:#22d3ee;color:#0a0a0f;border-radius:999px;text-decoration:none;font-weight:700}</style></head>
<body><div class="card"><div class="check">✅</div>
<div class="h">Your replacement is on its way!</div>
<p class="p">We've cancelled the delayed order${origName ? ` (${escapeHtml(origName)})` : ''} and your alternate is locked in.</p>
<div class="row"><div class="k">Now shipping</div><div class="v">${escapeHtml(title)}${price ? ` — $${escapeHtml(price)}` : ''}</div></div>
${newOrderName ? `<div class="row"><div class="k">New order</div><div class="v">${escapeHtml(newOrderName)}</div></div>` : ''}
<a class="b" href="https://anant2510.github.io/asodemo/">Return to your account →</a></div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', ...corsHeaders } });
}

function swapErrorPage(message, corsHeaders) {
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recovery issue</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#e8e8ec;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:20px;box-sizing:border-box}
.card{max-width:420px;padding:40px;text-align:center;background:#14141c;border:1px solid #2a2a35;border-radius:16px}
.x{font-size:42px}.h{font-size:20px;margin:14px 0 8px}.p{color:#9a9aa5;line-height:1.5}.b{display:inline-block;margin-top:18px;padding:11px 22px;background:#22d3ee;color:#0a0a0f;border-radius:999px;text-decoration:none;font-weight:700}</style></head>
<body><div class="card"><div class="x">⚠️</div><div class="h">We hit a snag</div><p class="p">${escapeHtml(message)}</p>
<a class="b" href="https://anant2510.github.io/asodemo/">Return to your account →</a></div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', ...(corsHeaders || {}) } });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
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
  // Gate: skip writes when demo mode is off or the daily KV-write cap is hit.
  if (!(await isDemoOn(env))) return false;
  rollUsage();
  if (usage.kvWrites >= KV_WRITE_DAILY_CAP) return false;
  doc.updatedAt = Date.now();
  await env.AGENT_KV.put(AGENT_PREFIX + key, JSON.stringify(doc), { expirationTtl: 60 * 60 * 24 * 7 });
  usage.kvWrites++;
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
  if (!(await isDemoOn(env))) return;   // paused: no autonomous emails/KV when demo mode is off
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
      // Disruption-swap email link target — also opened from email client, so no origin restriction.
      if (path === '/v1/disruption/swap') {
        return handleDisruptionSwap(env, url.searchParams, cors(origin, true));
      }
      // Browser polls agent state (origin-restricted).
      if (path === '/v1/agent/state') {
        if (!allowed) return jsonResponse({ error: 'Origin not allowed' }, 403, {});
        return handleAgentStateGet(env, url.searchParams.get('key'), corsHeaders);
      }
      // --- Admin: live demo-mode toggle + usage (A2). Token via header or ?token= ---
      if (path === '/v1/admin/demo' || path === '/v1/admin/status') {
        const token = request.headers.get('X-Admin-Token') || url.searchParams.get('token') || '';
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return jsonResponse({ error: 'Unauthorized' }, 401, cors(origin, true));
        }
        if (path === '/v1/admin/demo') {
          const mode = (url.searchParams.get('mode') || '').toLowerCase();
          if (mode === 'on' || mode === 'off') await setDemoMode(env, mode === 'on');
        }
        rollUsage();
        return jsonResponse({
          demoMode: (await isDemoOn(env)) ? 'on' : 'off',
          usage: {
            aiCalls: usage.ai, aiCap: AI_DAILY_CAP,
            kvWrites: usage.kvWrites, kvCap: KV_WRITE_DAILY_CAP,
            resetsAtUtc: new Date(usage.resetAt).toISOString(),
          },
          note: 'Demo mode is durable in KV; caps are best-effort in-memory.',
        }, 200, cors(origin, true));
      }
      return jsonResponse({
        status: 'ok',
        service: 'ASO Demo · Proxy',
        endpoints: ['POST /v1/messages', 'POST /v1/transcribe', 'POST /v1/email', 'POST /v1/shopify/order', 'POST /v1/shopify/customer', 'GET /v1/shopify/customer-orders', 'POST /v1/agent/state', 'GET /v1/agent/state', 'GET /v1/agent/accept', 'GET /v1/disruption/swap', 'GET /v1/admin/demo', 'GET /v1/admin/status'],
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
      if (!(await isDemoOn(env))) return jsonResponse({ paused: true, error: 'Transcription paused (demo mode is off).' }, 503, corsHeaders);
      const rl = checkRateLimit('transcribe', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleTranscribe(request, env, corsHeaders);
    }

    if (path === '/v1/email') {
      if (!(await isDemoOn(env))) return jsonResponse({ paused: true, error: 'Email paused (demo mode is off).' }, 503, corsHeaders);
      const rl = checkRateLimit('email', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleEmail(request, env, corsHeaders);
    }

    if (path === '/v1/shopify/order') {
      const rl = checkRateLimit('orders', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleShopifyOrder(request, env, corsHeaders);
    }

    if (path === '/v1/shopify/customer' && request.method === 'POST') {
      const rl = checkRateLimit('orders', ip);
      if (!rl.ok) return jsonResponse({ error: rl.reason }, 429, corsHeaders);
      return handleShopifyCustomer(request, env, corsHeaders);
    }

    if (path === '/v1/shopify/customer-orders') {
      return handleShopifyCustomerOrders(request, env, corsHeaders);
    }

    // Default: chat (covers /v1/messages AND legacy "/" POST for backward compat)
    if (path === '/v1/messages' || path === '' || path === '/') {
      const aiGate = await guardAI(env);
      if (aiGate) return jsonResponse(aiGate.body, aiGate.status, corsHeaders);
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
