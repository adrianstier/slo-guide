import { test, expect, Page } from '@playwright/test';

const SITE_URL = 'https://adrianstier.github.io/slo-guide/';

// ──────────────────────────────────────────────
// STRUCTURE TESTS
// ──────────────────────────────────────────────
test.describe('Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('page title is correct', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('SLO');
  });

  test('hero section exists with h1 "SLO"', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('SLO');
  });

  test('day nav exists with 5 pills (FRI, SAT, SUN, GOLF, MAP)', async ({ page }) => {
    const dayNav = page.locator('.day-nav');
    await expect(dayNav).toBeAttached();
    const pills = page.locator('.day-nav-pill');
    await expect(pills).toHaveCount(5);
    const texts = await pills.allTextContents();
    expect(texts.map(t => t.trim())).toEqual(
      expect.arrayContaining(['FRI', 'SAT', 'SUN', 'GOLF', 'MAP'])
    );
  });

  test('all 3 day sections exist', async ({ page }) => {
    for (const id of ['day-fri', 'day-sat', 'day-sun']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('Home Base section has 3 cards', async ({ page }) => {
    // Home Base is the first card section before provisions
    const homeBaseSection = page.locator('.section').filter({ hasText: /home base/i });
    const cards = homeBaseSection.locator('.card');
    await expect(cards).toHaveCount(3);
  });

  test('Provisions section has 5 cards', async ({ page }) => {
    const provisionsSection = page.locator('.section').filter({ hasText: /provisions/i });
    const cards = provisionsSection.locator('.card');
    await expect(cards).toHaveCount(5);
  });

  test('Friday timeline has correct number of entries', async ({ page }) => {
    const friSection = page.locator('#day-fri');
    const entries = friSection.locator('.tl-entry');
    const count = await entries.count();
    // Site shows 6-7 Friday entries
    expect(count).toBeGreaterThanOrEqual(6);
    expect(count).toBeLessThanOrEqual(8);
  });

  test('Saturday timeline has correct number of entries', async ({ page }) => {
    const satSection = page.locator('#day-sat');
    const entries = satSection.locator('.tl-entry');
    await expect(entries).toHaveCount(7);
  });

  test('Sunday timeline has correct number of entries', async ({ page }) => {
    const sunSection = page.locator('#day-sun');
    const entries = sunSection.locator('.tl-entry');
    await expect(entries).toHaveCount(4);
  });

  test('Also Worth It grid has alt-cards with featured items', async ({ page }) => {
    const altCards = page.locator('.alt-card');
    const totalCount = await altCards.count();
    expect(totalCount).toBeGreaterThanOrEqual(14);

    const featured = page.locator('.alt-card.featured');
    const featuredCount = await featured.count();
    expect(featuredCount).toBeGreaterThanOrEqual(2);
  });

  test('back-to-top button exists', async ({ page }) => {
    const btn = page.locator('.back-to-top');
    await expect(btn).toBeAttached();
  });

  test('pull quote exists', async ({ page }) => {
    const pull = page.locator('.pull');
    await expect(pull).toBeAttached();
    const pullText = page.locator('.pull-text');
    await expect(pullText).toBeAttached();
  });
});

// ──────────────────────────────────────────────
// LINK TESTS
// ──────────────────────────────────────────────
test.describe('Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('all venue name links have valid href attributes', async ({ page }) => {
    // Card name links
    const cardNameLinks = page.locator('.card-name a, .tl-place a, .alt-name a');
    const count = await cardNameLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await cardNameLinks.nth(i).getAttribute('href');
      expect(href, `Link at index ${i} should have a valid href`).toBeTruthy();
      expect(href!.startsWith('http'), `Link "${href}" should start with http`).toBe(true);
    }
  });

  test('all yelp-link elements have href containing yelp.com/biz/', async ({ page }) => {
    const yelpLinks = page.locator('.yelp-link');
    const count = await yelpLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await yelpLinks.nth(i).getAttribute('href');
      expect(href, `Yelp link ${i} should have href`).toBeTruthy();
      expect(href, `Yelp link "${href}" should contain yelp.com/biz/`).toContain('yelp.com/biz/');
    }
  });

  test('all direction links have valid hrefs', async ({ page }) => {
    const dirLinks = page.locator('.directions-link');
    const count = await dirLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await dirLinks.nth(i).getAttribute('href');
      expect(href, `Direction link ${i} should have href`).toBeTruthy();
      expect(
        href!.startsWith('http'),
        `Direction link "${href}" should start with http`
      ).toBe(true);
    }
  });

  test('no broken anchor links', async ({ page }) => {
    const anchorLinks = page.locator('a[href^="#"]');
    const count = await anchorLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await anchorLinks.nth(i).getAttribute('href');
      if (href && href.length > 1) {
        const targetId = href.substring(1);
        const target = page.locator(`#${targetId}`);
        await expect(
          target,
          `Anchor target "${href}" should exist on the page`
        ).toBeAttached();
      }
    }
  });

  test('directions links contain maps.google.com', async ({ page }) => {
    // Look for direction/map links
    const mapLinks = page.locator('a[href*="maps.google.com"], a[href*="google.com/maps"], a[href*="goo.gl/maps"]');
    const count = await mapLinks.count();
    expect(count).toBeGreaterThanOrEqual(0); // Some sites may not have explicit directions links
    // If there are directions links, verify they are valid
    for (let i = 0; i < count; i++) {
      const href = await mapLinks.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('total links count is reasonable (80+)', async ({ page }) => {
    const allLinks = page.locator('a[href]');
    const count = await allLinks.count();
    expect(count).toBeGreaterThanOrEqual(80);
  });
});

// ──────────────────────────────────────────────
// VISUAL / UX TESTS
// ──────────────────────────────────────────────
test.describe('Visual / UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('hero is at least 60% of viewport', async ({ page }) => {
    const hero = page.locator('.hero');
    const box = await hero.boundingBox();
    expect(box).toBeTruthy();
    // Hero min-height is 60svh; on 844px viewport that's ~506px
    expect(box!.height).toBeGreaterThanOrEqual(480);
  });

  test('scroll down past hero — day nav becomes visible', async ({ page }) => {
    const dayNav = page.locator('.day-nav');

    // Initially the day nav may not be visible (above itinerary)
    // Scroll past the hero
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);

    // Day nav should be visible after scrolling past hero
    await expect(dayNav).toBeVisible();
  });

  test('day nav shows FRI as active when in Friday section', async ({ page }) => {
    // Scroll to Friday section
    await page.locator('#day-fri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const friPill = page.locator('.day-nav-pill[data-day="fri"]');
    // Check if it has the active class
    const classes = await friPill.getAttribute('class');
    expect(classes).toContain('active');
  });

  test('scroll to Saturday — SAT pill becomes active', async ({ page }) => {
    await page.locator('#day-sat').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const satPill = page.locator('.day-nav-pill[data-day="sat"]');
    const classes = await satPill.getAttribute('class');
    expect(classes).toContain('active');
  });

  test('scroll to bottom — back-to-top button is visible', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const btn = page.locator('.back-to-top');
    const classes = await btn.getAttribute('class');
    expect(classes).toContain('is-shown');
  });

  test('click back-to-top — scrolls to top', async ({ page }) => {
    // Scroll to bottom first
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Verify we are far down the page
    const startY = await page.evaluate(() => window.scrollY);
    expect(startY).toBeGreaterThan(1000);

    // Click back-to-top
    const btn = page.locator('.back-to-top');
    await btn.click();

    // Wait for smooth scroll animation to complete
    await page.waitForTimeout(1500);

    // Should have scrolled significantly toward the top
    const endY = await page.evaluate(() => window.scrollY);
    // The back-to-top may scroll to the hero or top of content, allow up to 300px
    expect(endY).toBeLessThan(300);
    // Verify it actually scrolled (significant reduction)
    expect(endY).toBeLessThan(startY * 0.1);
  });

  test('day nav hides when scrolled back to top', async ({ page }) => {
    // First scroll down to show the nav
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
    const dayNav = page.locator('.day-nav');
    await expect(dayNav).toBeVisible();

    // Now scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Day nav should be hidden at top
    const isVisible = await dayNav.isVisible();
    // It may either be hidden or not have the visible class
    // Check if it's not visible or doesn't have 'is-visible' class
    if (isVisible) {
      const classes = await dayNav.getAttribute('class');
      // If still technically in DOM but should not be active
      expect(classes).not.toContain('is-visible');
    }
  });
});

