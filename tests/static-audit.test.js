import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const APP_SRC = fs.readFileSync(
  path.resolve('./src/App.jsx'),
  'utf-8'
);

describe('Static audit: model strings & config', () => {
  it('uses a current (non-retired) Claude model', () => {
    // Models retired before May 2026
    const retiredModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-haiku-20241022',
    ];
    // The comment ref in the file is OK; we only check uncommented uses
    const uncommented = APP_SRC
      .split('\n')
      .filter(line => !line.trim().startsWith('//'))
      .join('\n');
    for (const m of retiredModels) {
      expect(uncommented).not.toContain(m);
    }
  });

  it('LLM_CONFIG is defined with proxy + apiKey + enabled fields', () => {
    expect(APP_SRC).toContain('LLM_CONFIG');
    expect(APP_SRC).toContain('proxyUrl:');
    expect(APP_SRC).toContain('apiKey:');
    expect(APP_SRC).toContain('enabled:');
  });

  it('Worker URL is read from VITE_PROXY_URL env var', () => {
    expect(APP_SRC).toContain('VITE_PROXY_URL');
  });
});

describe('Static audit: catalog integrity', () => {
  // Parse the CATALOG array out of App.jsx
  const catalogMatch = APP_SRC.match(/^const CATALOG = \[([\s\S]*?)^\];/m);
  const catalogBody = catalogMatch?.[1] || '';
  const productIds = [...catalogBody.matchAll(/id: '([^']+)'/g)].map(m => m[1]);
  const photosArrays = [...catalogBody.matchAll(/photos: \[(.*?)\]/g)];

  it('CATALOG has exactly 70 products', () => {
    expect(productIds.length).toBe(70);
  });

  it('every product has a photos[] array', () => {
    expect(photosArrays.length).toBe(70);
  });

  it('every photos[] array has 4 URLs', () => {
    for (const m of photosArrays) {
      const urls = [...m[1].matchAll(/'https:\/\/[^']+'/g)];
      expect(urls.length, `photos[] should have 4 URLs (got ${urls.length})`).toBe(4);
    }
  });

  it('product IDs are unique', () => {
    expect(new Set(productIds).size).toBe(productIds.length);
  });

  it('every CATALOG ID exists in the _idToHandle map', () => {
    const mapMatch = APP_SRC.match(/this\._idToHandle = \{([\s\S]*?)\};/);
    const mapBody = mapMatch?.[1] || '';
    const mapIds = [...mapBody.matchAll(/^\s+(\w+):/gm)].map(m => m[1]);
    const cat = new Set(productIds);
    const map = new Set(mapIds);
    const missing = [...cat].filter(id => !map.has(id));
    expect(missing, `IDs in CATALOG missing from map: ${missing.join(', ')}`).toEqual([]);
  });

  it('HOME_TRAYS references only valid product IDs', () => {
    const traysMatch = APP_SRC.match(/^const HOME_TRAYS = \{([\s\S]*?)^\};/m);
    const traysBody = traysMatch?.[1] || '';
    const refs = [...traysBody.matchAll(/'([fhtcl][i]?\d{3})'/g)].map(m => m[1]);
    const cat = new Set(productIds);
    const missing = refs.filter(id => !cat.has(id));
    expect(missing, `HOME_TRAYS references missing IDs: ${missing.join(', ')}`).toEqual([]);
  });

  it('PDP_CONTENT references valid product IDs', () => {
    const pdpMatch = APP_SRC.match(/^const PDP_CONTENT = \{([\s\S]*?)^\};/m);
    const pdpBody = pdpMatch?.[1] || '';
    const refs = [...pdpBody.matchAll(/product: '([^']+)'/g)].map(m => m[1]);
    const cat = new Set(productIds);
    const missing = refs.filter(id => !cat.has(id));
    expect(missing).toEqual([]);
  });

  it('KIT_SCRIPTS references valid product IDs', () => {
    const kitMatch = APP_SRC.match(/^const KIT_SCRIPTS = \{([\s\S]*?)^\};/m);
    const kitBody = kitMatch?.[1] || '';
    const refs = [...kitBody.matchAll(/id: '([fhtcl][i]?\d{3})'/g)].map(m => m[1]);
    const cat = new Set(productIds);
    const missing = [...new Set(refs)].filter(id => !cat.has(id));
    expect(missing).toEqual([]);
  });

  it('every product has a price > 0', () => {
    const prices = [...catalogBody.matchAll(/price: ([\d.]+)/g)].map(m => parseFloat(m[1]));
    expect(prices.length).toBe(70);
    for (const p of prices) {
      expect(p).toBeGreaterThan(0);
    }
  });

  it('every product has a rating between 0 and 5', () => {
    const ratings = [...catalogBody.matchAll(/rating: ([\d.]+)/g)].map(m => parseFloat(m[1]));
    expect(ratings.length).toBe(70);
    for (const r of ratings) {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(5);
    }
  });
});

describe('Static audit: LLM functions', () => {
  it('callLLM is defined', () => {
    expect(APP_SRC).toMatch(/async function callLLM\(/);
  });
  it('callLLMForImage is defined and accepts base64 + mediaType', () => {
    expect(APP_SRC).toMatch(/async function callLLMForImage\(base64Image, mediaType\)/);
  });
  it('callLLMForKit is defined', () => {
    expect(APP_SRC).toMatch(/async function callLLMForKit\(/);
  });
  it('callLLMForMerch is defined', () => {
    expect(APP_SRC).toMatch(/async function callLLMForMerch\(/);
  });
  it('all 4 LLM functions check LLM_CONFIG.enabled', () => {
    const count = (APP_SRC.match(/if \(!LLM_CONFIG\.enabled\)/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(4);
  });
  it('all 4 LLM functions use anthropic-version header', () => {
    const count = (APP_SRC.match(/'anthropic-version': '2023-06-01'/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

describe('Static audit: action handlers', () => {
  const actionTypes = ['navigate', 'openProduct', 'setPersona', 'addToCart', 'applyFilter', 'viewCart', 'checkout', 'clearCart', 'removeFromCart'];
  for (const t of actionTypes) {
    it(`executeActions handles "${t}"`, () => {
      expect(APP_SRC).toContain(`case '${t}':`);
    });
  }
  it('action loop validates inputs before navigating', () => {
    // openProduct should only fire if action.id is provided
    expect(APP_SRC).toMatch(/case 'openProduct':\s*if \(action\.id\)/);
  });
  it('checkout clears the cart after the confirmation animation', () => {
    // After the 4-second confirmation animation, the cart should be cleared
    expect(APP_SRC).toMatch(/clearCart\(\)/);
  });
  it('system prompt documents clearCart action', () => {
    expect(APP_SRC).toContain('"type": "clearCart"');
  });
  it('system prompt documents removeFromCart action', () => {
    expect(APP_SRC).toContain('"type": "removeFromCart"');
  });
  it('system prompt lists category values explicitly', () => {
    expect(APP_SRC).toContain('"hunting"');
    expect(APP_SRC).toContain('"team-sports"');
    expect(APP_SRC).toContain('"fitness"');
    expect(APP_SRC).toContain('"camping"');
    expect(APP_SRC).toContain('"fishing"');
  });
});

describe('Static audit: facet matchers (chat-driven filtering)', () => {
  // The LLM can issue applyFilter with facetId: 'category' or 'tag'.
  // If matchers for these don't exist, the page CRASHES at runtime
  // when the filter loop tries to call an undefined function.
  it('FACET_MATCHERS has matcher for "category"', () => {
    expect(APP_SRC).toMatch(/FACET_MATCHERS = \{[\s\S]*?category: \(product, value\)/);
  });
  it('FACET_MATCHERS has matcher for "tag"', () => {
    expect(APP_SRC).toMatch(/FACET_MATCHERS = \{[\s\S]*?tag: \(product, value\)/);
  });
  it('FACET_MATCHERS has matcher for "subcategory"', () => {
    expect(APP_SRC).toMatch(/FACET_MATCHERS = \{[\s\S]*?subcategory:/);
  });
  it('FACET_MATCHERS has matcher for "brand"', () => {
    expect(APP_SRC).toMatch(/FACET_MATCHERS = \{[\s\S]*?brand:/);
  });
  it('FACET_MATCHERS has matcher for "price"', () => {
    expect(APP_SRC).toMatch(/FACET_MATCHERS = \{[\s\S]*?price:/);
  });
  it('counts loop has defensive guard against undefined matchers', () => {
    // Prevent "X is not a function" crashes when a facetId has no matcher
    expect(APP_SRC).toContain('if (!matcher) continue;');
    expect(APP_SRC).toContain('ownMatcher ? ownMatcher(p, value) : true');
  });
  it('CategoryPage refetches when activeCategory changes (not just adapterId)', () => {
    expect(APP_SRC).toMatch(/useEffect\(\(\) => \{[\s\S]*?adapter\.getProducts\(\{ category: activeCategory \}\)[\s\S]*?\}, \[adapterId, activeCategory\]\)/);
  });
  it('pendingFilter with facetId="category" updates activeCategory (not facet set)', () => {
    expect(APP_SRC).toContain("pendingFilter.facetId === 'category'");
    expect(APP_SRC).toContain('setActiveCategory(pendingFilter.value)');
  });
});

describe('Static audit: visual search error handling', () => {
  it('processFile compresses images before sending', () => {
    expect(APP_SRC).toContain('compressImage');
    expect(APP_SRC).toContain('await compressImage(file)');
  });

  it('compressImage caps at 1024px max edge', () => {
    expect(APP_SRC).toContain('const maxEdge = 1024');
  });

  it('callLLMForImage returns tagged errors instead of null', () => {
    // Should return { error: 'disabled' } / { error: 'http_404' } / etc.
    expect(APP_SRC).toMatch(/return \{ error: 'disabled' \}/);
    expect(APP_SRC).toMatch(/return \{ error: `http_\$\{response\.status\}`/);
  });

  it('processFile honestly reports when AI fallback was used', () => {
    expect(APP_SRC).toContain('usedFallback');
  });
});

describe('Static audit: camera capture lifecycle', () => {
  it('startCamera uses facingMode: environment (rear cam on mobile)', () => {
    expect(APP_SRC).toMatch(/facingMode: \{ ideal: 'environment' \}/);
  });

  it('camera releases tracks on stop', () => {
    expect(APP_SRC).toMatch(/streamRef\.current\.getTracks\(\)\.forEach\(t => t\.stop\(\)\)/);
  });

  it('camera cleanup runs on unmount via useEffect', () => {
    // The unmount cleanup should reference the same stop pattern
    const stopOccurrences = (APP_SRC.match(/streamRef\.current\.getTracks\(\)\.forEach\(t => t\.stop\(\)\)/g) || []).length;
    expect(stopOccurrences).toBeGreaterThanOrEqual(2);
  });

  it('camera permission denial is handled', () => {
    expect(APP_SRC).toContain('NotAllowedError');
  });

  it('no camera detected is handled', () => {
    expect(APP_SRC).toContain('NotFoundError');
  });
});

describe('Static audit: Shopify adapter', () => {
  it('Shopify adapter exists', () => {
    expect(APP_SRC).toContain('class ShopifyAdapter');
  });
  it('Shopify adapter has _idToHandle map with 70 entries', () => {
    const mapMatch = APP_SRC.match(/this\._idToHandle = \{([\s\S]*?)\};/);
    const entries = [...(mapMatch?.[1] || '').matchAll(/^\s+\w+: '/gm)];
    expect(entries.length).toBe(70);
  });
  it('Shopify adapter falls back to mock on lookup failure', () => {
    expect(APP_SRC).toContain('new MockAdapter().getProduct(id)');
  });
  it('Shopify adapter extracts all images, not just first', () => {
    expect(APP_SRC).toContain('node.images?.edges || []).map');
  });
});

describe('Static audit: Merch AI offline bug fix', () => {
  it('llmEnabled state initializes from LLM_CONFIG.enabled (not just apiKey)', () => {
    expect(APP_SRC).toMatch(/useState\(LLM_CONFIG\.enabled\)/);
  });
  it('setLlmKey preserves enabled state when proxy is configured', () => {
    expect(APP_SRC).toMatch(/enabled = Boolean\(LLM_CONFIG\.proxyUrl \|\| clean\)/);
  });
});

describe('Static audit: persona name mappings in prompts', () => {
  // Users say "Jake" and "Maria" — not the technical keys "hunter" and "parent".
  // Both system prompts must teach Claude the mapping so it doesn't ask for clarification.
  it('shopper chat prompt mentions Jake → hunter mapping', () => {
    expect(APP_SRC).toMatch(/"hunter".*Jake/);
  });
  it('shopper chat prompt mentions Maria → parent mapping', () => {
    expect(APP_SRC).toMatch(/"parent".*Maria/);
  });
  it('shopper chat prompt mentions Alex → fitness mapping', () => {
    expect(APP_SRC).toMatch(/"fitness".*Alex/);
  });
  it('merch prompt has dedicated PERSONA NAMES section', () => {
    expect(APP_SRC).toContain('PERSONA NAMES');
  });
  it('merch prompt mentions all three human names', () => {
    expect(APP_SRC).toMatch(/Jake/);
    expect(APP_SRC).toMatch(/Maria/);
    expect(APP_SRC).toMatch(/Alex/);
  });
  it('persona definitions still have name fields (data source of truth)', () => {
    expect(APP_SRC).toMatch(/hunter:.*name: 'Jake'/);
    expect(APP_SRC).toMatch(/parent:.*name: 'Maria'/);
    expect(APP_SRC).toMatch(/fitness:.*name: 'Alex'/);
  });
});

describe('Static audit: per-category Merch Tool', () => {
  // Earlier, pinned SKUs were a flat array hardcoded to hunting only.
  // The Merch Tool now manages 5 categories independently.
  it('CATEGORY_LIST is defined with all 5 categories', () => {
    expect(APP_SRC).toContain("id: 'hunting'");
    expect(APP_SRC).toContain("id: 'team-sports'");
    expect(APP_SRC).toContain("id: 'fitness'");
    expect(APP_SRC).toContain("id: 'camping'");
    expect(APP_SRC).toContain("id: 'fishing'");
  });
  it('pinnedByCategory state replaces flat pinnedSkus', () => {
    expect(APP_SRC).toContain('pinnedByCategory');
  });
  it('default pinned state includes empty slots for non-hunting categories', () => {
    // Ensures the merch tool renders 5 panels not just 1
    expect(APP_SRC).toMatch(/pinnedByCategory.*=.*useState\(\{[\s\S]*hunting:[\s\S]*['"]team-sports['"]:[\s\S]*fitness:[\s\S]*camping:[\s\S]*fishing:/);
  });
  it('Merch tool renders one panel per category', () => {
    expect(APP_SRC).toContain('CATEGORY_LIST.map');
  });
  it('CategoryPinAdder component exists for manual per-category pinning', () => {
    expect(APP_SRC).toContain('CategoryPinAdder');
  });
  it('top nav uses categories dropdown (not hardcoded Hunting)', () => {
    expect(APP_SRC).toContain('NavCategoriesDropdown');
    // The hardcoded ['category', 'Hunting'] tuple should be gone
    expect(APP_SRC).not.toMatch(/\['category', 'Hunting'\]/);
  });
  it('PDP back link is dynamic (not "← Hunting")', () => {
    expect(APP_SRC).not.toContain('← Hunting</button>');
    expect(APP_SRC).toContain("CATEGORY_LIST.find(c => c.id === product.category)");
  });
  it('Merch prompt documents per-category pinning', () => {
    expect(APP_SRC).toContain('Pinned SKUs are managed independently per category');
  });
  it('Merch prompt lists all 5 categories', () => {
    // Already partially covered, but explicitly check the merch prompt section
    expect(APP_SRC).toMatch(/=== CATEGORIES ===[\s\S]*hunting[\s\S]*team-sports[\s\S]*fitness[\s\S]*camping[\s\S]*fishing/);
  });
});

describe('Static audit: pinSkus suggestion routing', () => {
  it('applySuggestion groups pinned SKUs by their catalog category', () => {
    // Inferring category from each product means a mixed-category suggestion
    // routes correctly without explicit category fields
    expect(APP_SRC).toMatch(/grouped\[cat\] = grouped\[cat\] \|\| \[\]/);
  });
  it('applySuggestion respects explicit suggestion.category as fallback', () => {
    expect(APP_SRC).toContain('suggestion.category');
  });
  it('unpinSkus removes the SKU from whichever category it lives in', () => {
    expect(APP_SRC).toContain('skusToRemove');
  });
});

describe('Static audit: authentication', () => {
  it('DEMO_USERS map has 4 users (3 customers + 1 admin)', () => {
    expect(APP_SRC).toMatch(/DEMO_USERS = \{[\s\S]*?jake:[\s\S]*?maria:[\s\S]*?alex:[\s\S]*?admin:/);
  });
  it('each customer username matches password (case-insensitive)', () => {
    expect(APP_SRC).toMatch(/jake:\s*\{[\s\S]*?username: 'jake'[\s\S]*?password: 'jake'/);
    expect(APP_SRC).toMatch(/maria:\s*\{[\s\S]*?username: 'maria'[\s\S]*?password: 'maria'/);
    expect(APP_SRC).toMatch(/alex:\s*\{[\s\S]*?username: 'alex'[\s\S]*?password: 'alex'/);
  });
  it('admin uses admin/admin credentials', () => {
    expect(APP_SRC).toMatch(/admin:\s*\{[\s\S]*?username: 'admin'[\s\S]*?password: 'admin'/);
  });
  it('only admin has role "admin"', () => {
    expect(APP_SRC).toMatch(/admin:\s*\{[\s\S]*?role: 'admin'/);
    expect(APP_SRC).toMatch(/jake:\s*\{[\s\S]*?role: 'customer'/);
  });
  it('each customer is mapped to a specific persona', () => {
    expect(APP_SRC).toMatch(/jake:[\s\S]*?persona: 'hunter'/);
    expect(APP_SRC).toMatch(/maria:[\s\S]*?persona: 'parent'/);
    expect(APP_SRC).toMatch(/alex:[\s\S]*?persona: 'fitness'/);
  });
  it('App gates rendering behind auth (LoginPage when no user)', () => {
    expect(APP_SRC).toContain('!user ?');
    expect(APP_SRC).toContain('<LoginPage />');
  });
  it('LoginPage component is defined', () => {
    expect(APP_SRC).toMatch(/const LoginPage = \(\) =>/);
  });
  it('AccessDenied component is defined for restricted routes', () => {
    expect(APP_SRC).toMatch(/const AccessDenied = \(\) =>/);
  });
  it('Merch route is admin-only (AccessDenied for non-admin)', () => {
    expect(APP_SRC).toMatch(/view === 'merch'[\s\S]*?user\.role === 'admin'[\s\S]*?<MerchTool[\s\S]*?<AccessDenied/);
  });
  it('PersonaSwitcher only renders for admin users', () => {
    expect(APP_SRC).toContain('isAdmin && <PersonaSwitcher');
  });
  it('Merch Tool nav link is hidden for customer accounts', () => {
    expect(APP_SRC).toContain("isAdmin");
    expect(APP_SRC).toMatch(/isAdmin[\s\S]*?\['merch', 'Merch Tool'\][\s\S]*?\[\['kit', 'Plan with AI'\]\]/);
  });
  it('setPersona action checks for admin role (customers locked to their persona)', () => {
    expect(APP_SRC).toMatch(/case 'setPersona':[\s\S]*?user\?\.role === 'admin'/);
  });
  it('auth state persists via localStorage', () => {
    expect(APP_SRC).toContain('AUTH_STORAGE_KEY');
    expect(APP_SRC).toContain('loadStoredUser');
    expect(APP_SRC).toContain('storeUser');
  });
  it('logout clears cart and resets transient state', () => {
    expect(APP_SRC).toMatch(/const logout = \(\) => \{[\s\S]*?setUser\(null\)[\s\S]*?setCart\(\[\]\)/);
  });
  it('UserPill component shows current user with sign-out', () => {
    expect(APP_SRC).toMatch(/const UserPill =/);
    expect(APP_SRC).toContain('Sign out');
  });
});

describe('Static audit: anonymous (guest) browsing', () => {
  it('ANON_USER sentinel exists', () => {
    expect(APP_SRC).toContain('ANON_USER');
    expect(APP_SRC).toMatch(/role: 'anonymous'/);
    expect(APP_SRC).toMatch(/persona: null/);
  });
  it('continueAsGuest function sets anonymous user with null persona', () => {
    expect(APP_SRC).toContain('continueAsGuest');
    expect(APP_SRC).toMatch(/continueAsGuest = \(\) => \{[\s\S]*?setUser\(ANON_USER\)[\s\S]*?setPersona\(null\)/);
  });
  it('goToSignIn preserves cart (unlike logout)', () => {
    expect(APP_SRC).toContain('goToSignIn');
    // Should NOT have setCart([]) in the goToSignIn function body
    const match = APP_SRC.match(/const goToSignIn = \(\) => \{([\s\S]*?)\};/);
    expect(match).toBeTruthy();
    expect(match[1]).not.toContain('setCart');
  });
  it('logout still clears cart (different from goToSignIn)', () => {
    const match = APP_SRC.match(/const logout = \(\) => \{([\s\S]*?)\};/);
    expect(match).toBeTruthy();
    expect(match[1]).toContain('setCart([])');
  });
  it('LoginPage has Continue as guest button', () => {
    expect(APP_SRC).toContain('Continue as guest');
  });
  it('SignInButton component renders for anonymous users', () => {
    expect(APP_SRC).toMatch(/const SignInButton =/);
    expect(APP_SRC).toContain('isAnon ? <SignInButton');
  });
  it('personaKey helper resolves null persona to guest', () => {
    expect(APP_SRC).toContain('const personaKey');
    expect(APP_SRC).toMatch(/personaKey = \(p\) => p && PERSONAS\[p\] \? p : 'guest'/);
  });
  it('PERSONAS map includes guest entry', () => {
    expect(APP_SRC).toMatch(/guest: \{ id: 'guest', name: 'Guest'/);
  });
  it('HOME_TRAYS has guest entry with cross-category items', () => {
    expect(APP_SRC).toMatch(/HOME_TRAYS = \{[\s\S]*?guest: \[/);
  });
  it('HOME_HEROES has guest entry', () => {
    expect(APP_SRC).toMatch(/HOME_HEROES = \{[\s\S]*?guest: \{/);
  });
  it('CATEGORY_BANNERS has guest entry', () => {
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?guest: \{/);
  });
  it('HOME_EDITORIAL has guest entry inviting sign-in', () => {
    expect(APP_SRC).toMatch(/HOME_EDITORIAL = \{[\s\S]*?guest: \{/);
    expect(APP_SRC).toContain('Sign in for a personalized experience');
  });
  it('PDP_CONTENT has guest entry with null personaModule', () => {
    expect(APP_SRC).toMatch(/PDP_CONTENT = \{[\s\S]*?guest: \{[\s\S]*?personaModule: null/);
  });
  it('HomePage uses personaKey instead of raw persona', () => {
    expect(APP_SRC).toMatch(/HomePage = \(\) => \{[\s\S]*?const pKey = personaKey\(persona\)/);
  });
  it('CategoryPage uses personaKey instead of raw persona', () => {
    expect(APP_SRC).toMatch(/CategoryPage = \(\) => \{[\s\S]*?const pKey = personaKey\(persona\)/);
  });
  it('PDPPage uses personaKey instead of raw persona', () => {
    expect(APP_SRC).toMatch(/PDPPage = \(\) => \{[\s\S]*?const pKey = personaKey\(persona\)/);
  });
  it('PDP shows "Sign in for personalized picks" callout for anonymous', () => {
    expect(APP_SRC).toContain('Sign in for personalized picks');
  });
  it('CategoryPage falls back to rating-sort for anonymous (no persona signal)', () => {
    expect(APP_SRC).toMatch(/Anonymous:[\s\S]*?rating[\s\S]*?reviews/);
  });
  it('PDP cross-sell hidden for anonymous users', () => {
    expect(APP_SRC).toMatch(/!isAnon && \(\s*<PDPModule[\s\S]*?Cross-sell/);
  });
  it('storage roundtrip handles anonymous user', () => {
    expect(APP_SRC).toContain("parsed?.anonymous");
    expect(APP_SRC).toMatch(/user\.role === 'anonymous'/);
  });
});


describe('Static audit: voice on banner editor', () => {
  it('Merch Tool banner editor has VoiceMicButton', () => {
    // Banner editor draft state uses setDraft as the voice target
    expect(APP_SRC).toMatch(/<VoiceMicButton[^>]*setValue=\{setDraft\}/);
  });
  it('All 4 AI text-input surfaces have voice (chat, kit, merch chat, banner editor)', () => {
    const matches = APP_SRC.match(/<VoiceMicButton/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Static audit: AI agent rebrand (no user-visible Claude mentions)', () => {
  // Goal: UI shouldn't expose the underlying LLM vendor name. Internals (model
  // string, API headers, code comments, console logs) are exempt.
  it('does not contain "Claude" in user-visible strings', () => {
    const lines = APP_SRC.split('\n');
    let inBlockComment = false;
    const violations = [];
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (raw.includes('/*') && !raw.includes('*/')) inBlockComment = true;
      if (inBlockComment) { if (raw.includes('*/')) inBlockComment = false; continue; }
      const trimmed = raw.trimStart();
      if (trimmed.startsWith('//')) continue;
      if (trimmed.startsWith('*')) continue;
      if (raw.includes('console.')) continue;
      if (raw.includes('claude-sonnet')) continue;
      if (raw.includes('api.anthropic.com')) continue;
      if (raw.includes('console.anthropic.com')) continue;
      if (raw.includes('anthropic-version')) continue;
      if (raw.includes('anthropic-dangerous')) continue;
      if (/\bClaude\b|\bCLAUDE\b/.test(raw)) {
        violations.push(`L${i+1}: ${raw.trim().slice(0, 120)}`);
      }
    }
    expect(violations, `Found user-visible Claude refs:\n${violations.join('\n')}`).toEqual([]);
  });
  it('Chat status pill says "AI AGENT" (not "CLAUDE")', () => {
    expect(APP_SRC).toContain('>AI AGENT<');
  });
  it('Merch panel status pill says "AI AGENT · READS LIVE STATE"', () => {
    expect(APP_SRC).toContain('AI AGENT · READS LIVE STATE');
  });
  it('thinking indicator says "AI agent is thinking"', () => {
    expect(APP_SRC).toContain('AI agent is thinking');
  });
  it('LIVE pill in admin says "AI agent via secure proxy"', () => {
    expect(APP_SRC).toContain('LIVE · AI agent via secure proxy');
  });
});

describe('Static audit: category banner + facet bugs (regression)', () => {
  // Bug: banner showed "Deer Season Essentials" (hunting) even when browsing fitness.
  // Root cause: CATEGORY_BANNERS was keyed by persona, not category.
  it('CATEGORY_BANNERS is keyed by CATEGORY id, not persona id', () => {
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?hunting: \{/);
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?fitness: \{/);
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?camping: \{/);
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?fishing: \{/);
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?['"]team-sports['"]:/);
  });
  it('CATEGORY_BANNERS includes a default fallback', () => {
    expect(APP_SRC).toMatch(/CATEGORY_BANNERS = \{[\s\S]*?default: \{/);
  });
  it('resolveCategoryBanner helper combines category + persona', () => {
    expect(APP_SRC).toContain('const resolveCategoryBanner');
    expect(APP_SRC).toContain('subByPersona');
  });
  it('CategoryPage banner uses resolveCategoryBanner (not persona-keyed lookup)', () => {
    expect(APP_SRC).toContain('resolveCategoryBanner(activeCategory, persona)');
    // Should NOT be reading from CATEGORY_BANNERS[pKey] directly
    expect(APP_SRC).not.toMatch(/const banner = CATEGORY_BANNERS\[pKey\]/);
  });

  // Bug: hunting-specific Type/Brand/Season filters appeared on all category pages.
  // Root cause: facets array was hardcoded with hunting values.
  it('facets are derived from loaded products (not hardcoded hunting list)', () => {
    expect(APP_SRC).toContain('const facets = useMemo');
    expect(APP_SRC).toContain('subSet.add(p.subcategory)');
    expect(APP_SRC).toContain('brandSet.add(p.brand)');
  });
  it('Season facet only renders when activeCategory === hunting', () => {
    expect(APP_SRC).toMatch(/if \(activeCategory === 'hunting'\) \{[\s\S]*?Season/);
  });
  it('Type/Brand facets are NOT hardcoded inside CategoryPage anymore', () => {
    // The CategoryPage component must build facets dynamically. The legacy
    // adapter `_facetsFor()` method may still have hardcoded values but it
    // is no longer consumed by the page (dead-code but harmless).
    // We assert by checking the dynamic derivation is in place, not by
    // absence of the strings (which still appear in dead-code).
    expect(APP_SRC).toMatch(/const facets = useMemo\(\(\) => \{[\s\S]*?subSet\.add/);
    expect(APP_SRC).toMatch(/const facets = useMemo\(\(\) => \{[\s\S]*?brandSet\.add/);
  });
  it('emphasized facet is hunting-specific only when both persona+category match', () => {
    expect(APP_SRC).toContain("persona === 'hunter' && activeCategory === 'hunting'");
  });

  // Bug: chat replied "Here are some top fitness picks" but no products appeared.
  // Fix: prompt now requires showResults + applyFilter together for category requests.
  it('chat prompt requires both showResults AND applyFilter for category-switch requests', () => {
    expect(APP_SRC).toMatch(/return BOTH a showResults action AND an applyFilter/);
  });
  it('chat prompt explicitly forbids saying "here are picks" without showResults', () => {
    expect(APP_SRC).toMatch(/NEVER say "here are some picks" in the message without including a showResults action/);
  });
});

describe('Static audit: persona-weighted showResults picks (chat/page consistency)', () => {
  // Goal: when chat returns showResults AND a category navigation happens,
  // the chat picks should be persona-weighted in the same direction the
  // category page sorts. Otherwise admin/Jake sees "premium Peloton" on the page
  // but cheap running shoes in chat — inconsistent.
  it('chat prompt has PERSONA SHOPPING PREFERENCES section', () => {
    expect(APP_SRC).toContain('PERSONA SHOPPING PREFERENCES');
  });
  it('hunter persona preferences documented (premium, proven, durable)', () => {
    expect(APP_SRC).toMatch(/hunter[\s\S]*?PREMIUM[\s\S]*?DURABLE/);
  });
  it('parent persona preferences documented (value, youth, safety)', () => {
    expect(APP_SRC).toMatch(/parent[\s\S]*?VALUE[\s\S]*?YOUTH/);
  });
  it('fitness persona preferences documented (deals, markdowns)', () => {
    expect(APP_SRC).toMatch(/fitness[\s\S]*?DEALS[\s\S]*?MARKDOWNS/);
  });
  it('anonymous fallback documented (no persona = general top-rated)', () => {
    expect(APP_SRC).toMatch(/anonymous user.*no persona.*top-rated/i);
  });
  it('rule 15 binds showResults picks to persona preferences', () => {
    expect(APP_SRC).toMatch(/15\.[\s\S]*?weight showResults picks by the active persona/);
  });
  it('catalog context exposes compareAt field (required for deal-detection)', () => {
    // Fitness/Alex prefers items with compareAt > price (sale items).
    // Without this field in the trimmed context, Claude can't see which products are on sale.
    expect(APP_SRC).toMatch(/buildCatalogContextSync = \(\) => \{[\s\S]*?compareAt: p\.compareAt/);
    expect(APP_SRC).toMatch(/buildCatalogContext = async[\s\S]*?compareAt: p\.compareAt/);
  });
  it('persona-preference rule mentions the agreement with page sort', () => {
    // The motivation is consistency with the page sort, not just persona affinity
    expect(APP_SRC).toMatch(/category page sorts the same way[\s\S]*?chat picks should agree/);
  });
});


describe('Static audit: Deepgram voice transcription (server-side)', () => {
  // Replaces the old Web Speech API. Audio recorded via MediaRecorder, uploaded
  // to our Cloudflare Worker /v1/transcribe endpoint, which forwards to Deepgram.
  it('useDeepgramRecording hook is defined', () => {
    expect(APP_SRC).toContain('const useDeepgramRecording');
  });
  it('VoiceMicButton component is defined', () => {
    expect(APP_SRC).toContain('const VoiceMicButton');
  });
  it('hook uses MediaRecorder API (not SpeechRecognition)', () => {
    expect(APP_SRC).toContain('MediaRecorder');
    expect(APP_SRC).not.toContain('useSpeechRecognition');
    expect(APP_SRC).not.toContain('webkitSpeechRecognition');
  });
  it('hook requests audio via getUserMedia', () => {
    expect(APP_SRC).toContain('navigator.mediaDevices.getUserMedia');
  });
  it('hook picks the best supported audio mime type (codec fallback chain)', () => {
    expect(APP_SRC).toContain('pickAudioMimeType');
    expect(APP_SRC).toContain('audio/webm;codecs=opus');
    expect(APP_SRC).toContain('audio/mp4');   // Safari
  });
  it('uploadAndTranscribe posts to /v1/transcribe on the proxy URL', () => {
    expect(APP_SRC).toContain('/v1/transcribe');
    expect(APP_SRC).toMatch(/fetch\(url[\s\S]{0,150}method: 'POST'[\s\S]{0,200}body: audioBlob/);
  });
  it('hook handles NotAllowedError (mic permission denied) gracefully', () => {
    expect(APP_SRC).toContain("'NotAllowedError'");
    expect(APP_SRC).toMatch(/Microphone permission denied/i);
  });
  it('hook handles NotFoundError (no mic on device) gracefully', () => {
    expect(APP_SRC).toContain("'NotFoundError'");
    expect(APP_SRC).toMatch(/No microphone detected/i);
  });
  it('hook releases the mic stream on stop (no lingering tab indicator)', () => {
    expect(APP_SRC).toMatch(/mediaStreamRef\.current\?\.getTracks\(\)\.forEach\(t => t\.stop\(\)\)/);
  });
  it('hook guards against empty/too-short recordings', () => {
    expect(APP_SRC).toMatch(/blob\.size < 1024/);
  });
  it('VoiceMicButton has a transcribing state (between stop and transcript)', () => {
    expect(APP_SRC).toContain('transcribing');
    expect(APP_SRC).toMatch(/disabled=\{disabled \|\| transcribing\}/);
  });
  it('VoiceMicButton uses click-to-toggle (no hold/release logic)', () => {
    expect(APP_SRC).toContain('onClick={handleClick}');
    expect(APP_SRC).not.toContain('onMouseDown={handlePointerDown}');
  });
  it('60-second auto-stop safety prevents stuck-on mic', () => {
    expect(APP_SRC).toMatch(/setTimeout\([\s\S]*?try \{ stop\(\); \}[\s\S]*?\}, 60_000\)/);
  });
  it('no diagnostic console.log statements left in production code', () => {
    // We had 🎤 VOICE: ... logs during debugging; ensure they're all removed
    expect(APP_SRC).not.toContain('🎤 VOICE');
  });
  it('voice transcription appends to existing text (mixed typing + speech)', () => {
    expect(APP_SRC).toMatch(/trimmedPrev \? `\$\{trimmedPrev\} \$\{finalText\}` : finalText/);
  });
  it('all mic call sites still wired (chat, kit, merch, banner, pdp title)', () => {
    const matches = APP_SRC.match(/<VoiceMicButton/g) || [];
    // 4 original surfaces (shopper chat, Kit Builder, merch chat, banner editor)
    // + 1 new (PDP module title editor in MerchTool) = 5 total
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Static audit: voice auto-submit (chat surfaces only)', () => {
  // After Deepgram transcription, the chat-style surfaces auto-submit so the
  // user doesn't have to click send. Non-chat surfaces (Kit Builder, banner
  // editor) must still require explicit submit since they're destructive or
  // expensive.
  it('VoiceMicButton accepts an onAutoSubmit prop', () => {
    expect(APP_SRC).toMatch(/VoiceMicButton = \(\{ value, setValue, disabled = false, size = 36, title, onAutoSubmit \}/);
  });
  it('onAutoSubmit fires after setValue with the merged text', () => {
    expect(APP_SRC).toMatch(/onAutoSubmitRef\.current\(mergedText\)/);
  });
  it('shopper chat VoiceMicButton passes onAutoSubmit → sendMessage', () => {
    expect(APP_SRC).toMatch(/<VoiceMicButton[\s\S]{0,400}setValue=\{setInput\}[\s\S]{0,400}onAutoSubmit=\{[\s\S]{0,400}sendMessage\(text\)/);
  });
  it('merch chat VoiceMicButton passes onAutoSubmit → send', () => {
    expect(APP_SRC).toMatch(/<VoiceMicButton[\s\S]{0,400}setValue=\{setInput\}[\s\S]{0,400}onAutoSubmit=\{[\s\S]{0,400}send\(text\)/);
  });
  it('Kit Builder voice mic does NOT auto-submit (user reviews scenario first)', () => {
    // Kit Builder mic call site should NOT have onAutoSubmit
    const kitBuilderRe = /<VoiceMicButton[^>]*disabled=\{phase === 'thinking'\}[^/]*\/>/;
    const m = APP_SRC.match(kitBuilderRe);
    expect(m, 'Kit Builder voice mic call site not found').toBeTruthy();
    expect(m[0]).not.toContain('onAutoSubmit');
  });
  it('Banner editor voice mic does NOT auto-submit (would commit typos)', () => {
    // Banner editor uses setDraft, NOT setInput
    const bannerRe = /<VoiceMicButton[^>]*setValue=\{setDraft\}[^/]*\/>/;
    const m = APP_SRC.match(bannerRe);
    expect(m, 'Banner editor voice mic call site not found').toBeTruthy();
    expect(m[0]).not.toContain('onAutoSubmit');
  });
  it('auto-submit uses a small setTimeout delay so input visibly updates first', () => {
    // The 50ms delay lets React commit the setValue before submit runs,
    // and gives the audience time to see the transcript appear in the field.
    expect(APP_SRC).toMatch(/setTimeout\(\(\) => \{[\s\S]*?onAutoSubmitRef\.current\(mergedText\)[\s\S]*?\}, 50\)/);
  });
});

describe('Static audit: merch overrides flow to storefront (THE consistency fix)', () => {
  // Previously the Merch Tool stored its banner edits and pinned SKUs only in
  // local component state — the HomePage and CategoryPage couldn't see them.
  // Now both live in App-level context so storefront reflects admin changes.
  it('heroOverrides and pinnedByCategory are App-level state', () => {
    expect(APP_SRC).toMatch(/const \[heroOverrides, setHeroOverrides\] = useState/);
    expect(APP_SRC).toMatch(/const \[pinnedByCategory, setPinnedByCategory\] = useState/);
  });
  it('App context exposes both override state and setters', () => {
    expect(APP_SRC).toMatch(/heroOverrides, setHeroOverrides,/);
    expect(APP_SRC).toMatch(/pinnedByCategory, setPinnedByCategory,/);
  });
  it('MerchTool consumes lifted state from context (NOT local useState)', () => {
    // The MerchTool should pull these from useApp(), not declare local state
    expect(APP_SRC).toMatch(/MerchTool = \(\) => \{[\s\S]{0,500}pinnedByCategory, setPinnedByCategory,[\s\S]{0,200}heroOverrides, setHeroOverrides,[\s\S]{0,200}\} = useApp\(\)/);
  });
  it('MerchTool no longer initializes pinnedByCategory as local useState', () => {
    // The old code had: const [pinnedByCategory, setPinnedByCategory] = useState({...}) inside MerchTool
    // After fix, that line only exists at App level. Check by counting occurrences.
    const matches = APP_SRC.match(/const \[pinnedByCategory, setPinnedByCategory\] = useState/g) || [];
    expect(matches.length).toBe(1);
  });
  it('banner save() writes to heroOverrides (mirrors local rules state)', () => {
    expect(APP_SRC).toMatch(/key === 'home-hero'[\s\S]{0,200}setHeroOverrides/);
  });
  it('AI-applied banner suggestion writes to heroOverrides', () => {
    expect(APP_SRC).toMatch(/applySuggestion[\s\S]{0,400}suggestion\.kind === 'banner'[\s\S]{0,400}setHeroOverrides/);
  });
  it('HomePage reads heroOverrides and overlays onto base hero', () => {
    expect(APP_SRC).toMatch(/HomePage = \(\) => \{[\s\S]{0,200}heroOverrides[\s\S]{0,400}overrideText \? \{ \.\.\.baseHero, body: overrideText \}/);
  });
  it('CategoryPage reads pinnedByCategory and reorders products', () => {
    expect(APP_SRC).toMatch(/CategoryPage = \(\) => \{[\s\S]{0,200}pinnedByCategory/);
    expect(APP_SRC).toContain('Pin-aware reordering');
  });
  it('pinned products float to the top of category grid', () => {
    expect(APP_SRC).toMatch(/return \[\.\.\.compactPinned, \.\.\.rest\]/);
  });
  it('useMemo for visibleProducts depends on pinnedByCategory + activeCategory', () => {
    // If these aren't in the deps, pin changes won't trigger a re-sort
    expect(APP_SRC).toMatch(/\}, \[products, persona, activeFacets, pinnedByCategory, activeCategory\]\)/);
  });
  it('ProductCard accepts a pinned prop', () => {
    expect(APP_SRC).toMatch(/const ProductCard = \(\{ product, compact = false, pinned = false \}\)/);
  });
  it('Pinned products show a "FEATURED" badge', () => {
    expect(APP_SRC).toMatch(/pinned && \(/);
    expect(APP_SRC).toContain('FEATURED');
  });
  it('CategoryPage grid passes pinned flag to each ProductCard', () => {
    expect(APP_SRC).toMatch(/<ProductCard product=\{p\} compact pinned=\{isPinned\}/);
  });
});

describe('Static audit: PDP overrides + guest hero (admin → all storefront surfaces)', () => {
  // Admin can edit per-persona PDP recommendation module and guest hero copy.
  // Changes must flow from MerchTool through App context to PDPPage / HomePage.

  it('pdpOverrides exists as App-level state', () => {
    expect(APP_SRC).toMatch(/const \[pdpOverrides, setPdpOverrides\] = useState/);
  });
  it('pdpOverrides is exposed in app context', () => {
    expect(APP_SRC).toMatch(/pdpOverrides, setPdpOverrides,/);
  });
  it('MerchTool destructures pdpOverrides from useApp', () => {
    expect(APP_SRC).toMatch(/MerchTool = \(\) => \{[\s\S]{0,700}pdpOverrides, setPdpOverrides,[\s\S]{0,200}\} = useApp\(\)/);
  });

  it('PDPPage reads pdpOverrides from context', () => {
    expect(APP_SRC).toMatch(/PDPPage = \(\) => \{[\s\S]{0,400}pdpOverrides/);
  });
  it('PDPPage overlays override title/items onto base module', () => {
    expect(APP_SRC).toMatch(/title: override\?\.title \|\| baseModule\.title/);
    expect(APP_SRC).toMatch(/override\?\.items && override\.items\.length > 0/);
  });
  it('PDPPage supports guests when admin adds override even with null base module', () => {
    // The guest persona has personaModule: null. If admin sets an override,
    // PDPPage should render it as a standalone module.
    expect(APP_SRC).toMatch(/No base module \(e\.g\. guest persona has personaModule: null\)/);
  });
  it('Guest sign-in callout suppressed if admin has set a PDP override for guest', () => {
    expect(APP_SRC).toMatch(/isAnon && !personaModule/);
  });

  it('guest entry added to default home-hero rules (mock adapter)', () => {
    expect(APP_SRC).toMatch(/'home-hero':\s*\{[\s\S]{0,200}guest:\s*'/);
  });
  it('guest entry added to default home-hero rules (commercetools stub)', () => {
    // The commercetools stub has its own copy of rules
    const matches = APP_SRC.match(/'home-hero':[\s\S]{0,200}guest:/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
  it('pdp-module rule defined for all 4 personas (incl. guest)', () => {
    expect(APP_SRC).toMatch(/'pdp-module':[\s\S]{0,500}hunter:[\s\S]{0,200}parent:[\s\S]{0,200}fitness:[\s\S]{0,200}guest:/);
  });

  it('Hero editor iterates 4 personas in fixed order incl. guest', () => {
    expect(APP_SRC).toMatch(/\['hunter', 'parent', 'fitness', 'guest'\][\s\S]{0,200}rules\['home-hero'\]/);
  });

  it('PDP Module editor section is in MerchTool with 4 cards', () => {
    // Iterates the 4 personas to render per-persona editor cards
    expect(APP_SRC).toMatch(/\['hunter', 'parent', 'fitness', 'guest'\]\.map\(personaKey/);
  });
  it('updatePdpModule helper writes BOTH rules state AND app-level overrides', () => {
    expect(APP_SRC).toMatch(/const updatePdpModule = \(persona, \{ title, items \} = \{\}\)/);
    expect(APP_SRC).toMatch(/updatePdpModule[\s\S]{0,500}setRules[\s\S]{0,300}setPdpOverrides/);
  });
  it('applySuggestion handles kind === pdpModule from AI', () => {
    expect(APP_SRC).toMatch(/suggestion\.kind === 'pdpModule'/);
  });
  it('AdminAssistant receives pdpOverrides prop', () => {
    expect(APP_SRC).toMatch(/<AdminAssistant[\s\S]{0,200}pdpOverrides=\{pdpOverrides\}/);
    expect(APP_SRC).toMatch(/const AdminAssistant = \(\{ rules, pinnedByCategory, pdpOverrides, onApply, llmEnabled \}\)/);
  });
  it('AdminAssistant snapshot includes pdpModule rules + overrides', () => {
    expect(APP_SRC).toMatch(/pdpModule: rules\?\.\['pdp-module'\]/);
    expect(APP_SRC).toMatch(/pdpOverrides: pdpOverrides \|\| \{\}/);
  });
  it('Merch system prompt teaches AI about pdpModule action + guest persona', () => {
    expect(APP_SRC).toContain('PDP PERSONALIZED MODULE');
    expect(APP_SRC).toContain('"pdpModule"');
    expect(APP_SRC).toContain('"hunter|parent|fitness|guest"');
    expect(APP_SRC).toContain('"guest"');
  });
  it('Suggestion UI renders pdpModule kind with title + items', () => {
    expect(APP_SRC).toMatch(/s\.kind === 'pdpModule' \? T\.violet/);
    expect(APP_SRC).toMatch(/`PDP MODULE · \$\{s\.persona\}`/);
  });

  it('PdpModuleProductPicker dropdown component exists', () => {
    expect(APP_SRC).toContain('const PdpModuleProductPicker');
  });
});

describe('Static audit: visual search sample images self-hosted (no CDN dependency)', () => {
  // Samples previously used external Unsplash URLs. Now they're self-hosted
  // SVG placeholders in public/samples/, served from the same origin as the
  // app. Eliminates ALL external image CDN dependencies for the visual search
  // feature — works on any network the app itself works on.
  it('samples reference local SVG files (not external URLs)', () => {
    expect(APP_SRC).toMatch(/file: 'runner\.svg', label: 'Runner'/);
    expect(APP_SRC).toMatch(/file: 'jersey\.svg', label: 'Jersey'/);
    expect(APP_SRC).toMatch(/file: 'scope\.svg',  label: 'Scope'/);
  });
  it('sample URLs use Vite BASE_URL for correct GitHub Pages path', () => {
    expect(APP_SRC).toMatch(/\$\{import\.meta\.env\.BASE_URL\}samples\//);
  });
  it('samples render with onError fallback so broken images degrade gracefully', () => {
    expect(APP_SRC).toMatch(/onError=\{/);
    expect(APP_SRC).toContain("e.currentTarget.style.display = 'none'");
  });
  it('removed the external Unsplash sample URLs entirely', () => {
    expect(APP_SRC).not.toContain('photo-1542291026-7eec264c27ff?w=200');
    expect(APP_SRC).not.toContain('photo-1584086124851-c93d8f9bff39?w=200');
  });
});
