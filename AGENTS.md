# AGENTS.md

This document provides context and guidelines for AI agents and developers working on this codebase.

## 📌 Project Overview
This is a modern arXiv browser built with **Astro**, **React**, and **Tailwind CSS**. It is designed to be fast, responsive, and provide a clean reading experience for research papers.

**Key Technologies:**
- **Framework:** [Astro](https://astro.build) (Server-Side Rendering)
- **UI Components:** [React](https://react.dev)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Package Manager:** [Bun](https://bun.sh)
- **Deployment:** Netlify Adapter

## 📂 Architecture

### Directory Structure
- `src/components/`: React UI components.
  - `ui/`: Reusable primitive components.
  - `AdvancedSettings.tsx`: Full-page advanced configuration.
  - `CategoryBrowser.tsx`: Browser for arXiv categories.
  - `InfinitePaperList.tsx`: Infinite scroll list for papers.
  - `MarkdownRenderer.tsx`: Renders markdown/LaTeX content.
  - `PaperCard.tsx`: Displays individual paper details.
  - `SearchBar.tsx`: Search interface.
  - `ThemeSettings.tsx`: Controls for themes and fonts (popup).
- `src/layouts/`: Astro layouts (e.g., `Layout.astro`).
- `src/pages/`: Astro file-based routing.
  - `api/`: API endpoints.
  - `paper/`: Paper detail pages.
  - `settings.astro`: Advanced settings page.
- `src/lib/`: Business logic and utilities.
  - `arxiv.ts`: Handles fetching data from the arXiv API.
  - `categories.ts`: Definitions for paper categories.
  - `storage.ts`: IndexedDB wrapper for settings persistence.
  - `utils.ts`: General helper functions.

## 🚀 Best Practices & Guidelines

### 1. Package Management
- **Strictly use Bun.**
- Do **not** use `npm`, `pnpm`, or `yarn`.
- Install dependencies: `bun install`
- Run scripts: `bun run dev`, `bun run build`

### 2. Astro & React Interop
- **Avoid Raw Script Tags:** Do not use `<script>` tags directly in Astro components (`.astro` files) for interactivity if possible.
  - ❌ **Avoid:** `<script> document.querySelector(...) </script>`
  - ✅ **Preferred:** Encapsulate interactive logic in **React components** or use Astro islands (`client:*` directives).
  - If a script tag is absolutely necessary for global initialization (e.g., theme toggle to prevent flash of unstyled content), ensure it is minimal and robust.

### 3. TypeScript
- Maintain strict type safety.
- Define interfaces for data models (e.g., Paper, Category) in `src/lib/`.
- Avoid `any` types.

### 4. Styling (Tailwind CSS)
- Use utility classes for styling.
- Utilize the Tailwind v4 configuration in `src/styles/global.css` (using `@theme`).
- Keep styles consistent with the existing design system (dark mode, typography).

### 5. Settings & Configuration
- **Quick Settings:** The `ThemeSettings` component (popup) is for quick, frequent adjustments (e.g., toggling theme or font).
- **Advanced Settings:** The `/settings` page (`AdvancedSettings` component) is the home for comprehensive configuration.
  - It should include all available settings, including those in the quick popup.
  - It is the exclusive location for data management tasks (Export/Import of IndexedDB data).
  - Any future complex configurations (e.g., API keys, advanced filtering defaults) should be added here.

### 6. Fetching Data
- Use `src/lib/arxiv.ts` for all arXiv API interactions.
- Respect API rate limits.

## 🛠️ Development

To start the development server:
```bash
bun run dev
```

To build for production:
```bash
bun run build
```
