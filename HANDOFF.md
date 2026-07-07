# ASO TechDay Demo — Session Handoff

Paste this into the new chat to resume. The two code files (`App.jsx`, `worker.js`)
are the canonical current build — upload them in the new chat.

## What this is
Persona-aware storefront demo for an internal Academy Sports + Outdoors TechDay.
React/Vite static site on GitHub Pages + a Cloudflare Worker proxy. Live Shopify
integration (real customers, orders, inventory). 3 personas: Jake (hunter),
Maria (parent), Alex (fitness) + admin + guest.

## Deployment
- Repo: https://github.com/Anant2510/asodemo.git  (branch `main`, force-push deploy)
- Live: https://anant2510.github.io/asodemo/
- GitHub Actions builds on push (deploy.yml). Install step is `npm install` (NOT `npm ci`
  — switched because the macOS lockfile lacks Linux esbuild binaries).
- Worker: https://aso-demo-proxy.anant-jadon25.workers.dev (CF login Anant.jadon25@gmail.com)
- Shopify dev store: aso-techday-demo.myshopify.com (Basic App Dev plan)
- Mac project: ~/aso-techday-demo ; src/App.jsx is the canonical file.
- Deploy app:  git add src/App.jsx && git commit -m "..." && git push origin main --force
- Deploy worker: paste worker.js into CF dashboard → Edit code → Deploy.

## Worker secrets/bindings (Settings → Variables and Secrets)
- ANTHROPIC_API_KEY (secret) — Claude proxy
- DEEPGRAM_API_KEY (secret) — voice
- SHOPIFY_STOREFRONT_TOKEN = de86b20902517651488fadee3580f6ca
- SHOPIFY_STORE_DOMAIN = aso-techday-demo.myshopify.com
- RESEND_API_KEY (secret) — REQUIRED for emails. (Resend free tier, sends from onboarding@resend.dev)
- AGENT_KV — KV namespace binding. **NOT YET BOUND — this is the current blocker.**

## Live Shopify data (already provisioned, working)
- 3 customers, classic password login DemoPass123!, real order histories:
  - Jake  → anant.jadon25+jake@gmail.com (Houston 77027)
  - Maria → coforgeadobe@gmail.com (Plano 75024) — 7 orders, $676.88
  - Alex  → anant.2.singh@coforge.com (Cypress 77433)
- 70 products, 4 store locations (Shop, Houston Memorial 77024, Cypress 77433, Plano 75024).
- KEY CONSTRAINT: Storefront API Order type has NO `tags` field. Order dates are
  synthesized from order index (not processedAt — those are all stamped at setup time).
- Storefront customerAccessTokenCreate (classic email+password) works; Admin API customer
  access is plan-gated (PII). Token approach = Storefront token embedded in app (browser-safe).

## Features SHIPPED and working (verified live)
1. Commerce adapter pattern: Mock (default) / commercetools (stub) / Shopify (LIVE).
   Switch in Merch Tool → Commerce Adapter. Footer shows active adapter+mode.
2. Persona login auto-logs into Shopify when adapter=shopify; loads profile+orders.
3. Orders page (nav appears when shopifyOrders present): real orders, line items, dates,
   lifetime spend. Plus per-order "Simulate disruption: Delay / Cancel" buttons.
4. Chat: personalized WELCOME message + suggestion chips from real order history;
   answers grounded in purchase history (buildSystemPrompt injects it).
5. Kit Builder ("Plan with AI"): persona-aware sample prompts + intro; live delivery
   promise per item ("In stock at <store> · ships tomorrow") via getInventoryByLocation.
6. Disruption recovery emails (delay→re-evaluated ETA; cancel→in-stock alternate),
   AI-drafted, sent REAL via Worker→Resend to persona's gmail. Triggered from Orders
   page buttons AND a Merch Tool "Lifecycle & Disruption" admin panel.
7. Extra lifecycle emails in the admin panel: back-in-stock, win-back, price-drop.
8. AUTONOMOUS LIFECYCLE AGENT (just built):
   - Browser agent (useLifecycleAgent hook): polls cart, escalates abandoned items
     stage1 (highlights+reviews) → stage2 (10% discount email w/ accept link).
   - Detects checkout (markConverted) and email-link acceptance (polls KV) → applies
     10% cart discount in-app (cartDiscounts state, shown in CartPage totals).
   - Syncs cart snapshots to Worker KV so the CRON agent continues after tab close.
   - Worker cron (scheduled handler, every 2 min) escalates KV-known carts.
   - Worker routes: POST/GET /v1/agent/state, GET /v1/agent/accept (email link target
     → marks accepted + applies discount flag, returns confirmation HTML page).
   - Admin fast-forward lever in Lifecycle panel: Real-time / 1min≈1hr / 15sec≈1hr.

## CURRENT RESUME POINT (where we stopped)
Just finished building the autonomous agent (App.jsx 8894 lines, worker.js 456 lines,
both build clean). NOT yet deployed. Remaining steps for the user in Cloudflare:
1. **Bind KV namespace**: Worker → Bindings tab → Add binding → KV namespace →
   Variable name `AGENT_KV`, namespace `ASO_AGENT_KV` (create if needed). Bindings
   currently shows 0 — THIS IS THE BLOCKER.
2. **Add cron trigger**: Settings → Triggers → Add Cron → `*/2 * * * *`.
3. **Deploy new worker.js** (Edit code → paste → Deploy). Current deployed version is
   stale ("1 day ago") — does NOT have agent routes yet.
4. **Verify**: visit worker URL; status JSON should list /v1/agent/state and /v1/agent/accept.
5. **Deploy app**: push App.jsx.
6. **Smoke test**: Shopify+LIVE + Maria → Merch Tool set agent speed "15sec≈1hr" →
   add product to cart → ~8s stage1 email → ~30s discount email → click link →
   return to cart → 10% discount applied.

## Architecture caveat (be honest in demo)
Cron agent only sees carts AFTER the browser syncs them to KV (every 15s while open).
Can't observe a cart never reported. Everything else is genuinely functional.

## Key code landmarks in App.jsx
- LLM_CONFIG ~265; buildSystemPrompt ~329; ShopifyAdapter ~1324 (customerLogin,
  getCustomer, getCustomerOrders, getInventoryByLocation, getLocations)
- Personalization engine (sendEmail, draftPersonalizedEmail, pickAlternate,
  agentSyncState/agentReadState/agentAcceptUrl) ~1045
- PERSONAS ~ (has .shopify creds per persona)
- ChatWidget ~4388 (personalized welcome/chips useMemo)
- OrdersPage ~5917 (disruption buttons)
- DisruptionPanel ~ before MerchTool (admin lifecycle panel + fast-forward)
- KitBuilder (persona prompts, delivery promise)
- useLifecycleAgent + draftAbandonEmail ~ before App()
- App() ~8324: agentFastForward/agentConverted/cartDiscounts state, agent wiring,
  markConverted in context value ~8838

## Pending ideas discussed (not built)
Complementary cross-sell, replenishment timing, BOPIS pickup routing, size continuity,
loyalty milestone emails. All would plug into draftPersonalizedEmail scenarios.
