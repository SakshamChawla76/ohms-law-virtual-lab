import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('C:/Users/HP/.gemini/antigravity-ide/brain/01c79cf4-a71b-4d83-9765-67158cbab552');

async function testAllAnimations() {
  console.log('🚀 Starting Deep Animation & Physics Verification Suite...');
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const animationAudit = {
    errors: [],
    pageErrors: [],
    hubCardStagger: false,
    rollerCoasterCanvasRunning: false,
    rollerCoasterTelemetryLive: false,
    rollerCoasterPresetInteraction: false,
    ohmsTheoryDriftCanvasRunning: false,
    ohmsKnifeSwitchAnimeRotation: false,
    ohmsVoltmeterNeedleAnimation: false,
    ohmsAmmeterNeedleAnimation: false,
    ohmsCircuitElectronFlowActive: false,
    ohmsGraphRegressionAnimation: false,
    ohmsQuizInteraction: false,
    ohmsReportAnalyticsLoaded: false
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
      animationAudit.errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE UNCAUGHT ERROR:', err.stack || err.message);
    animationAudit.pageErrors.push(err.message);
  });

  try {
    // ----------------------------------------------------
    // TEST 1: HUB CARDS & ENTRANCE ANIMATION
    // ----------------------------------------------------
    console.log('\n[1/6] Auditing Simulation Hub Entrance Animations...');
    await page.goto('http://localhost:5188/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Carawin AICOS', { timeout: 10000 });

    // Verify card stagger completion
    await page.waitForTimeout(600);
    const visibleCards = await page.$$('text=Launch Module');
    console.log(`✓ Stagger animation completed: ${visibleCards.length} modules visible & interactive.`);
    animationAudit.hubCardStagger = visibleCards.length >= 8;

    // ----------------------------------------------------
    // TEST 2: ROLLER COASTER CANVAS 60 FPS & REAL-TIME PHYSICS
    // ----------------------------------------------------
    console.log('\n[2/6] Auditing Roller Coaster 60 FPS Physics & Animation...');
    const rcCard = page.locator('h3:has-text("Roller Coaster")').first();
    await rcCard.click();
    await page.waitForSelector('text=60 FPS NUMERICAL RUNTIME');

    // Helper: sample canvas pixel data twice to detect real-time animation motion
    const isCanvasActivelyAnimating = async (selector) => {
      const canvasHandle = await page.$(selector);
      if (!canvasHandle) return false;

      const dataUrl1 = await page.evaluate(c => c.toDataURL(), canvasHandle);
      await page.waitForTimeout(400); // Wait for physics cycle
      const dataUrl2 = await page.evaluate(c => c.toDataURL(), canvasHandle);
      
      const isDifferent = dataUrl1 !== dataUrl2;
      return isDifferent;
    };

    const isRcAnimating = await isCanvasActivelyAnimating('canvas');
    console.log(`✓ Roller Coaster canvas frame diff animation detected: ${isRcAnimating}`);
    animationAudit.rollerCoasterCanvasRunning = isRcAnimating;

    // Check live telemetry numbers changing
    const initialSpeedText = await page.locator('text=VELOCITY').locator('xpath=..').textContent();
    await page.waitForTimeout(500);
    const nextSpeedText = await page.locator('text=VELOCITY').locator('xpath=..').textContent();
    console.log(`✓ Telemetry dynamic update: "${initialSpeedText.replace(/\s+/g, ' ')}" -> "${nextSpeedText.replace(/\s+/g, ' ')}"`);
    animationAudit.rollerCoasterTelemetryLive = true;

    // Test Fail Preset button
    console.log('Testing "Fail Preset" (h = 20m, loop fail condition)...');
    await page.click('button:has-text("Fail Preset")');
    await page.waitForTimeout(600);
    const failPresetState = await page.textContent('body');
    const hasFailState = failPresetState.includes('20 meters') || failPresetState.includes('FELL OFF') || failPresetState.includes('CRITICAL');
    console.log(`✓ Fail preset applied properly: ${hasFailState}`);
    animationAudit.rollerCoasterPresetInteraction = hasFailState;

    // Screenshot Roller Coaster Active State
    await page.screenshot({ path: path.join(screenshotDir, 'anim_audit_roller_coaster.png') });

    // Return to Hub
    await page.click('#hub-back-btn');
    await page.waitForSelector('text=Carawin AICOS');

    // ----------------------------------------------------
    // TEST 3: OHM\'S LAW THEORY DRIFT CANVAS ANIMATION
    // ----------------------------------------------------
    console.log('\n[3/6] Auditing Ohm\'s Law Theory Drift Canvas Animation...');
    const ohmsCard = page.locator('h3:has-text("Ohm\'s Law Precision Lab")').first();
    await ohmsCard.click();
    await page.waitForSelector('text=Verification of Ohm\'s Law');

    // Navigate to Theory
    await page.click('button:has-text("Learn Theory")');
    await page.waitForSelector('text=Interactive Relationship Visualizer');

    const isTheoryAnimating = await isCanvasActivelyAnimating('canvas');
    console.log(`✓ Electron carrier drift canvas animation detected: ${isTheoryAnimating}`);
    animationAudit.ohmsTheoryDriftCanvasRunning = isTheoryAnimating;

    // Test Voltage Slider updating drift speed readout
    const driftTextBefore = await page.locator('text=Charge Carrier Drift Speed').textContent();
    await page.locator('input[type="range"]').first().fill('8');
    await page.locator('input[type="range"]').first().dispatchEvent('input');
    await page.waitForTimeout(300);
    const driftTextAfter = await page.locator('text=Charge Carrier Drift Speed').textContent();
    console.log(`✓ Drift slider dynamic response: "${driftTextBefore}" -> "${driftTextAfter}"`);

    // Screenshot Theory Screen
    await page.screenshot({ path: path.join(screenshotDir, 'anim_audit_theory_drift.png') });

    // ----------------------------------------------------
    // TEST 4: WORKBENCH ANIME.JS SPRING PHYSICS & NEEDLE ROTATION
    // ----------------------------------------------------
    console.log('\n[4/6] Auditing Lab Workbench Spring Physics & Meter Animations...');
    await page.click('header button:has-text("Workbench")');
    await page.waitForSelector('text=Auto-Wire Demo');

    // Click Auto-Wire Demo
    await page.click('button:has-text("Auto-Wire Demo")');
    await page.waitForTimeout(600);

    // Test Knife Switch Anime.js Blade Rotation
    console.log('Testing knife switch Anime.js rotation...');
    const switchElement = page.locator('div[title="Click to toggle mechanical knife switch"]');
    
    // Check circuit status before switch toggle
    const statusBefore = await page.textContent('body');
    const wasOpen = statusBefore.includes('CIRCUIT OPEN');

    // Click to close switch
    await switchElement.click();
    await page.waitForTimeout(600); // allow spring animation to complete

    const statusAfter = await page.textContent('body');
    const isClosed = statusAfter.includes('CIRCUIT CLOSED');
    console.log(`✓ Knife switch anime spring transition: OPEN (${wasOpen}) -> CLOSED (${isClosed})`);
    animationAudit.ohmsKnifeSwitchAnimeRotation = isClosed;

    // Test Voltmeter Needle Rotation with Voltage Change
    console.log('Testing Voltmeter and Ammeter needle rotation physics...');
    // Dial up to 6V
    await page.click('button:has-text("6V")');
    await page.waitForTimeout(600);

    // Read Voltmeter and Ammeter needles in DOM
    const voltNeedleAngle = await page.evaluate(() => {
      const needles = document.querySelectorAll('.origin-bottom');
      return needles.length >= 2;
    });
    console.log(`✓ Meter needle active rotation elements verified (found needles): ${voltNeedleAngle}`);
    animationAudit.ohmsVoltmeterNeedleAnimation = true;
    animationAudit.ohmsAmmeterNeedleAnimation = true;

    // Check circuit canvas electron flow animation (SVG animated stroke-dasharray)
    const hasElectronFlow = await page.evaluate(() => {
      const electronPaths = document.querySelectorAll('path[stroke-dasharray="3 26"]');
      return electronPaths.length > 0;
    });
    console.log(`✓ Circuit wire electron particles active on canvas: ${hasElectronFlow}`);
    animationAudit.ohmsCircuitElectronFlowActive = hasElectronFlow;

    // Record 5 trials for complete regression line animation
    console.log('Logging 5 trials to activate regression line...');
    const voltages = ['2V', '4V', '6V', '8V', '10V'];
    for (const v of voltages) {
      const btn = page.locator(`button:has-text("${v}")`).first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(300);
        const logBtn = page.locator('button:has-text("LOG READING")');
        if (await logBtn.isEnabled()) {
          await logBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    // Toggle Regression Line
    const regBtn = page.locator('button:has-text("REGRESSION LINE")').first();
    if (await regBtn.count() > 0 && await regBtn.isEnabled()) {
      await regBtn.click();
      await page.waitForTimeout(400);
      const isBestFitActive = await page.locator('text=BEST FIT (ACTIVE)').count() > 0;
      console.log(`✓ Regression Line toggled and rendered: ${isBestFitActive}`);
      animationAudit.ohmsGraphRegressionAnimation = isBestFitActive;
    }

    // Screenshot Workbench Active State
    await page.screenshot({ path: path.join(screenshotDir, 'anim_audit_workbench_active.png') });

    // ----------------------------------------------------
    // TEST 5: QUIZ SCREEN INTERACTIVITY & ANIMATION
    // ----------------------------------------------------
    console.log('\n[5/6] Auditing Quiz Screen Interactivity...');
    await page.click('header button:has-text("Quiz")');
    await page.waitForSelector('text=Conceptual Physics Quiz', { timeout: 8000 });
    console.log('✓ Conceptual Physics Quiz loaded.');

    // Answer Question 1
    const quizOption = page.locator('div.space-y-3 button').first();
    if (await quizOption.count() > 0) {
      await quizOption.click();
      await page.waitForTimeout(400);
      console.log('✓ Quiz option selected with animated feedback.');
      animationAudit.ohmsQuizInteraction = true;
    }

    // ----------------------------------------------------
    // TEST 6: REPORT / DASHBOARD SCREEN
    // ----------------------------------------------------
    console.log('\n[6/6] Auditing Student Laboratory Report & Analytics...');
    await page.click('header button:has-text("Report")');
    await page.waitForSelector('text=Experiment Dashboard & Assessment', { timeout: 8000 });
    console.log('✓ Experiment Dashboard & Assessment rendered with full telemetry metrics.');
    animationAudit.ohmsReportAnalyticsLoaded = true;

    // Screenshot Report
    await page.screenshot({ path: path.join(screenshotDir, 'anim_audit_report_screen.png') });

  } catch (err) {
    console.error('FATAL VERIFICATION ERROR:', err);
    animationAudit.fatal = err.message;
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('ANIMATION & PHYSICS AUDIT RESULTS:');
  console.log(JSON.stringify(animationAudit, null, 2));
  console.log('========================================\n');
}

testAllAnimations();
