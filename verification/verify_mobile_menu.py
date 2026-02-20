import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()

        try:
            # Go to home page
            print("Navigating to home page...")
            page.goto("http://localhost:4321")

            # Wait for the page to load
            page.wait_for_selector("text=marXiv")

            # Check if desktop nav is hidden
            # "Categories" link in header should be hidden
            # The desktop Categories link has text "Categories" and is in a div with hidden md:flex
            # We can check if it's visible. on 375px it should NOT be visible.
            # However, playwright is smart about visibility.
            # But wait, the mobile menu button should be visible.

            # Find the menu button (Hamburger)
            # It has an aria-label "Open Menu" (I added it)
            menu_button = page.get_by_label("Open Menu")

            # Allow some time for hydration/rendering
            time.sleep(2)

            if not menu_button.is_visible():
                print("Menu button not visible!")
                page.screenshot(path="verification/error_no_menu_button.png")
                return

            print("Menu button is visible.")

            # Click it
            menu_button.click()

            # Wait for drawer to open
            # Look for "Home", "Categories", "GitHub" links in the drawer
            # And the "Menu" title
            # We wait for the 'Menu' text inside the drawer
            page.wait_for_selector("text=Menu")

            # Wait a bit for animation
            time.sleep(1)

            # Take screenshot of the open menu
            page.screenshot(path="verification/mobile_menu_open.png")
            print("Screenshot taken: verification/mobile_menu_open.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
