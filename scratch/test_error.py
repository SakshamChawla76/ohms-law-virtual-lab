from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on("console", lambda m: print("CONSOLE:", m.type, m.text))
    page.on("pageerror", lambda e: print("PAGEERROR:", e))
    page.goto("http://localhost:5188/")
    page.locator("#btn-launch-roller-coaster").click()
    page.wait_for_timeout(1000)
    print("Clicking Applications tab...")
    page.locator('button:has-text("Applications")').click()
    page.wait_for_timeout(1000)
    browser.close()
