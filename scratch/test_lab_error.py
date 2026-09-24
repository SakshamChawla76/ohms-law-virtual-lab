from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on("console", lambda m: print("CONSOLE:", m.type, m.text))
    page.on("pageerror", lambda e: print("PAGEERROR:", e))
    page.goto("http://localhost:5188/")
    page.locator("#btn-launch-ohms-law").click()
    page.wait_for_timeout(1000)
    print("Clicking Workbench button...")
    page.get_by_role("button", name="Workbench", exact=True).click()
    page.wait_for_timeout(1000)
    browser.close()
