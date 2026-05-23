## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Current Project Architecture

**This repository is a browser-only MDX Playground.**

The app is a static React + TypeScript SPA deployed under the GitHub Pages base path `/mdx-renderer/`. There is no backend service, database, server-side rendering, or API layer in the current implementation.

### Tooling

- Use Bun as the package manager and command runner: `bun install`, `bun run dev`, `bun run build`, `bun run test`.
- The current frontend toolchain is Vite + Vitest. Do not replace it with `Bun.serve`, Bun HTML imports, or native `bun test` unless the task is explicitly a tooling migration.
- Current scripts are:
  - `bun run dev`: Vite dev server.
  - `bun run build`: `tsc && vite build`.
  - `bun run preview`: Vite production preview.
  - `bun run test`: Vitest test suite with jsdom.

### Runtime Flow

1. `src/App.tsx` owns the top-level layout and persisted state.
2. `src/components/Editor.tsx` provides the MDX editor through CodeMirror.
3. `src/hooks/useMdxCompiler.ts` debounces MDX source changes before compiling.
4. `src/mdx/compiler.ts` strips HTML comments, compiles MDX with `@mdx-js/mdx` using `outputFormat: 'function-body'`, enables GFM through `remark-gfm`, and transforms user component JSX with Sucrase.
5. `src/components/Preview.tsx` sends compiled code and transformed user components into a sandboxed iframe through `postMessage`.
6. `src/mdx/iframe-template.ts` builds the iframe document. The iframe loads React/ReactDOM UMD from unpkg, Tailwind from CDN, embeds the markdown theme CSS, registers built-in components, executes the compiled MDX, and renders into `#root`.
7. Runtime errors inside the iframe are shown in the preview error area and reported back to the host window.

### Main Boundaries

- `src/components/`: UI shells and interaction surfaces (`Toolbar`, `Editor`, `Preview`, `ComponentPanel`, `Resizer`).
- `src/hooks/`: reusable state/effect hooks (`useLocalStorage`, `useTheme`, `useMdxCompiler`).
- `src/mdx/`: MDX-specific compilation, built-in component source, iframe HTML generation, and default content.
- `src/styles/`: host app styling and iframe markdown typography.
- `src/tests/`: Vitest tests for compiler behavior and localStorage hook behavior.

### Persistence and State

The app persists editor content, custom component source, theme selection, component panel state, and editor width in `localStorage`. Keep storage keys stable unless a migration or reset behavior is part of the requested change.

### Review Priorities

When changing this project, prioritize:

- Preserving iframe isolation between user MDX/runtime errors and the host editor UI.
- Keeping custom component execution explicit and scoped to the preview iframe.
- Maintaining GitHub Pages compatibility with the `/mdx-renderer/` base path.
- Verifying with `bun run test` and `bun run build` after implementation.
- Running a browser smoke test for changes that affect rendering, iframe messaging, theming, or layout.
