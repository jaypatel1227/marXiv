# Project Plan: Modern arXiv React/Astro Site

## 1. Clean Repository & Initialize Spec
*   [x] Delete all files and directories in the repository except for `.git`, `LICENSE`, and `README.md`.
*   [x] Create a `Spec/` directory.
*   [x] Save the detailed project plan into `Spec/plan.md`.

## 2. Initialize Astro Project with React & Tailwind
*   Run `npm create astro@latest . -- --template minimal --install --no-git --typescript --skip-houston` to scaffold a new Astro project in the root.
*   Install React integration: `npx astro add react --yes`.
*   Install Tailwind CSS integration: `npx astro add tailwind --yes`.
*   Install dependencies: `fast-xml-parser` (for arXiv XML), `lucide-react` (icons), `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot` (for Shadcn-like components).
*   Update `README.md` to reflect the new project.

## 3. Configure UI & Dark Mode
*   Configure `tailwind.config.mjs` to support dark mode (class-based or default).
*   Create `src/styles/globals.css` with dark mode CSS variables (background, foreground, card, primary, etc.) to achieve the "sleek" look.
*   Ensure the `Layout.astro` applies the dark theme by default (e.g., adding `class="dark"` to `<html>` or `<body>`).

## 4. Implement arXiv API Utility
*   Create `src/lib/arxiv.ts`.
*   Implement functions to query the arXiv API (`http://export.arxiv.org/api/query`) for:
    *   Search results.
    *   Get paper by ID.
    *   Get papers by category.
*   Handle XML parsing using `fast-xml-parser` and format the data into a clean TypeScript interface.

## 5. Build Core React Components (Islands)
*   `src/components/ui/button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx` (Manual implementation of Shadcn components).
*   `src/components/SearchBar.tsx`: Client-side search input that redirects to the search page.
*   `src/components/PaperCard.tsx`: Display component for a single paper.
*   `src/components/InfinitePaperList.tsx`: A React component that accepts an initial list of papers and a fetch function/query. It will implement an Intersection Observer to load more papers (infinite scroll) from the API.

## 6. Develop Pages
*   `src/layouts/Layout.astro`: Main application shell with Navbar (Search, Links) and Footer.
*   `src/pages/index.astro` (Homepage): Fetch recent CS papers server-side and render `InfinitePaperList`.
*   `src/pages/categories.astro`: Implement a page with tabs/sections for different categories (AI, Physics, Math, etc.).
*   `src/pages/search.astro`: Extract `q` param from URL, perform initial search server-side, and render `InfinitePaperList`.
*   `src/pages/paper/[id].astro`: Dynamic route to fetch and display detailed info for a specific paper, including the direct PDF link.

## 7. Verify & Polish
*   Verify all pages work (Home, Categories, Search, Details).
*   Check responsive design and dark mode aesthetics.
*   Ensure infinite scroll works correctly.

## 8. Pre-commit steps
*   Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.

## 9. Submit
*   Submit the changes.
