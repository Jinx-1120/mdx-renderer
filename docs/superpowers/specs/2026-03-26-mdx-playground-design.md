# MDX Playground - Design Spec

## Overview

A browser-based MDX playground that allows users to paste/write MDX content and see real-time rendered preview. Similar to [Tailwind Play](https://play.tailwindcss.com/) but for MDX format.

**Tech Stack:** React + TypeScript + Bun + Vite
**Deployment Target:** GitHub Pages (static SPA)
**Target Users:** Developers and content creators

## Architecture

### Compilation Strategy

Pure browser-side compilation using `@mdx-js/mdx`:

```
User types MDX text
       |
  CodeMirror 6 editor
       | (debounce ~300ms)
  @mdx-js/mdx compile()    <-- browser-side
       |
  Generated JS module code
       |
  @mdx-js/mdx run()        <-- inject built-in + user-defined components
       |
  React component rendered in iframe preview
```

No backend required. Bun is used only for development and build tooling.

### Key Dependencies

- **Build:** Bun + Vite + React
- **Editor:** CodeMirror 6 (`@codemirror/lang-markdown` for MDX syntax highlighting)
- **MDX Compilation:** `@mdx-js/mdx` (`compile` + `run`), `remark-gfm` (tables, strikethrough, etc.)
- **Styling:** Tailwind CSS v4 (Play CDN in iframe) + built-in Markdown theme
- **Preview Isolation:** `<iframe>` + `srcdoc`

## Layout

Upper section: left-right split pane (MDX editor + live preview).
Lower section: collapsible custom component editor panel (**collapsed by default**).
A draggable resizer between editor and preview to adjust split ratio (default 50%).

```
+--------------------------------------------------+
|  Toolbar (theme toggle, etc.)                     |
+------------------------+-------------------------+
|                        |                          |
|   MDX Editor           |   Live Preview           |
|   (CodeMirror 6)       |   (iframe)               |
|                        |                          |
+------------------------+-------------------------+
|  [v] Custom Components (collapsed by default)     |
+--------------------------------------------------+
```

## Project Structure

```
mdx-renderer/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Editor.tsx
│   │   ├── Preview.tsx
│   │   ├── ComponentPanel.tsx
│   │   ├── Toolbar.tsx
│   │   └── Resizer.tsx
│   ├── hooks/
│   │   ├── useMdxCompiler.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── mdx/
│   │   ├── builtins.tsx
│   │   ├── compiler.ts
│   │   └── iframe-template.ts
│   └── styles/
│       ├── index.css
│       └── markdown-theme.css
└── .github/
    └── workflows/
        └── deploy.yml
```

## State Management

No external state library. React `useState` + `useCallback`.

### App-Level State

```typescript
// Core content
mdxSource: string           // MDX editor content
componentSource: string     // User-defined component code

// UI state
theme: 'light' | 'dark'    // Current theme
panelOpen: boolean          // Component panel expanded (default: false)
editorWidth: number         // Editor width ratio (default: 50%)

// Compilation state
compiledResult: string | null    // Successfully compiled JS code
compileError: string | null      // Compilation error message
```

### Data Flow

1. User edits MDX -> `mdxSource` updates -> debounce 300ms -> triggers `useMdxCompiler`
2. `useMdxCompiler` calls `compile(mdxSource)` -> success sets `compiledResult`, failure sets `compileError`
3. `Preview` component watches `compiledResult` -> sends compiled code + built-in components + user components to iframe via `postMessage`
4. iframe receives message -> calls `run()` to execute -> renders React component
5. User edits custom components -> `componentSource` updates -> triggers recompile/rerender
6. All content changes auto-sync to localStorage

### Error Handling

- Compile errors displayed at top of preview area with red styling, non-blocking
- Last successful preview result preserved until next successful compile

## Preview Isolation (iframe)

### Why iframe

- User MDX content and Tailwind styles don't pollute editor UI
- Runtime errors in user-defined components don't crash the app
- Independent `<head>` for loading Tailwind CDN script

### iframe Internal Structure

```html
<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>/* markdown-theme.css built-in typography */</style>
</head>
<body class="markdown-body">
  <div id="root"></div>
  <script>
    // 1. Listen for postMessage to receive compiled result
    // 2. Call @mdx-js/mdx run() to execute
    // 3. Inject built-in + user components as MDX components
    // 4. ReactDOM.render() to #root
  </script>
</body>
</html>
```

### Communication Protocol

- Main app -> iframe: `postMessage({ type: 'render', code, components, theme })`
- iframe -> Main app: `postMessage({ type: 'error', message })` (runtime error reporting)
- Theme switch: main app notifies iframe to update `data-theme` attribute

### iframe Runtime Dependencies

The iframe must load its own copies of React and ReactDOM (via CDN or injected from main app bundle) since `run()` needs `react/jsx-runtime` to execute the compiled MDX. These are loaded via import maps or UMD scripts in the iframe `<head>`.

### Tailwind Loading

- Tailwind Play CDN (`<script src="https://cdn.tailwindcss.com">`) loaded at runtime inside iframe
- Not bundled into build output
- Does not affect main app styles

## Built-in Components (MVP)

| Component | Purpose | Example Use |
|-----------|---------|-------------|
| `<Callout type="info\|warning\|error\|tip">` | Alert/notice box | Warnings, tips, notes |
| `<Tabs>` + `<Tab label="...">` | Tab switching | Multi-language code examples |
| `<CodeBlock lang="...">` | Code block with syntax highlighting | Using Shiki or Prism |
| `<Steps>` + `<Step>` | Step-by-step guide | Installation tutorials |
| `<Badge variant="...">` | Label badge | Status markers, version numbers |
| `<Accordion>` + `<AccordionItem>` | Collapsible panel | FAQ, detailed explanations |

### User-Defined Components

Users write JSX in the bottom panel:

```tsx
const MyCard = ({ title, children }) => (
  <div className="border rounded-lg p-4 shadow-sm">
    <h3 className="font-bold">{title}</h3>
    {children}
  </div>
)
```

Then use `<MyCard title="Hello">content</MyCard>` directly in the MDX editor.

User-defined components override built-in components with the same name.

## Theme

- Auto-detect system dark/light preference via `prefers-color-scheme`
- Manual toggle in toolbar
- Theme applied to both editor (CodeMirror theme) and preview (iframe `data-theme`)
- Persisted to localStorage

## Data Persistence

- `mdxSource`, `componentSource`, `theme`, `panelOpen`, `editorWidth` saved to localStorage
- No backend, no URL sharing
- First load (empty localStorage) shows default example content

## Default Example Content

```mdx
# Welcome to MDX Playground

This is a **live MDX editor**. Edit the content on the left and see the preview on the right.

## Markdown Features

- Lists, **bold**, *italic*, `inline code`
- [Links](https://mdxjs.com) and images
- Tables, blockquotes, and more

## Using Components

<Callout type="tip">
  You can use built-in components like this Callout directly in your MDX content.
</Callout>

<Tabs>
  <Tab label="JavaScript">
    console.log('Hello from JS!')
  </Tab>
  <Tab label="Python">
    print('Hello from Python!')
  </Tab>
</Tabs>

## Tailwind CSS Support

<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
  You can use Tailwind CSS classes directly in your MDX!
</div>
```

## GitHub Pages Deployment

### Build

```bash
bun run build  # Vite build, output to dist/
```

### Vite Config

- `base: '/mdx-renderer/'` for GitHub Pages subpath
- Output to `dist/`

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
# Trigger: push to main
# Steps:
#   1. Checkout code
#   2. Install Bun
#   3. bun install
#   4. bun run build
#   5. Deploy dist/ to GitHub Pages
```

### CDN Dependencies

- Tailwind Play CDN loaded at runtime in iframe (not bundled)
- All other dependencies (React, CodeMirror, @mdx-js/mdx) bundled

## Future Considerations (Not in MVP)

- npm import support via esm.sh CDN (architecture reserved)
- URL-based sharing (encode content to hash or use backend)
- Multiple file tabs
- Export to standalone HTML
- Collaborative editing
