import os
import time
from playwright.sync_api import sync_playwright

def verify_themes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for server to start
        print("Waiting for server to start...")
        page.goto("http://localhost:4321")
        page.wait_for_load_state("networkidle")
        print("Page loaded.")

        # Open Theme Settings
        settings_btn = page.get_by_label("Theme Settings")
        settings_btn.click()
        print("Settings opened.")

        # Wait for dropdown animation
        time.sleep(2)

        # Debug screenshot
        page.screenshot(path="verification/debug_settings_open.png")
        print("Debug screenshot saved.")

        # Select Swiss Paper Theme
        swiss_btn = page.get_by_text("Swiss", exact=False).first
        if swiss_btn.is_visible():
            swiss_btn.click()
            print("Selected Swiss theme.")
        else:
            print("Swiss button not visible!")
            return

        # Select Editorial Font
        editorial_btn = page.get_by_text("Editorial").first
        editorial_btn.click()
        print("Selected Editorial font.")

        # Wait for styles to apply
        time.sleep(1)
        page.screenshot(path="verification/swiss_editorial.png", full_page=True)
        print("Screenshot saved: verification/swiss_editorial.png")

        # Now switch to Amber CRT
        amber_btn = page.get_by_text("Amber").first
        amber_btn.click()
        print("Selected Amber theme.")

        # Select Raw Font
        raw_btn = page.get_by_text("Raw").first
        raw_btn.click()
        print("Selected Raw font.")

        time.sleep(1)
        page.screenshot(path="verification/amber_raw.png", full_page=True)
        print("Screenshot saved: verification/amber_raw.png")

        browser.close()

if __name__ == "__main__":
    verify_themes()
