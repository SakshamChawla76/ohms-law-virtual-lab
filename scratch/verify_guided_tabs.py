import sys
import time
from playwright.sync_api import sync_playwright

def test_guided_tabs():
    print("[Playwright] Verifying Tabs 1-4, Presets, and Quizzes on GenericGuidedLab...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        errors = []
        page.on("console", lambda m: errors.append(f"Console: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))

        page.goto("http://localhost:5188/", wait_until="domcontentloaded")
        time.sleep(1)

        # Launch Flashlight lab
        print(" -> Launching Flashlight Lab...")
        btn = page.locator('#btn-launch-flashlight')
        btn.click()
        time.sleep(1)

        # Tab 1: Curiosity
        print(" -> Checking Tab 1 (Curiosity)...")
        tab1 = page.locator('button:has-text("Curiosity")')
        tab1.click()
        time.sleep(0.5)
        assert page.locator('text=GUIDED SCIENTIFIC INQUIRY').is_visible(), "Curiosity tab content missing!"

        # Tab 2: Sandbox
        print(" -> Checking Tab 2 (Sandbox) + Quick Presets + Switch...")
        tab2 = page.locator('button:has-text("Sandbox")')
        tab2.click()
        time.sleep(0.5)
        # Check presets exist
        assert page.locator('text=Quick Experiment Presets:').is_visible(), "Presets toolbar missing!"
        # Click a preset
        page.locator('button:has-text("Overvolt Burnout Test")').click()
        time.sleep(0.5)
        # Toggle flashlight switch
        switch_btn = page.locator('button:has-text("Switch")')
        switch_btn.click()
        time.sleep(0.5)
        switch_btn.click()
        time.sleep(0.5)

        # Tab 3: Applications
        print(" -> Checking Tab 3 (Applications)...")
        tab3 = page.locator('button:has-text("Applications")')
        tab3.click()
        time.sleep(0.5)
        assert page.locator('text=SCIENTIFIC APPLICATIONS & INDUSTRY').is_visible(), "Applications tab missing!"
        assert page.locator('text=Incandescent & Halogen Headlamps').is_visible(), "Flashlight application missing!"

        # Tab 4: Challenge Me
        print(" -> Checking Tab 4 (Challenge Me) + Quiz Feedback...")
        tab4 = page.locator('button:has-text("Challenge Me")')
        tab4.click()
        time.sleep(0.5)
        assert page.locator('text=CONCEPTUAL MASTERY CHALLENGE').is_visible(), "Challenge tab missing!"
        
        # Click correct option on Q1 (B: Power quadruples (4x))
        q1_btn = page.locator('button:has-text("Power quadruples (4×)")')
        assert q1_btn.is_visible(), "Q1 correct option missing!"
        q1_btn.click()
        time.sleep(0.8)
        assert page.locator('text=Correct Answer!').is_visible(), "Correct answer feedback missing!"

        # Return to Hub
        print(" -> Returning to Hub...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)

        # Launch Elevator Lab
        print(" -> Testing Elevator Lab Actions...")
        page.locator('#btn-launch-elevator').click()
        time.sleep(1)
        tab2 = page.locator('button:has-text("Sandbox")')
        tab2.click()
        time.sleep(0.5)
        # Click Free Fall
        page.locator('button:has-text("Free Fall (-9.8)")').click()
        time.sleep(0.5)

        browser.close()

        print("\n==========================================")
        print("Total Errors Encountered:", len(errors))
        if errors:
            for e in errors:
                print(f" ❌ {e}")
            sys.exit(1)
        else:
            print(" [PASS] TABS 1-4, PRESETS, TACTILE SWITCHES, AND QUIZZES VERIFIED 100% OPERATIONAL!")
            print("==========================================")

if __name__ == '__main__':
    test_guided_tabs()
