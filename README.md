# Construction App

A simple React + TypeScript + Vite project for managing construction tasks visually on a plan. This app lets you add, edit, and move task pins, view task details, and manage task status—all with a clean, modern UI.

---

## Time Spent on Each Feature/Task

Here’s a realistic breakdown of the time spent on each major part of the project:

| Feature/Task                                 | Time Spent |
| -------------------------------------------- | ---------- |
| Project setup (Vite, TS, Tailwind, radix-ui) | 1h         |
| Task data modeling & hooks                   | 1h         |
| Task pin rendering on plan                   | 2h         |
| Drag & drop for pins (with debugging)        | 3h         |
| Task popover & sidebar UI                    | 1h         |
| Editable task text/status                    | 1h         |
| General styling & polish                     | 2h         |
| Testing & bugfixes and deploying             | 2h         |
| **Total**                                    | **13h**    |

> **Note:** The drag-and-drop feature took extra time due to a couple of tricky bugs that required debugging and some refactoring.

---

## Getting Started

1. **Install dependencies:**

   ```sh
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

2. **Run the app locally:**

   ```sh
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) to see the app in action.

---

## Potential Improvements & Refactoring

Given more time, here’s what I’d like to improve or refactor:

- **Drag-and-drop logic:**
  - Further simplify and clean the drag-and-drop code for better maintainability.
  - Add more robust edge-case handling (e.g., pin overlap, mobile touch support).
- **State management:**
  - Currently, Zustand is used for global state (such as database connection and user), while local state is managed with React's useState.
  - Adding a Business Logic Layer would allow for more specific functions, such as validation, business rules, and data transformation, making the app easier to maintain and extend as it grows.
- **Testing:**
  - Add thorough unit and integration tests, especially for drag-and-drop and task editing.
- **Accessibility:**
  - Improve keyboard navigation and ARIA attributes for better accessibility.
- **File organization:**
  - Refactor large files into smaller, focused modules if they grow beyond 200 lines.
- **Performance:**
  - Optimize rendering for large numbers of tasks/pins.

---

## Questions or Feedback?

Feel free to reach out if you have any questions or suggestions!