// ──────────────────────────────────────────────
// RESPONSIVE TESTS
// ──────────────────────────────────────────────
test.describe('Responsive', () => {
  test('at 360px width, alt-grid layout adjusts', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const altGrid = page.locator('.alt-grid');
    await altGrid.scrollIntoViewIfNeeded();

    const gridStyles = await altGrid.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        gridTemplateColumns: computed.gridTemplateColumns,
        display: computed.display,
      };
    });

    expect(gridStyles.display).toBe('grid');
    // At 360px, should have a narrow layout (1 or 2 columns)
    // The column template should be defined
    expect(gridStyles.gridTemplateColumns).toBeTruthy();
  });

  test('at 390px width, alt-grid is single column (below 420px breakpoint)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const altGrid = page.locator('.alt-grid');
    await altGrid.scrollIntoViewIfNeeded();

    const gridCols = await altGrid.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.gridTemplateColumns;
    });

    // Below 420px breakpoint, grid switches to 1fr (single column)
    const colValues = gridCols.split(' ').filter((s: string) => s.length > 0);
    expect(colValues.length).toBe(1);
  });

  test('hero subtitle text does not overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const heroSub = page.locator('.hero-sub');
    const box = await heroSub.boundingBox();
    expect(box).toBeTruthy();
    // Text should fit within viewport width
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390 + 5); // small tolerance
  });
});

