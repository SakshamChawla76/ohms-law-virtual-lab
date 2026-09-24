import sys
import time
from playwright.sync_api import sync_playwright

ALL_SIMS = [
    ('physics', 'ohms-law'),
    ('physics', 'roller-coaster'),
    ('physics', 'diamond-cut'),
    ('physics', 'flashlight'),
    ('physics', 'bumper-cars'),
    ('physics', 'doppler-ducks'),
    ('physics', 'newtons-cannon'),
    ('physics', 'bow-and-arrow'),
    ('physics', 'prom-night'),
    ('physics', 'elevator'),
    ('physics', 'walk-the-tightrope'),
    ('physics', 'heat-engine'),
    ('chemistry', 'airbag'),
    ('chemistry', 'density'),
    ('chemistry', 'atom-builder'),
    ('chemistry', 'phases-of-matter'),
    ('chemistry', 'hot-pack-cold-pack'),
    ('chemistry', 'battery-redox'),
    ('chemistry', 'balancing-equations'),
    ('chemistry', 'rock-candy-solubility'),
    ('chemistry', 'flat-vs-fizzy-soda'),
    ('chemistry', 'gold-foil')
]

def test_all():
    print(f"[Playwright] Testing ALL {len(ALL_SIMS)} simulations for 100% operational status...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        errors = []
        page.on("console", lambda m: errors.append(f"Console: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))

        page.goto("http://localhost:5188/", wait_until="domcontentloaded")
        time.sleep(1)

        for branch, sim_id in ALL_SIMS:
            print(f" -> Testing [{branch.upper()}] {sim_id} ...")
            # Select branch
            branch_text = "Physics Simulations" if branch == "physics" else "Chemistry Simulations"
            page.locator(f'button:has-text("{branch_text}")').click()
            time.sleep(0.3)

            # Launch sim
            btn = page.locator(f'#btn-launch-{sim_id}')
            if not btn.is_visible():
                errors.append(f"Button #btn-launch-{sim_id} not visible on Hub!")
                continue
            btn.click()
            time.sleep(0.8)

            # Switch to sandbox tab if not ohms-law
            if sim_id != 'ohms-law':
                sandbox_tab = page.locator('button:has-text("Sandbox")')
                if sandbox_tab.is_visible():
                    sandbox_tab.click()
                    time.sleep(0.5)

            # Return to hub
            if sim_id == 'ohms-law':
                page.locator('#header-hub-btn').click()
            else:
                page.locator('#hub-back-btn').click()
            time.sleep(0.5)

        browser.close()

        print("\n==========================================")
        print(f"Results: {len(ALL_SIMS)} simulations tested.")
        print(f"Total Errors Encountered: {len(errors)}")
        if errors:
            for e in errors:
                print(f" ❌ {e}")
            sys.exit(1)
        else:
            print(" [PASS] ALL 22 SIMULATIONS LOADED AND RAN WITH ZERO ERRORS!")
            print("==========================================")

if __name__ == '__main__':
    test_all()
