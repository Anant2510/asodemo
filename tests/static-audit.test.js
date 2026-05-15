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

describe('Static audit: voice input', () => {
  it('useSpeechRecognition hook is defined', () => {
    expect(APP_SRC).toContain('const useSpeechRecognition');
  });
  it('VoiceMicButton component is defined', () => {
    expect(APP_SRC).toContain('const VoiceMicButton');
  });
  it('hook checks for both standard and webkit SpeechRecognition', () => {
    expect(APP_SRC).toContain('window.SpeechRecognition || window.webkitSpeechRecognition');
  });
  it('hook returns supported=false on browsers without API', () => {
    // VoiceMicButton should hide when unsupported instead of being disabled (cleaner UX)
    expect(APP_SRC).toMatch(/if \(!supported\) return null/);
  });
  it('hook handles permission-denied error gracefully', () => {
    expect(APP_SRC).toContain("'not-allowed'");
    expect(APP_SRC).toMatch(/Microphone permission denied/i);
  });
  it('hook handles no-microphone error gracefully', () => {
    expect(APP_SRC).toContain("'audio-capture'");
    expect(APP_SRC).toContain('No microphone detected');
  });
  it('hook handles transcription network error gracefully', () => {
    expect(APP_SRC).toContain("'network'");
  });
  it('hook handles no-speech (user silent) gracefully', () => {
    expect(APP_SRC).toContain("'no-speech'");
  });
  it('hook handles user-initiated abort silently (no error toast)', () => {
    // 'aborted' is now part of the early-return path in onerror alongside no-speech
    expect(APP_SRC).toMatch(/event\.error === 'no-speech' \|\| event\.error === 'aborted'/);
  });
  it('hook cleans up recognition instance on unmount', () => {
    expect(APP_SRC).toMatch(/useEffect\(\(\) => \(\) => \{[\s\S]*?recognitionRef\.current\?\.stop\(\)/);
  });
  it('hook uses interimResults for live transcript feedback', () => {
    expect(APP_SRC).toContain('interimResults = true');
  });
  it('hook default language is en-US', () => {
    expect(APP_SRC).toMatch(/lang = 'en-US'/);
  });
  it('VoiceMicButton renders pulsing ring while listening', () => {
    expect(APP_SRC).toContain('voice-ring');
    expect(APP_SRC).toMatch(/@keyframes voice-ring/);
  });
  it('VoiceMicButton has accessibility label', () => {
    expect(APP_SRC).toMatch(/aria-label.*Stop voice input.*Start voice input/);
  });
  it('shopper chat has VoiceMicButton wired', () => {
    expect(APP_SRC).toMatch(/<VoiceMicButton[^>]*setValue=\{setInput\}[^>]*title="Click to speak to the AI agent"/);
  });
  it('Merch Assistant has VoiceMicButton wired (when LLM enabled)', () => {
    expect(APP_SRC).toMatch(/llmEnabled && <VoiceMicButton/);
  });
  it('Kit Builder has VoiceMicButton wired', () => {
    expect(APP_SRC).toMatch(/<VoiceMicButton[^>]*disabled=\{phase === 'thinking'\}/);
  });
  it('VoiceMicButton has loading-state guard (disables during AI call)', () => {
    expect(APP_SRC).toContain('disabled={loading}');
  });
  it('voice transcription appends to existing text (mixed typing + speech)', () => {
    // Confirms transcribed text concatenates to current input rather than replacing
    expect(APP_SRC).toMatch(/trimmedPrev \? `\$\{trimmedPrev\} \$\{finalText\}` : finalText/);
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

describe('Static audit: voice mic toggle + auto-restart behavior', () => {
  it('VoiceMicButton uses click-to-toggle (no hold/release logic)', () => {
    expect(APP_SRC).toMatch(/onClick=\{handleClick\}/);
    // Click handler should toggle based on listening state
    expect(APP_SRC).toMatch(/handleClick[\s\S]*?if \(listening\) stop\(\);\s*else start\(\)/);
  });
  it('button does NOT use mousedown/mouseup/mouseleave (those caused premature kills)', () => {
    expect(APP_SRC).not.toContain('onMouseDown={handlePointerDown}');
    expect(APP_SRC).not.toContain('onMouseLeave={handlePointerLeave}');
  });
  it('60-second auto-stop safety prevents stuck-on mic', () => {
    expect(APP_SRC).toMatch(/setTimeout\([\s\S]*?try \{ stop\(\); \}[\s\S]*?\}, 60_000\)/);
  });
  it('keyboard accessibility: Enter/Space toggle the mic', () => {
    expect(APP_SRC).toMatch(/handleKeyDown[\s\S]*?key === 'Enter' \|\| e\.key === ' '/);
  });
  it('hook continuous mode is enabled (no auto-cutoff on pause)', () => {
    expect(APP_SRC).toContain('rec.continuous = true');
  });
  it('start() cleans up any existing recognition before creating new', () => {
    expect(APP_SRC).toMatch(/if \(recognitionRef\.current\) \{[\s\S]*?try \{ recognitionRef\.current\.stop/);
  });
  it('touchAction: manipulation set (prevents long-press menus on mobile)', () => {
    expect(APP_SRC).toContain("touchAction: 'manipulation'");
  });
  it('CRITICAL: hook auto-restarts on premature onend when user wants mic active', () => {
    // The core fix for the "mic switches off in a sec" bug.
    // Browser may end the session even with continuous=true; we restart it.
    expect(APP_SRC).toContain('userWantsActiveRef');
    expect(APP_SRC).toMatch(/onend = \(\) => \{[\s\S]*?if \(userWantsActiveRef\.current\)/);
  });
  it('hook silently ignores no-speech errors (so auto-restart can kick in)', () => {
    // no-speech is the most common premature-end cause; we shouldn't surface it
    expect(APP_SRC).toMatch(/event\.error === 'no-speech'[\s\S]*?return/);
  });
  it('hook clears user-intent flag on real fatal errors (so it does NOT auto-restart)', () => {
    // not-allowed (permission denied), audio-capture, network: these are fatal
    expect(APP_SRC).toMatch(/userWantsActiveRef\.current = false;[\s\S]{0,80}setError\(friendly\)/);
  });
  it('stop() clears user intent BEFORE stopping (so onend does not auto-restart)', () => {
    // Ordering matters — if you stop first then clear intent, the onend
    // handler races and might restart before we set the flag false.
    expect(APP_SRC).toMatch(/const stop = useCallback\(\(\) => \{\s*[\s\S]*?userWantsActiveRef\.current = false;[\s\S]*?recognitionRef\.current\?\.stop/);
  });
  it('button does NOT use transform/scale animation (geometry instability caused mouseleave kills)', () => {
    // The previous version had transform: scale(1.08) when listening, which
    // caused the button to grow under the pointer and trigger spurious leaves.
    expect(APP_SRC).not.toMatch(/transform: listening \? 'scale/);
  });
});

describe('Static audit: voice auto-restart recursion (THE actual fix)', () => {
  // The bug: when Chrome ends a recognition session prematurely (which it does
  // even with continuous=true), my old code tried to call .start() on the SAME
  // dead rec instance. Chrome throws InvalidStateError. The catch then gave up.
  // Result: mic appeared to come on for ~1s then die.
  //
  // The fix: when onend fires while user still wants mic active, call the OUTER
  // start() function again — which creates a FRESH recognition instance.
  it('restartFnRef stores reference to latest start() function', () => {
    expect(APP_SRC).toContain('restartFnRef');
    expect(APP_SRC).toMatch(/useEffect\(\(\) => \{ restartFnRef\.current = start;[\s\S]*?\}, \[start\]\)/);
  });
  it('onend calls restartFnRef.current(false) (auto-restart preserves error counter)', () => {
    // We should NOT see rec.start() inside onend — that was the buggy pattern
    // We SHOULD see restartFnRef.current(false) — passes false to preserve counter
    expect(APP_SRC).toMatch(/onend = \(\) => \{[\s\S]*?restartFnRef\.current\(false\)/);
    // Confirm we removed the old broken rec.start() restart attempt
    expect(APP_SRC).not.toMatch(/onend = \(\) => \{[\s\S]{0,400}try \{ rec\.start\(\); \}/);
  });
  it('100ms restart delay (gives browser time to release the old session)', () => {
    expect(APP_SRC).toMatch(/setTimeout\(\(\) => \{[\s\S]*?restartFnRef\.current\(false\)[\s\S]*?\}, 100\)/);
  });
  it('re-checks userWantsActive after delay (user might have clicked stop in between)', () => {
    // The setTimeout body must check userWantsActiveRef again before restarting
    expect(APP_SRC).toMatch(/setTimeout\(\(\) => \{[\s\S]*?if \(userWantsActiveRef\.current\)[\s\S]*?restartFnRef\.current\(false\)/);
  });
});

describe('Static audit: voice network-error recovery (THE fix for "mic dies in 1 sec")', () => {
  // Root cause: corporate networks / ad-blockers / VPNs / Chrome glitches cause
  // SpeechRecognition to fire `network` errors. The previous code treated
  // `network` as fatal and gave up — that's why the mic appeared to die
  // immediately. The fix: treat `network` as recoverable like `no-speech`.
  it('network errors are NOT classified as fatal (no setError, no userWantsActive=false)', () => {
    // The friendly-error map should NOT contain a network entry anymore
    expect(APP_SRC).not.toMatch(/'network': 'Voice transcription unavailable \(network error\)'/);
  });
  it('network errors increment a counter for retry tracking', () => {
    expect(APP_SRC).toContain('networkErrorCountRef');
    expect(APP_SRC).toMatch(/networkErrorCountRef\.current\+\+/);
  });
  it('network counter has a give-up threshold (MAX_CONSECUTIVE_NETWORK_ERRORS)', () => {
    expect(APP_SRC).toContain('MAX_CONSECUTIVE_NETWORK_ERRORS');
    expect(APP_SRC).toMatch(/MAX_CONSECUTIVE_NETWORK_ERRORS = 5/);
  });
  it('successful onresult resets the network error counter', () => {
    // A transcript reset the counter so transient glitches dont accumulate
    expect(APP_SRC).toMatch(/networkErrorCountRef\.current = 0;\s*onResultRef\.current/);
  });
  it('user-initiated start (isUserInitiated=true) resets the network counter', () => {
    expect(APP_SRC).toMatch(/if \(isUserInitiated\)[\s\S]*?networkErrorCountRef\.current = 0/);
  });
  it('start signature accepts isUserInitiated flag (default true for user clicks)', () => {
    expect(APP_SRC).toMatch(/const start = useCallback\(\(isUserInitiated = true\) =>/);
  });
  it('persistent network failure shows a useful error message to user', () => {
    // After MAX_CONSECUTIVE_NETWORK_ERRORS, surface explanation
    expect(APP_SRC).toMatch(/corporate firewalls.*VPN.*ad-blockers/i);
  });
});
