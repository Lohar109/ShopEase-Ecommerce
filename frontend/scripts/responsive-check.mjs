// Automated responsive/overflow checker.
// Usage: node scripts/responsive-check.mjs <route1> <route2> ...
// Routes are paths like /cart, /checkout/shipping, etc.
// Checks each route at WIDTHS and reports horizontal overflow + top offending elements.

import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const WIDTHS = [375, 390, 768, 1024, 1440, 1920];
const HEIGHT = 900;

const SEED_CART = [
  {
    cartItemId: 'bdbd7dec-4a0e-45e0-b187-2b4d31c87586-c658d78c-f5d5-461f-bb9b-d880dbd7662e',
    productId: 'bdbd7dec-4a0e-45e0-b187-2b4d31c87586',
    variantId: 'c658d78c-f5d5-461f-bb9b-d880dbd7662e',
    productName: 'Drools Real Chicken and Egg Dry Adult Dog Food',
    image: 'https://res.cloudinary.com/dvbdgbubo/image/upload/q_auto/f_auto/v1778430741/-original-imahmjndfzgzqjbn_o2mixg.webp',
    size: '4.2 kg (3kg + 1.2kg Free)',
    color: 'Standard',
    price: 8,
    mrp: 10,
    discount_type: 'Percentage',
    discount_value: 10,
    override_discount: true,
    quantity: 2,
  },
];

const routes = process.argv.slice(2);
if (routes.length === 0) {
  console.error('Usage: node scripts/responsive-check.mjs /route1 /route2 ...');
  process.exit(1);
}

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Seed localStorage cart so Cart/Shipping/Payment render real content.
  const seedPage = await context.newPage();
  await seedPage.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await seedPage.evaluate((items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    localStorage.setItem('wishlistProductIds', JSON.stringify(['bdbd7dec-4a0e-45e0-b187-2b4d31c87586']));
  }, SEED_CART);
  await seedPage.close();

  let overallPass = true;
  const results = [];

  for (const route of routes) {
    const page = await context.newPage();
    const routeResult = { route, widths: {} };

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: HEIGHT });
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(400);

      const data = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflowAmount = doc.scrollWidth - doc.clientWidth;
        const hasOverflow = overflowAmount > 1;

        // An element inside a properly-clipped horizontal scroller (overflow-x: auto/scroll
        // on an ancestor whose own right edge fits the viewport) is NOT a real bug - it's
        // reachable only by scrolling that inner container, and never widens the page itself.
        const hasClippingScrollAncestor = (el) => {
          let node = el.parentElement;
          while (node && node !== document.body) {
            const s = getComputedStyle(node);
            if ((s.overflowX === 'auto' || s.overflowX === 'scroll')) {
              const nodeRect = node.getBoundingClientRect();
              if (nodeRect.right - doc.clientWidth <= 2) return true;
            }
            node = node.parentElement;
          }
          return false;
        };

        let offenders = [];
        if (hasOverflow) {
          const all = document.querySelectorAll('body *');
          const found = [];
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            const style = getComputedStyle(el);
            if (style.position === 'fixed') continue;
            const overflowX = style.overflowX;
            if (rect.right - doc.clientWidth > 2 && !hasClippingScrollAncestor(el)) {
              found.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
                right: Math.round(rect.right),
                overflowPx: Math.round(rect.right - doc.clientWidth),
                overflowX,
                visibility: style.visibility,
                position: style.position,
              });
            }
          }
          found.sort((a, b) => b.overflowPx - a.overflowPx);
          offenders = found.slice(0, 8);
        }

        return { hasOverflow, overflowAmount: Math.round(overflowAmount), offenders };
      });

      routeResult.widths[width] = data;
      if (data.hasOverflow) overallPass = false;
    }

    await page.close();
    results.push(routeResult);
  }

  await browser.close();

  for (const r of results) {
    console.log(`\n=== ${r.route} ===`);
    for (const w of WIDTHS) {
      const d = r.widths[w];
      if (d.hasOverflow) {
        console.log(`  ${w}px: FAIL (overflow ${d.overflowAmount}px)`);
        for (const o of d.offenders) {
          console.log(`      <${o.tag} class="${o.cls}"> right=${o.right} over=${o.overflowPx}px overflow-x=${o.overflowX}`);
        }
      } else {
        console.log(`  ${w}px: PASS`);
      }
    }
  }

  console.log(overallPass ? '\nALL ROUTES PASS' : '\nSOME ROUTES FAILED');
  process.exit(overallPass ? 0 : 1);
};

run();
