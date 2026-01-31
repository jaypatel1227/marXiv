## 2024-05-22 - Accessible Icon-Only Buttons
**Learning:** Icon-only buttons (like the PDF download link) are invisible to screen readers without an `aria-label`. Also, links opening in a new tab (`target="_blank"`) need to announce this behavior to avoid confusing users.
**Action:** Always add `aria-label` to icon-only buttons and include "(opens in new tab)" in the label for external links.
