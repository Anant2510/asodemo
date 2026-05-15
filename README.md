# Academy Sports + Outdoors · TechDay Demo

Persona-aware storefront with agentic features (conversational search, visual search, kit builder, A2UI chat) and a swap-ready commerce adapter (Mock / commercetools).

**Live URL:** https://anant2510.github.io/asodemo/

The AI chat is an A2UI agent — it doesn't just answer, it drives the storefront. You can search, filter, navigate, add to cart, and check out entirely through natural language.

## Prerequisites

- **Node.js 18+** — `node --version`. Install from https://nodejs.org if missing.
- **Git** — `git --version`. Install from https://git-scm.com if missing.
- A terminal (Terminal on Mac, PowerShell / Windows Terminal on Windows).

## Run locally

```bash
npm install        # one-time, ~60s
npm run dev        # http://localhost:5173
```

For stage demos, use the production build:

```bash
npm run build
npm run preview    # http://localhost:4173
```

---

## Architecture: how the AI chat is wired

The chat widget supports three transport modes, picked in this order:

### 1. PROXY MODE (recommended for any public deploy) ★

A Cloudflare Worker holds the Anthropic key server-side. The browser sends chat messages to the Worker; the Worker adds the key and forwards to Anthropic.

- ✅ Safe for public URLs — key never reaches the browser
- ✅ Won't get revoked by Anthropic's scanner (no key in client code)
- ✅ Built-in rate limiting (30 req/IP/hour, 500 req/day global cap)
- ✅ Works for anyone visiting the demo URL, not just you

**Setup (one-time, ~5 min):** see "Deploy the proxy" section below.

To use proxy mode locally: in `.env.local`, set:
```
VITE_PROXY_URL=https://your-worker.workers.dev
```

To use proxy mode in deploy: in GitHub repo → Settings → Secrets and variables → Actions → Variables tab → New repository variable:
- Name: `VITE_PROXY_URL`
- Value: your Cloudflare Worker URL

(This is a Variable, not a Secret — the URL is public anyway and gets visible in the bundle.)

### 2. DIRECT MODE (laptop dev only — exposes key)

`.env.local` holds your Anthropic key. Browser calls Anthropic directly. Anthropic may revoke the key if detected in browser traffic. Don't use this for public deploys.

```
VITE_ANTHROPIC_KEY=sk-ant-api03-...
```

### 3. SCRIPTED FALLBACK (no config required)

Without any config, chat uses keyword-matched canned responses. The demo always works regardless of network or proxy status.

### Resolution order

The app checks for config in this order:

1. `VITE_PROXY_URL` env var → proxy mode wins
2. `VITE_ANTHROPIC_KEY` env var → direct mode
3. `localStorage['aso_anthropic_key']` (set via Merch Tool paste field) → direct mode
4. Nothing → scripted fallback

The "LIVE · AI agent" pill in the Merch Tool tells you which mode is active.

---

## Deploy the proxy (Cloudflare Worker)

The proxy code lives in `worker.js` in the repo root (separate from the React app — it deploys to Cloudflare, not GitHub Pages).

### Steps

1. Go to https://dash.cloudflare.com → Workers & Pages → Create application → Create Worker
2. Name it something like `aso-demo-proxy`. Click Deploy with default "Hello World" code.
3. Click **Edit Code**. Delete the default code. Paste the entire contents of `worker.js`. Click **Deploy** in the top right.
4. Go to the Worker's **Settings → Variables and Secrets → Add**:
   - Type: **Secret** (not Variable — Secret encrypts it)
   - Name: `ANTHROPIC_API_KEY` (exact case)
   - Value: your `sk-ant-api03-...` key
5. Copy the Worker URL (looks like `https://aso-demo-proxy.username.workers.dev`)
6. Set it in your local `.env.local` (`VITE_PROXY_URL=...`) and as a GitHub Actions Variable (same name)

### Testing the proxy

Open the Worker URL in a browser. You should see JSON like `{"status":"ok","service":"ASO Demo · Anthropic Proxy",...}`. If you see that, it's alive.

### Updating the allowed origins

If you fork the repo or use a different domain, edit `ALLOWED_ORIGINS` at the top of `worker.js`. Otherwise the proxy will reject your calls with a 403.

### Adjusting rate limits

Top of `worker.js`:
- `RATE_LIMIT_PER_HOUR` — per-IP message cap (default 30)
- `DAILY_GLOBAL_CAP` — total messages all visitors per day (default 500)

For a high-traffic demo, bump these. For tight cost protection, lower them.

---

## Deploy to GitHub Pages

Pushes to `main` auto-deploy via `.github/workflows/deploy.yml`.

### First-time setup

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Anant2510/asodemo.git
git push -u origin main
```

In the GitHub UI: **Settings → Pages → Source → GitHub Actions**. Wait ~90 seconds for the first deploy.

### Re-deploying after changes

```bash
git add .
git commit -m "your message"
git push
```

Watch progress in the **Actions** tab.

---

## Wiring a real commercetools backend

Open `src/App.jsx`, find `CT_CONFIG`, fill in credentials. The CommercetoolsAdapter flips from STUB to LIVE automatically. Don't commit real credentials.

---

## Project structure

```
asodemo/
├── worker.js                       ← Cloudflare Worker proxy (deploy separately)
├── .env.local.example              ← copy to .env.local, fill in (gitignored)
├── .github/workflows/deploy.yml    ← GitHub Actions auto-deploy
├── index.html                      ← HTML entry
├── package.json
├── vite.config.js                  ← build config (GitHub Pages base path)
├── src/
│   ├── main.jsx                    ← React bootstrap
│   └── App.jsx                     ← the entire demo (~3800 lines)
└── dist/                           ← built output (gitignored)
```

---

## Troubleshooting

- **Blank page after Pages deploy** — check browser console. Asset 404s mean the `base` in `vite.config.js` doesn't match the repo name.
- **Chat shows SCRIPTED but I added `VITE_PROXY_URL`** — restart `npm run dev` after editing `.env.local`. For deploy, push a commit to trigger a rebuild.
- **Chat says "Origin not allowed"** — your domain isn't in the Worker's `ALLOWED_ORIGINS` array. Edit `worker.js`, re-deploy the Worker.
- **Chat says "Proxy not configured — missing ANTHROPIC_API_KEY secret"** — you deployed the Worker but didn't add the secret. Cloudflare → Worker → Settings → Variables and Secrets → Add as a **Secret** (not Variable).
- **Chat says "Rate limit reached"** — by design. Adjust `RATE_LIMIT_PER_HOUR` in `worker.js` if you need more.
- **Authentication on `git push`** — GitHub no longer accepts passwords. Use a Personal Access Token (Settings → Developer settings → Personal access tokens).
- **Port 5173 in use** — `npm run dev -- --port 3000`
