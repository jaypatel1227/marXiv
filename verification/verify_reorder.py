import time
from playwright.sync_api import sync_playwright

def test_notes_reordering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a consistent context to ensure IndexedDB persists if needed, though we are just testing the flow once
        context = browser.new_context()
        page = context.new_page()

        # Navigate to a paper page.
        print("Navigating to paper page...")
        try:
            page.goto("http://localhost:4321/paper/2106.09685", timeout=30000)
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Wait for the paper to load
        try:
            page.wait_for_selector("h1", timeout=10000)
            print("Page loaded successfully.")
        except:
            print("Failed to load paper page content. Taking screenshot of error.")
            page.screenshot(path="verification/error_load.png")
            browser.close()
            return

        # Scroll down to ensure notes section is visible
        page.mouse.wheel(0, 500)
        time.sleep(1)

        print("Checking for Notes section...")

        # Add Note 1
        print("Adding Note 1...")
        try:
            page.get_by_role("button", name="Add Note").first.click()
            page.get_by_placeholder("Type your note here...").fill("Note 1")
            page.get_by_role("button", name="Add Note").click()
            page.wait_for_selector("text=Note 1")
        except Exception as e:
             print(f"Error adding note 1: {e}")
             page.screenshot(path="verification/error_adding_note1.png")

        # Add Note 2
        print("Adding Note 2...")
        try:
            page.get_by_role("button", name="Add Note").first.click()
            page.get_by_placeholder("Type your note here...").fill("Note 2")
            page.get_by_role("button", name="Add Note").click()
            page.wait_for_selector("text=Note 2")
        except Exception as e:
             print(f"Error adding note 2: {e}")
             page.screenshot(path="verification/error_adding_note2.png")

        # Verify initial order (Note 1 then Note 2, since we append)
        # Actually implementation appends, so Note 1 is first, Note 2 is second in DOM order.
        # Let's check text content of the cards.
        cards = page.locator(".group")
        first_card_text = cards.nth(0).inner_text()
        second_card_text = cards.nth(1).inner_text()
        print(f"Initial Order: 1: {first_card_text.splitlines()[0]}, 2: {second_card_text.splitlines()[0]}")

        # Drag and Drop to Reorder
        # We need to drag the first card (Note 1) below the second card (Note 2).
        print("Attempting to reorder...")
        try:
            # We need to grab the drag handle.
            # The handle is opacity-0 until hover, but playwright can grab it if it exists in DOM.
            # The handle has `cursor-grab`. Let's assume it's the first child or we can find it by class/icon.
            # In NoteCard.tsx: <div className="... cursor-grab ..."> <GripVertical ... /> </div>

            # Hover over the first card to make handle visible (good for screenshot too)
            cards.nth(0).hover()

            # Locate the drag handle
            # It's an element with `cursor-grab` class or containing the GripVertical icon.
            # Let's assume the drag handle is the div with onPointerDown.
            # It's the first child of CardContent which has `p-0`.
            drag_handle = cards.nth(0).locator(".cursor-grab")

            # Target: The second card
            target = cards.nth(1)

            # Perform Drag
            drag_handle.drag_to(target)

            # Wait a bit for animation/state update
            time.sleep(1)

            # Verify new order
            new_first_text = cards.nth(0).inner_text()
            print(f"New First Card Text: {new_first_text.splitlines()[0]}")

            if "Note 2" in new_first_text:
                print("Reordering SUCCESS: Note 2 is now first.")
            else:
                 print("Reordering FAILED or didn't change order.")

        except Exception as e:
            print(f"Error during reordering: {e}")
            page.screenshot(path="verification/error_reordering.png")

        # Hover over a card to show metadata (for screenshot)
        print("Hovering for final screenshot...")
        cards.first.hover()
        time.sleep(0.5)

        # Take Screenshot
        print("Taking final screenshot...")
        page.screenshot(path="verification/verification_reorder.png")

        print("Verification complete.")
        browser.close()

if __name__ == "__main__":
    test_notes_reordering()
