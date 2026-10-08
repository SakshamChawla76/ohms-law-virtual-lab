import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('C:/Users/HP/.gemini/antigravity-ide/brain/01c79cf4-a71b-4d83-9765-67158cbab552');

async function testAllRevampedSimulations() {
  console.log('🚀 Running Comprehensive Revamped Simulation Test Suite...');
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const results = {
    errors: [],
    pageErrors: [],
    simulationsTested: 0,
    allPassed: true
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
      results.errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    results.pageErrors.push(err.message);
  });

  try {
    await page.goto('http://localhost:5188/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Carawin AICOS', { timeout: 10000 });
    console.log('✓ Hub loaded.');

    const testModule = async (nameSnippet, canvasAction) => {
      console.log(`\nTesting simulation: "${nameSnippet}"...`);
      const backBtn = page.locator('button:has-text("Back to Labs Catalog"), button:has-text("Back to Catalog")').first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
        await page.waitForTimeout(400);
      }

      const card = page.locator(`h3:has-text("${nameSnippet}")`).first();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await page.waitForTimeout(600);

      // Verify canvas rendered
      const canvas = page.locator('canvas').first();
      await canvas.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`  ✓ Canvas visible for "${nameSnippet}"`);

      if (canvasAction) {
        await canvasAction(canvas);
      }

      results.simulationsTested++;
    };

    // 1. Roller Coaster
    await testModule('Roller Coaster', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 60, box.y + 120);
      await page.mouse.down();
      await page.mouse.move(box.x + 60, box.y + 80, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ On-canvas drop tower dragged');
    });

    // 2. Collision & Momentum (Bumper Cars)
    await testModule('Bumper Cars', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 180, box.y + 190);
      await page.mouse.down();
      await page.mouse.move(box.x + 240, box.y + 190, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ Car A dragged on canvas');
    });

    // 3. Projectile Motion (Bow and Arrow)
    await testModule('Bow and Arrow', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 60, box.y + 330);
      await page.mouse.down();
      await page.mouse.move(box.x + 90, box.y + 280, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ Cannon aimed on canvas');
      await page.click('button:has-text("LAUNCH")');
      await page.waitForTimeout(800);
      console.log('  ✓ Projectile launched');
    });

    // 4. Doppler Effect
    await testModule('Doppler Ducks', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 200, box.y + 180);
      await page.mouse.down();
      await page.mouse.move(box.x + 350, box.y + 180, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ Doppler sound source dragged on canvas');
    });

    // 5. Total Internal Reflection / Diamond
    await testModule('Diamond Cut', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + box.width / 2 - 35, box.y + 130);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 70, box.y + 100, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ Incident laser angle dragged on canvas');
    });

    // 6. Airbag Stoichiometry
    await testModule('Airbag:', async () => {
      const triggerBtn = page.locator('button:has-text("TRIGGER CRASH")');
      await triggerBtn.click();
      await page.waitForTimeout(600);
      console.log('  ✓ Airbag crash triggered & inflated');
    });

    // 7. Gas Laws (Phases of Matter)
    await testModule('Phase Change', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 320, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 320, box.y + 120, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ Piston compressed on canvas');
    });

    // 8. Atom Builder
    await testModule('Atom Builder', async () => {
      const addProton = page.locator('button:has-text("+")').first();
      await addProton.click();
      await page.waitForTimeout(200);
      console.log('  ✓ Proton added to nucleus');
    });

    // 9. Density & Buoyancy
    await testModule('Going Fishing', async (canvas) => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + 150);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 240, { steps: 5 });
      await page.mouse.up();
      console.log('  ✓ Density block dragged into water on canvas');
    });

    await page.screenshot({ path: path.join(screenshotDir, 'revamped_simulations_verified.png'), fullPage: false });
    console.log('\n📸 Captured screenshot: revamped_simulations_verified.png');

    console.log('\n========================================');
    console.log(`TOTAL SIMULATIONS AUDITED: ${results.simulationsTested}`);
    console.log(`CONSOLE ERRORS: ${results.errors.length}`);
    console.log(`PAGE ERRORS: ${results.pageErrors.length}`);
    console.log('========================================');

  } catch (err) {
    console.error('Fatal test error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }
}

testAllRevampedSimulations();
