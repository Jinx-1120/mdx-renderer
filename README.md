# MDX Playground

A browser-based MDX playground with live preview. Write MDX on the left, see the rendered result on the right — similar to [Tailwind Play](https://play.tailwindcss.com/), but for MDX.

**[Live Demo](https://jinx-1120.github.io/mdx-renderer/)**

## Features

- **Live Preview** — Real-time MDX rendering as you type (300ms debounce)
- **Built-in Components** — Callout, Tabs, CodeBlock, Steps, Badge, Accordion ready to use
- **Custom Components** — Define your own React components in the bottom panel
- **Tailwind CSS** — Full Tailwind utility class support in the preview
- **Dark / Light Theme** — Auto-detects system preference, manual toggle available
- **Persistent State** — Editor content, theme, and layout saved to localStorage
- **GFM Support** — Tables, strikethrough, task lists via remark-gfm
- **HTML Comments** — `<!-- -->` comments are supported and stripped before compilation
- **Resizable Panes** — Drag the divider to adjust editor/preview width

## Built-in Components

| Component | Usage |
|-----------|-------|
| `<Callout type="info\|tip\|warning\|error">` | Alert/notice box |
| `<Tabs>` + `<Tab label="...">` | Tab switching |
| `<CodeBlock lang="...">` | Code block |
| `<Steps>` + `<Step>` | Step-by-step guide |
| `<Badge variant="default\|primary\|success\|warning\|danger">` | Label badge |
| `<Accordion>` + `<AccordionItem title="...">` | Collapsible panel |

### Custom Components

Open the "Custom Components" panel at the bottom and write JSX:

```tsx
const MyCard = ({ title, children }) => (
  <div className="border rounded-lg p-4 shadow-sm">
    <h3 className="font-bold">{title}</h3>
    {children}
  </div>
)
```

Then use `<MyCard title="Hello">content</MyCard>` in the MDX editor. Custom components override built-in components with the same name.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Build**: [Vite](https://vite.dev)
- **UI**: [React](https://react.dev) + TypeScript
- **Editor**: [CodeMirror 6](https://codemirror.net/) via [@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror)
- **MDX**: [@mdx-js/mdx](https://mdxjs.com/) (browser-side compile + run)
- **JSX Transform**: [Sucrase](https://github.com/alangpierce/sucrase) (for custom components)
- **Styling**: Tailwind CSS (CDN in preview iframe), CSS custom properties (editor chrome)
- **Testing**: [Vitest](https://vitest.dev/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+

### Install & Run

```bash
git clone https://github.com/Jinx-1120/mdx-renderer.git
cd mdx-renderer
bun install
bun run dev
```

Open http://localhost:5173/mdx-renderer/ in your browser.

### Other Commands

```bash
bun run build      # Production build (outputs to dist/)
bun run preview    # Preview production build locally
bun run test       # Run tests
bun run test:watch # Run tests in watch mode
```

## Architecture

```
Browser (Main App)                    iframe (Preview)
┌─────────────────────┐              ┌──────────────────────┐
│  CodeMirror Editor   │              │  React 18 (UMD CDN)  │
│        │             │  postMessage │  Tailwind CSS (CDN)  │
│        ▼             │ ──────────► │  Markdown theme CSS   │
│  @mdx-js/mdx        │              │  Built-in components  │
│  compile()           │              │        │              │
│  (function-body)     │              │        ▼              │
│        │             │              │  AsyncFunction(code)  │
│        ▼             │              │  + jsx-runtime shim   │
│  Compiled JS string  │              │        │              │
│                      │              │        ▼              │
│  Sucrase transform   │              │  ReactDOM.render()    │
│  (custom components) │              │                       │
└─────────────────────┘              └──────────────────────┘
```

MDX is compiled in the main app using `@mdx-js/mdx` with `outputFormat: 'function-body'`. The compiled code is sent to an isolated `<iframe>` via `postMessage`, where it is executed and rendered. The iframe loads its own React and Tailwind from CDN, providing full style and error isolation.

## Project Structure

```
src/
├── App.tsx                    # Root component, state management
├── main.tsx                   # React entry point
├── components/
│   ├── Editor.tsx             # CodeMirror MDX editor
│   ├── Preview.tsx            # iframe preview + postMessage
│   ├── ComponentPanel.tsx     # Custom component editor (collapsible)
│   ├── Toolbar.tsx            # Theme toggle
│   └── Resizer.tsx            # Draggable split pane divider
├── hooks/
│   ├── useMdxCompiler.ts      # Debounced MDX compilation
│   ├── useLocalStorage.ts     # localStorage persistence
│   └── useTheme.ts            # System/manual theme detection
├── mdx/
│   ├── compiler.ts            # compile + transform + extract
│   ├── builtins.ts            # Built-in component JS source
│   ├── iframe-template.ts     # iframe HTML generator
│   └── default-content.ts     # Default example MDX
├── styles/
│   ├── index.css              # App layout + dark/light theme
│   └── markdown-theme.css     # Preview Markdown typography
└── tests/
    ├── compiler.test.ts
    └── useLocalStorage.test.ts
```

## Deployment

The project auto-deploys to GitHub Pages on push to `main` via GitHub Actions.

To deploy your own fork:

1. Fork this repository
2. Go to **Settings > Pages** and set Source to **GitHub Actions**
3. Push to `main` — the workflow will build and deploy automatically

The Vite `base` is set to `/mdx-renderer/` in `vite.config.ts`. Update this if your repo has a different name.

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** for your feature or fix: `git checkout -b feat/my-feature`
3. **Install dependencies**: `bun install`
4. **Make your changes** and ensure tests pass: `bun run test`
5. **Verify the build**: `bun run build`
6. **Commit** with a descriptive message: `git commit -m "feat: add my feature"`
7. **Push** and open a **Pull Request**

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code restructuring
- `docs:` documentation
- `test:` tests
- `chore:` tooling/config
- `ci:` CI/CD changes

### Ideas for Contributions

- npm package import support (via esm.sh CDN)
- URL-based sharing (encode content in URL hash)
- Export to standalone HTML
- Syntax highlighting in CodeBlock component
- Mobile-responsive layout
- More built-in components

## License

MIT