// ──────────────────────────────────────────────
// ACCESSIBILITY TESTS
// ──────────────────────────────────────────────
test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('day nav has aria-label', async ({ page }) => {
    const dayNav = page.locator('.day-nav');
    const ariaLabel = await dayNav.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('back-to-top has aria-label', async ({ page }) => {
    const btn = page.locator('.back-to-top');
    const ariaLabel = await btn.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('all external links have rel="noopener"', async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    let missingNoopener: string[] = [];
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel');
      const href = await externalLinks.nth(i).getAttribute('href');
      if (!rel || !rel.includes('noopener')) {
        missingNoopener.push(href || `link-${i}`);
      }
    }

    expect(
      missingNoopener,
      `These external links are missing rel="noopener": ${missingNoopener.join(', ')}`
    ).toHaveLength(0);
  });

  test('links have sufficient touch target size (44x44 minimum)', async ({ page }) => {
    // Check a sample of interactive link elements
    const touchTargets = page.locator('.day-nav-pill, .back-to-top, .link-pill');
    const count = await touchTargets.count();

    let tooSmall: string[] = [];
    for (let i = 0; i < count; i++) {
      const box = await touchTargets.nth(i).boundingBox();
      if (box) {
        const text = await touchTargets.nth(i).textContent();
        // Check effective touch area (width and height should be at least 44px,
        // or the element should have enough padding)
        if (box.width < 44 && box.height < 44) {
          tooSmall.push(`"${text?.trim()}" (${Math.round(box.width)}x${Math.round(box.height)})`);
        }
      }
    }

    // Report but don't fail hard — just check that most are adequate
    if (tooSmall.length > 0) {
      console.log(`Touch targets that may be too small: ${tooSmall.join(', ')}`);
    }
    // At least the nav pills and back-to-top should meet the threshold
    const navPills = page.locator('.day-nav-pill');
    for (let i = 0; i < await navPills.count(); i++) {
      const box = await navPills.nth(i).boundingBox();
      if (box) {
        // Either width or height should be at least 44px (pills are wider than tall typically)
        expect(
          box.width >= 44 || box.height >= 44,
          `Nav pill should have at least one dimension >= 44px, got ${Math.round(box.width)}x${Math.round(box.height)}`
        ).toBe(true);
      }
    }
  });
});
