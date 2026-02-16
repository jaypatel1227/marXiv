# Modern arXiv Browser

A sleek, modern interface for browsing arXiv papers, built with **Astro**, **React**, and **Tailwind CSS**.

## 🚀 Stack

*   **Framework:** [Astro](https://astro.build)
*   **UI Library:** [React](https://reactjs.org)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com)
*   **Icons:** [Lucide React](https://lucide.dev)
*   **Data Source:** [arXiv API](https://arxiv.org/help/api/index)

## 🛠️ Features

*   **Dark Mode:** Sleek dark-themed interface by default.
*   **Infinite Scroll:** Seamless browsing of papers.
*   **Search:** Powerful search functionality powered by arXiv.
*   **Responsive:** Optimized for all devices.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `bun install`     | Installs dependencies                        |
| `bun run dev`     | Starts local dev server at `localhost:4321`  |
| `bun run build`   | Build your production site to `./dist/`      |
| `bun run preview` | Preview your build locally, before deploying |

## 📁 Project Structure

```text
/
├── public/
├── src/
│   ├── components/  # React components (Search, PaperCard, etc.)
│   ├── layouts/     # Astro layouts
│   ├── lib/         # Utility functions (arXiv API, etc.)
│   └── pages/       # Astro pages (routes)
└── package.json
```
