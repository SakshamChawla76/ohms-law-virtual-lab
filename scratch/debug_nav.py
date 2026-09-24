from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:5188/')
    page.locator('button:has-text("Launch Lab")').first.click()
    page.wait_for_timeout(1000)
    print("Sim URL:", page.url)
    btns = page.locator('#hub-back-btn').count()
    print("#hub-back-btn count:", btns)
    page.locator('button:has-text("Applications")').click()
    page.wait_for_timeout(1000)
    btns_after = page.locator('#hub-back-btn').count()
    print("#hub-back-btn count after Applications:", btns_after)
    is_vis = page.locator('#hub-back-btn').is_visible()
    print("is_visible:", is_vis)
    print("Text content of all buttons:", [b.inner_text() for b in page.locator('button').all()])
    browser.close()
