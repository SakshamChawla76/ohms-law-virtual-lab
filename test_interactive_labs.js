import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('C:/Users/HP/.gemini/antigravity-ide/brain/01c79cf4-a71b-4d83-9765-67158cbab552');

async function runVerification() {
  console.log('🚀 Launching Playwright browser (Edge channel)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const results = {
    hub: false,
    rollerCoasterSandbox: false,
    rollerCoasterChallenge: false,
    ohmsIntro: false,
    ohmsTheory: false,
    ohmsApparatus: false,
    ohmsLabWiring: false,
    ohmsLabCircuitActive: false,
    ohmsObservationsLogged: false,
    errors: []
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
      results.errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack || err.message);
    results.errors.push(err.message);
  });

  try {
    console.log('📍 Navigating to http://localhost:5188/...');
    await page.goto('http://localhost:5188/', { waitUntil: 'networkidle' });

    // --- STEP 1: Verify Hub ---
    console.log('🔍 Checking Simulation Hub...');
    await page.waitForSelector('text=Carawin AICOS', { timeout: 10000 });
    const cards = await page.$$('text=Launch Module');
    console.log(`Found ${cards.length} simulation cards in Hub.`);
    results.hub = cards.length >= 8;

    const hubImg = path.join(screenshotDir, 'hub_verified.png');
    await page.screenshot({ path: hubImg, fullPage: false });
    console.log(`📸 Saved Hub screenshot to: ${hubImg}`);

    // --- STEP 2: Verify Roller Coaster Sim ---
    console.log('🎢 Launching Roller Coaster Simulation...');
    const rcCard = page.locator('h3:has-text("Roller Coaster")').first();
    await rcCard.click();

    await page.waitForSelector('text=60 FPS NUMERICAL RUNTIME', { timeout: 8000 });
    console.log('Roller Coaster Sandbox loaded.');
    await page.waitForTimeout(1500); // Allow coaster loop animation to cycle

    const rcImg = path.join(screenshotDir, 'roller_coaster_verified.png');
    await page.screenshot({ path: rcImg, fullPage: false });
    console.log(`📸 Saved Roller Coaster screenshot to: ${rcImg}`);
    results.rollerCoasterSandbox = true;

    // Check challenge tab
    console.log('Testing Roller Coaster challenge tab...');
    await page.click('button:has-text("3. Challenge")');
    await page.waitForSelector('text=Analytical Derivation', { timeout: 8000 });
    console.log('Roller Coaster Challenge tab verified.');
    results.rollerCoasterChallenge = true;

    // Return to Catalog
    console.log('Returning to Catalog...');
    await page.click('#hub-back-btn');
    await page.waitForSelector('text=Carawin AICOS', { timeout: 8000 });

    // --- STEP 3: Verify Ohm\'s Law Virtual Lab ---
    console.log('⚡ Launching Ohm\'s Law Virtual Lab...');
    const ohmsCard = page.locator('h3:has-text("Ohm\'s Law Precision Lab")').first();
    await ohmsCard.click();

    // 3a. Intro screen
    await page.waitForSelector('text=Verification of Ohm\'s Law', { timeout: 8000 });
    console.log('Ohm\'s Law Introduction Screen verified.');
    results.ohmsIntro = true;
    const introImg = path.join(screenshotDir, 'ohms_intro_verified.png');
    await page.screenshot({ path: introImg, fullPage: false });

    // 3b. Theory screen
    console.log('Navigating to Theory Screen...');
    await page.click('button:has-text("Learn Theory")');
    await page.waitForSelector('text=Interactive Relationship Visualizer', { timeout: 8000 });
    console.log('Ohm\'s Law Theory Screen verified.');
    results.ohmsTheory = true;
    const theoryImg = path.join(screenshotDir, 'ohms_theory_verified.png');
    await page.screenshot({ path: theoryImg, fullPage: false });

    // 3c. Apparatus screen
    console.log('Navigating to Apparatus Screen...');
    await page.click('header button:has-text("Apparatus")');
    await page.waitForSelector('text=Physical Purpose & Function', { timeout: 8000 });
    console.log('Ohm\'s Law Apparatus Screen verified.');
    results.ohmsApparatus = true;
    const apparatusImg = path.join(screenshotDir, 'ohms_apparatus_verified.png');
    await page.screenshot({ path: apparatusImg, fullPage: false });

    // 3d. Enter Laboratory Workspace
    console.log('Entering Laboratory Workspace...');
    await page.click('header button:has-text("Workbench")');
    await page.waitForSelector('text=Auto-Wire Demo', { timeout: 8000 });
    console.log('Workbench Station rendered.');

    // Click Auto-Wire Demo
    console.log('Executing Auto-Wire Demo...');
    await page.click('button:has-text("Auto-Wire Demo")');
    await page.waitForTimeout(600);
    const wiresText = await page.textContent('body');
    const hasWires = wiresText.includes('Clear Wires');
    console.log('Wires status (Clear Wires available):', hasWires);
    results.ohmsLabWiring = hasWires;

    // Toggle Knife Switch to close circuit
    console.log('Closing knife switch...');
    const knifeSwitch = page.locator('div[title="Click to toggle mechanical knife switch"]');
    await knifeSwitch.click();
    await page.waitForTimeout(800);

    const circuitStatus = await page.textContent('body');
    const isCircuitActive = circuitStatus.includes('CIRCUIT CLOSED');
    console.log('Circuit active (CIRCUIT CLOSED):', isCircuitActive);
    results.ohmsLabCircuitActive = isCircuitActive;

    // Log reading in observation table
    console.log('Logging observations in table...');
    const logBtn = page.locator('button:has-text("LOG READING")');
    if (await logBtn.isEnabled()) {
      await logBtn.click();
      await page.waitForTimeout(400);
    }

    // Dial voltage to 6V preset
    console.log('Selecting 6V preset...');
    const preset6V = page.locator('button:has-text("6V")');
    if (await preset6V.count() > 0) {
      await preset6V.click();
      await page.waitForTimeout(300);
      if (await logBtn.isEnabled()) {
        await logBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Dial voltage to 8V preset
    console.log('Selecting 8V preset...');
    const preset8V = page.locator('button:has-text("8V")');
    if (await preset8V.count() > 0) {
      await preset8V.click();
      await page.waitForTimeout(300);
      if (await logBtn.isEnabled()) {
        await logBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Check observation ledger
    const ledgerText = await page.textContent('body');
    const rowsLogged = ledgerText.includes('T-01') || ledgerText.includes('READINGS RECORDED');
    console.log('Observation rows logged:', rowsLogged);
    results.ohmsObservationsLogged = rowsLogged;

    // Toggle Regression Line
    const regBtn = page.locator('button:has-text("REGRESSION LINE")');
    if (await regBtn.count() > 0 && await regBtn.isEnabled()) {
      await regBtn.click();
      await page.waitForTimeout(300);
    }

    const labActiveImg = path.join(screenshotDir, 'ohms_lab_active_verified.png');
    await page.screenshot({ path: labActiveImg, fullPage: false });
    console.log(`📸 Saved Active Lab Workspace screenshot to: ${labActiveImg}`);

  } catch (err) {
    console.error('VERIFICATION ERROR:', err);
    results.fatalError = err.message;
  } finally {
    await browser.close();
  }

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

runVerification();
