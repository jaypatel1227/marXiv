from playwright.sync_api import sync_playwright, expect
import time

def verify_categories(page):
    # Enable console logging
    page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

    # 1. Navigate to categories page
    print("Navigating...")
    page.goto("http://localhost:4321/categories")

    # 2. Check initial state
    expect(page.get_by_role("heading", name="All Categories")).to_be_visible()

    # Wait for hydration
    print("Waiting for hydration...")
    time.sleep(2)

    # 3. Type in search bar
    print("Typing...")
    search_input = page.get_by_placeholder("Filter categories...")
    search_input.click()
    # Use press_sequentially to ensure events fire
    search_input.press_sequentially("Robotics", delay=100)

    # Wait for state update
    time.sleep(1)

    # 4. Wait for dropdown
    print("Looking for dropdown...")
    dropdown_item = page.locator("button").filter(has_text="Robotics").first

    if not dropdown_item.is_visible():
         print("Dropdown not visible. Screenshotting...")
         page.screenshot(path="verification/debug_no_dropdown.png")

    expect(dropdown_item).to_be_visible()
    page.screenshot(path="verification/2_dropdown.png")

    # 5. Hit enter to filter
    print("Filtering...")
    search_input.press("Enter")

    # 6. Wait for filtering
    time.sleep(1)
    expect(page.get_by_role("heading", name="Computer Science")).to_be_visible()
    expect(page.get_by_role("heading", name="Physics")).not_to_be_visible()

    # Check specifically for the heading inside the card
    expect(page.get_by_role("heading", name="Robotics")).to_be_visible()

    page.screenshot(path="verification/3_filtered.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_categories(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
