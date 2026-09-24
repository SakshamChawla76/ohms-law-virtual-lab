import sys
import time
from playwright.sync_api import sync_playwright

def verify_simulations():
    print("[Playwright] Launching Chromium browser to verify Science Simulation Platform...")
    screenshots_dir = "C:/Users/HP/.gemini/antigravity-ide/brain/01c79cf4-a71b-4d83-9765-67158cbab552"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        def capture(name):
            try:
                page.screenshot(path=f"{screenshots_dir}/{name}", timeout=8000)
                print(f" - Captured: {name}")
            except Exception as e:
                print(f" - Notice on {name}: {e}")

        # ----------------------------------------------------
        # 1. Discovery Hub - Physics Branch
        # ----------------------------------------------------
        print("1. Navigating to Discovery Hub (Physics) on http://localhost:5188/ ...")
        page.goto("http://localhost:5188/", wait_until="domcontentloaded")
        time.sleep(1)
        capture("sim_01_hub_physics.png")

        # ----------------------------------------------------
        # 2. Discovery Hub - Switch to Chemistry
        # ----------------------------------------------------
        print("2. Switching to Chemistry Branch...")
        page.locator('button:has-text("Chemistry Simulations")').click()
        time.sleep(1)
        capture("sim_02_hub_chemistry.png")

        # ----------------------------------------------------
        # 3. Discovery Hub - Search Filtering
        # ----------------------------------------------------
        print("3. Filtering Chemistry labs for 'Airbag'...")
        search_input = page.locator('input[type="text"]')
        search_input.fill("Airbag")
        time.sleep(0.5)
        capture("sim_03_hub_search.png")

        # ----------------------------------------------------
        # 4. Launch Airbag Chemistry Simulation (#btn-launch-airbag)
        # ----------------------------------------------------
        print("4. Launching Airbag Chemistry Simulation...")
        page.locator('#btn-launch-airbag').click()
        time.sleep(1)
        capture("sim_04_airbag_curiosity.png")

        # Switch to Interactive Sandbox
        print(" - Switching to Airbag Sandbox tab...")
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1)
        capture("sim_05_airbag_sandbox_initial.png")

        # Trigger Crash Sensor
        print(" - Triggering Crash Sensor in Airbag Simulation...")
        crash_btn = page.locator('button:has-text("TRIGGER CRASH")')
        if crash_btn.is_visible():
            crash_btn.click()
            time.sleep(2.0)
            capture("sim_06_airbag_inflated.png")

        # ----------------------------------------------------
        # 5. Return to Hub & Launch Roller Coaster Physics Lab
        # ----------------------------------------------------
        print("5. Returning to Discovery Hub...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)

        print(" - Switching to Physics and opening Roller Coaster...")
        page.locator('button:has-text("Physics Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-roller-coaster').click()
        time.sleep(1)

        print(" - Switching to Roller Coaster Sandbox...")
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_07_roller_coaster_sandbox.png")

        print(" - Verifying Roller Coaster 'Challenge Me' Tab...")
        page.locator('button:has-text("Challenge Me")').click()
        time.sleep(1)
        capture("sim_08_roller_coaster_challenge.png")

        print(" - Verifying Roller Coaster 'Applications' Tab...")
        page.locator('button:has-text("Applications")').click()
        time.sleep(1)
        capture("sim_09_roller_coaster_applications.png")

        # ----------------------------------------------------
        # 6. Launch Diamond Cut Optics Simulation
        # ----------------------------------------------------
        print("6. Launching Diamond Cut Optics Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('#btn-launch-diamond-cut').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1)
        capture("sim_10_diamond_cut_sandbox.png")

        # ----------------------------------------------------
        # 7. Launch Density & Buoyancy Chemistry Lab
        # ----------------------------------------------------
        print("7. Launching Going Fishing Density Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('button:has-text("Chemistry Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-density').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1)
        capture("sim_11_density_sandbox.png")

        # ----------------------------------------------------
        # 8. Launch Collision / Bumper Cars Physics Lab
        # ----------------------------------------------------
        print("8. Launching Bumper Cars Momentum Collision Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('button:has-text("Physics Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-bumper-cars').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_12_collision_sandbox.png")

        # ----------------------------------------------------
        # 9. Launch Bow & Arrow Projectile Ballistics Lab
        # ----------------------------------------------------
        print("9. Launching Bow and Arrow Projectile Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('#btn-launch-bow-and-arrow').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_13_projectile_sandbox.png")

        # ----------------------------------------------------
        # 10. Launch Doppler Ducks Wave Simulation
        # ----------------------------------------------------
        print("10. Launching Doppler Ducks & Sonic Shockwaves Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('#btn-launch-doppler-ducks').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_14_doppler_sandbox.png")

        # ----------------------------------------------------
        # 11. Launch Phases of Matter & Gas Laws Lab
        # ----------------------------------------------------
        print("11. Launching Phases of Matter & Gas Laws Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('button:has-text("Chemistry Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-phases-of-matter').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_15_gas_laws_sandbox.png")

        # ----------------------------------------------------
        # 12. Launch Atom Builder & Periodic Table Lab
        # ----------------------------------------------------
        print("12. Launching Atom Builder Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('button:has-text("Chemistry Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-atom-builder').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_16_atom_builder_sandbox.png")

        # ----------------------------------------------------
        # 13. Launch Newton's Cannon Lab (Universal Engine)
        # ----------------------------------------------------
        print("13. Launching Newton's Cannon Orbital Mechanics Simulation...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('button:has-text("Physics Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-newtons-cannon').click()
        time.sleep(1)
        page.locator('button:has-text("Sandbox")').click()
        time.sleep(1.5)
        capture("sim_17_newtons_cannon_sandbox.png")

        # ----------------------------------------------------
        # 14. Launch Ohm's Law Precision Virtual Lab
        # ----------------------------------------------------
        print("14. Launching Ohm's Law Precision Lab...")
        page.locator('#hub-back-btn').click()
        time.sleep(1)
        page.locator('button:has-text("Physics Simulations")').click()
        time.sleep(0.5)
        page.locator('#btn-launch-ohms-law').click()
        time.sleep(1.5)

        print(" - Navigating to Ohm's Law Circuit Workbench...")
        page.get_by_role("button", name="Apparatus", exact=True).click()
        time.sleep(1)
        capture("sim_18_ohms_law_apparatus.png")

        page.get_by_role("button", name="Workbench", exact=True).click()
        time.sleep(1)
        capture("sim_19_ohms_law_breadboard.png")

        # Trigger Auto-Wire Demo in Ohm's Law
        print(" - Triggering Auto-Wire Demo in Ohm's Law...")
        auto_wire_btn = page.locator('button:has-text("Auto-Wire Demo")')
        if auto_wire_btn.is_visible():
            auto_wire_btn.click()
            time.sleep(1)
            capture("sim_20_ohms_law_wired.png")

        # Return to Hub from Ohm's Law
        print("15. Returning to Hub from Ohm's Law...")
        page.locator('#header-hub-btn').click()
        time.sleep(1)
        capture("sim_21_hub_final.png")

        browser.close()

        print("\n==========================================")
        print("       SIMULATION VERIFICATION RESULTS     ")
        print("==========================================")
        print(f"Total Page/Console Errors: {len(console_errors)}")
        if console_errors:
            print("Errors detected:")
            for err in console_errors:
                print(f"  ❌ {err}")
            sys.exit(1)
        else:
            print("[ALL TESTS PASSED] ALL SCIENCE SIMULATION FRONTEND FLOWS PASSED WITH 0 CONSOLE ERRORS!")
            print("==========================================")

if __name__ == "__main__":
    verify_simulations()
