# MDX Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based MDX playground where users write MDX on the left and see real-time rendered preview on the right, deployed to GitHub Pages.

**Architecture:** Pure client-side SPA. MDX is compiled in the main app using `@mdx-js/mdx` (`compile` with `outputFormat: 'function-body'`). The compiled code is sent to an isolated `<iframe>` via `postMessage`, where it is executed with `react/jsx-runtime` and rendered with React. The iframe loads React/ReactDOM from esm.sh CDN and Tailwind from CDN. Built-in components are defined inline in the iframe template.

**Tech Stack:** React 18 + TypeScript + Bun + Vite + CodeMirror 6 + @mdx-js/mdx + sucrase + Tailwind CSS (CDN in iframe)

---

## File Map

| File | Responsibility |
|------|----------------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build config with GitHub Pages base path |
| `index.html` | Vite SPA entry |
| `src/main.tsx` | React mount point |
| `src/App.tsx` | Root component: layout, state management, wiring |
| `src/components/Editor.tsx` | CodeMirror 6 MDX editor wrapper |
| `src/components/Preview.tsx` | iframe preview container with postMessage |
| `src/components/ComponentPanel.tsx` | Collapsible user component editor |
| `src/components/Toolbar.tsx` | Top bar with theme toggle |
| `src/components/Resizer.tsx` | Draggable split pane divider |
| `src/hooks/useLocalStorage.ts` | localStorage read/write hook |
| `src/hooks/useTheme.ts` | System theme detection + manual toggle |
| `src/hooks/useMdxCompiler.ts` | Debounced MDX compilation hook |
| `src/mdx/compiler.ts` | @mdx-js/mdx compile wrapper + sucrase transform |
| `src/mdx/builtins.ts` | Built-in component JS source strings for iframe |
| `src/mdx/iframe-template.ts` | Generate complete iframe srcdoc HTML |
| `src/mdx/default-content.ts` | Default example MDX content |
| `src/styles/index.css` | App layout and editor chrome styles |
| `src/styles/markdown-theme.css` | Preview area Markdown typography |
| `src/tests/compiler.test.ts` | Tests for MDX compiler and component extraction |
| `src/tests/useLocalStorage.test.ts` | Tests for localStorage hook |
| `.github/workflows/deploy.yml` | GitHub Pages deploy action |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Initialize project with Bun**

```bash
cd /Users/jinhaidi/Documents/github/mdx-renderer
bun init -y
```

- [ ] **Step 2: Install dependencies**

```bash
bun add react react-dom @mdx-js/mdx remark-gfm @uiw/react-codemirror @codemirror/lang-markdown @codemirror/language-data @codemirror/theme-one-dark sucrase
bun add -d @types/react @types/react-dom typescript @vitejs/plugin-react vite vitest @testing-library/react jsdom
```

- [ ] **Step 3: Write package.json scripts**

Update `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mdx-renderer/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 6: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MDX Playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 8: Write placeholder src/App.tsx**

```tsx
export function App() {
  return <div>MDX Playground</div>
}
```

- [ ] **Step 9: Create style directories and placeholder files**

Create empty files:
- `src/styles/index.css`
- `src/styles/markdown-theme.css`

- [ ] **Step 10: Verify project builds**

```bash
bun run build
```

Expected: Build succeeds, outputs to `dist/`.

- [ ] **Step 11: Commit**

```bash
git init
echo "node_modules\ndist\n.DS_Store" > .gitignore
git add package.json bun.lockb tsconfig.json vite.config.ts index.html src/ .gitignore
git commit -m "feat: project scaffolding with Bun + Vite + React + TypeScript"
```

---

### Task 2: Styles

**Files:**
- Create: `src/styles/index.css`
- Create: `src/styles/markdown-theme.css`

- [ ] **Step 1: Write src/styles/index.css**

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e8e8e8;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --accent-color: #3b82f6;
  --error-bg: #fef2f2;
  --error-text: #dc2626;
  --toolbar-height: 48px;
  --panel-header-height: 36px;
}

[data-theme='dark'] {
  --bg-primary: #1e1e2e;
  --bg-secondary: #181825;
  --bg-tertiary: #313244;
  --text-primary: #cdd6f4;
  --text-secondary: #a6adc8;
  --border-color: #45475a;
  --accent-color: #89b4fa;
  --error-bg: #302020;
  --error-text: #f38ba8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  height: var(--toolbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
}

.main-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.editor-pane, .preview-pane {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pane-header {
  height: var(--panel-header-height);
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.pane-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.resizer {
  width: 4px;
  cursor: col-resize;
  background: var(--border-color);
  flex-shrink: 0;
  transition: background 0.15s;
}

.resizer:hover, .resizer.active {
  background: var(--accent-color);
}

.component-panel {
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.component-panel-header {
  height: var(--panel-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--bg-secondary);
  cursor: pointer;
  user-select: none;
}

.component-panel-header:hover {
  background: var(--bg-tertiary);
}

.component-panel-toggle {
  font-size: 10px;
  transition: transform 0.2s;
}

.component-panel-toggle.open {
  transform: rotate(180deg);
}

.component-panel-content {
  height: 200px;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.error-overlay {
  padding: 12px 16px;
  background: var(--error-bg);
  color: var(--error-text);
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
  border-bottom: 1px solid var(--error-text);
}

/* CodeMirror overrides */
.cm-editor {
  height: 100%;
}

.cm-editor .cm-scroller {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.6;
}
```

- [ ] **Step 2: Write src/styles/markdown-theme.css**

This CSS will be embedded in the iframe template. It provides GitHub-style Markdown typography.

```css
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292e;
  padding: 24px;
  max-width: 100%;
  word-wrap: break-word;
}

.markdown-body[data-theme='dark'] {
  color: #c9d1d9;
  background: #0d1117;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }

.markdown-body[data-theme='dark'] h1,
.markdown-body[data-theme='dark'] h2 {
  border-bottom-color: #30363d;
}

.markdown-body p {
  margin-bottom: 16px;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body[data-theme='dark'] a {
  color: #58a6ff;
}

.markdown-body ul, .markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body li {
  margin-bottom: 4px;
}

.markdown-body code {
  background: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 85%;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.markdown-body[data-theme='dark'] code {
  background: #161b22;
}

.markdown-body pre {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-body pre code {
  background: none;
  padding: 0;
  font-size: 85%;
}

.markdown-body[data-theme='dark'] pre {
  background: #161b22;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin-bottom: 16px;
}

.markdown-body[data-theme='dark'] blockquote {
  color: #8b949e;
  border-left-color: #3b434b;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-body th, .markdown-body td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body th {
  font-weight: 600;
  background: #f6f8fa;
}

.markdown-body[data-theme='dark'] th,
.markdown-body[data-theme='dark'] td {
  border-color: #30363d;
}

.markdown-body[data-theme='dark'] th {
  background: #161b22;
}

.markdown-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.markdown-body[data-theme='dark'] hr {
  background-color: #30363d;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
}

.markdown-body > *:first-child {
  margin-top: 0 !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/
git commit -m "feat: add app layout and markdown theme styles"
```

---

### Task 3: useLocalStorage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/tests/useLocalStorage.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/tests/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from '../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns stored value when localStorage has data', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('persists value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    act(() => {
      result.current[1]('new-value')
    })
    expect(result.current[0]).toBe('new-value')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new-value')
  })

  it('handles non-string types', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    act(() => {
      result.current[1](100)
    })
    expect(result.current[0]).toBe(100)
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe(100)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test -- src/tests/useLocalStorage.test.ts
```

Expected: FAIL — module `../hooks/useLocalStorage` not found.

- [ ] **Step 3: Implement useLocalStorage**

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value
      try {
        localStorage.setItem(key, JSON.stringify(nextValue))
      } catch {
        // localStorage full or unavailable — silently ignore
      }
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run test -- src/tests/useLocalStorage.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useLocalStorage.ts src/tests/useLocalStorage.test.ts
git commit -m "feat: add useLocalStorage hook with tests"
```

---

### Task 4: useTheme Hook

**Files:**
- Create: `src/hooks/useTheme.ts`

- [ ] **Step 1: Implement useTheme**

```typescript
// src/hooks/useTheme.ts
import { useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useLocalStorage<Theme | null>('mdx-playground-theme', null)

  const resolved: Theme = theme ?? getSystemTheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])

  useEffect(() => {
    if (theme !== null) return // user has manually set theme, don't listen to system
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setTheme(null) // triggers re-render with new system theme
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, setTheme])

  const toggleTheme = useCallback(() => {
    setTheme(resolved === 'light' ? 'dark' : 'light')
  }, [resolved, setTheme])

  return { theme: resolved, toggleTheme }
}
```

- [ ] **Step 2: Verify manually**

Start dev server (`bun run dev`), import and use `useTheme` in App.tsx to toggle body theme attribute. Check that toggling works and persists across reload.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTheme.ts
git commit -m "feat: add useTheme hook with system detection and manual toggle"
```

---

### Task 5: MDX Compiler

**Files:**
- Create: `src/mdx/compiler.ts`
- Create: `src/hooks/useMdxCompiler.ts`
- Create: `src/tests/compiler.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/tests/compiler.test.ts
import { describe, it, expect } from 'vitest'
import { compileMdx, transformUserComponents, extractComponentNames } from '../mdx/compiler'

describe('compileMdx', () => {
  it('compiles simple markdown to function-body code', async () => {
    const result = await compileMdx('# Hello World')
    expect(result).toContain('_jsxs')
    expect(result).toContain('Hello World')
  })

  it('compiles MDX with JSX elements', async () => {
    const result = await compileMdx('# Title\n\n<Callout>test</Callout>')
    expect(result).toContain('Callout')
  })

  it('supports GFM tables', async () => {
    const mdx = '| A | B |\n|---|---|\n| 1 | 2 |'
    const result = await compileMdx(mdx)
    expect(result).toContain('thead')
  })

  it('throws on invalid MDX syntax', async () => {
    await expect(compileMdx('<Unclosed')).rejects.toThrow()
  })
})

describe('transformUserComponents', () => {
  it('transforms JSX to React.createElement', () => {
    const code = 'const Box = () => <div>hello</div>'
    const result = transformUserComponents(code)
    expect(result).toContain('React.createElement')
    expect(result).not.toContain('<div>')
  })

  it('handles TypeScript annotations', () => {
    const code = 'const Box = ({ title }: { title: string }) => <div>{title}</div>'
    const result = transformUserComponents(code)
    expect(result).toContain('React.createElement')
  })
})

describe('extractComponentNames', () => {
  it('extracts PascalCase const declarations', () => {
    const code = 'const MyCard = () => {}\nconst helper = () => {}\nconst Badge = () => {}'
    expect(extractComponentNames(code)).toEqual(['MyCard', 'Badge'])
  })

  it('extracts function declarations', () => {
    const code = 'function Alert() {}\nfunction helper() {}'
    expect(extractComponentNames(code)).toEqual(['Alert'])
  })

  it('returns empty array for no components', () => {
    expect(extractComponentNames('const x = 1')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test -- src/tests/compiler.test.ts
```

Expected: FAIL — module `../mdx/compiler` not found.

- [ ] **Step 3: Implement compiler.ts**

```typescript
// src/mdx/compiler.ts
import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import { transform } from 'sucrase'

export async function compileMdx(source: string): Promise<string> {
  const file = await compile(source, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
  })
  return String(file)
}

export function transformUserComponents(source: string): string {
  const result = transform(source, {
    transforms: ['typescript', 'jsx'],
    jsxRuntime: 'classic',
  })
  return result.code
}

export function extractComponentNames(code: string): string[] {
  const regex = /(?:const|let|var|function)\s+([A-Z][a-zA-Z0-9]*)/g
  const names: string[] = []
  let match
  while ((match = regex.exec(code)) !== null) {
    names.push(match[1])
  }
  return names
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run test -- src/tests/compiler.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Implement useMdxCompiler hook**

```typescript
// src/hooks/useMdxCompiler.ts
import { useState, useEffect, useRef } from 'react'
import { compileMdx } from '../mdx/compiler'

interface CompileResult {
  code: string | null
  error: string | null
}

export function useMdxCompiler(source: string, debounceMs = 300): CompileResult {
  const [result, setResult] = useState<CompileResult>({ code: null, error: null })
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      try {
        const code = await compileMdx(source)
        setResult({ code, error: null })
      } catch (e) {
        setResult(prev => ({
          code: prev.code, // keep last successful code
          error: e instanceof Error ? e.message : String(e),
        }))
      }
    }, debounceMs)

    return () => clearTimeout(timeoutRef.current)
  }, [source, debounceMs])

  return result
}
```

- [ ] **Step 6: Commit**

```bash
git add src/mdx/compiler.ts src/hooks/useMdxCompiler.ts src/tests/compiler.test.ts
git commit -m "feat: add MDX compiler with debounced hook and tests"
```

---

### Task 6: iframe Template + Built-in Components

**Files:**
- Create: `src/mdx/builtins.ts`
- Create: `src/mdx/iframe-template.ts`

- [ ] **Step 1: Write built-in component source strings**

These are JavaScript strings (using `React.createElement`) that will be embedded in the iframe template. React is available via ESM import in the iframe.

```typescript
// src/mdx/builtins.ts

// Each component is a JS string using React.createElement.
// React is imported in the iframe module scope.

export const builtinComponentsCode = `
const Callout = ({ type = 'info', children }) => {
  const styles = {
    info:    { bg: '#eff6ff', border: '#3b82f6', icon: 'i' },
    tip:     { bg: '#f0fdf4', border: '#22c55e', icon: '\\u2714' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '!' },
    error:   { bg: '#fef2f2', border: '#ef4444', icon: '\\u2718' },
  };
  const darkStyles = {
    info:    { bg: '#1e293b', border: '#3b82f6' },
    tip:     { bg: '#1a2e1a', border: '#22c55e' },
    warning: { bg: '#2e2a1a', border: '#f59e0b' },
    error:   { bg: '#2e1a1a', border: '#ef4444' },
  };
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const s = isDark ? { ...styles[type], ...darkStyles[type] } : styles[type];
  return React.createElement('div', {
    style: {
      padding: '12px 16px',
      borderLeft: '4px solid ' + s.border,
      background: s.bg,
      borderRadius: '4px',
      marginBottom: '16px',
      fontSize: '14px',
      lineHeight: '1.6',
    }
  }, children);
};

const Tab = ({ children }) => React.createElement('div', null, children);

const Tabs = ({ children }) => {
  const [active, setActive] = React.useState(0);
  const tabs = React.Children.toArray(children).filter(c => c && c.props);
  return React.createElement('div', {
    style: { marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }
  },
    React.createElement('div', {
      style: { display: 'flex', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5' }
    }, tabs.map((tab, i) =>
      React.createElement('button', {
        key: i,
        onClick: () => setActive(i),
        style: {
          padding: '8px 16px',
          border: 'none',
          background: active === i ? '#fff' : 'transparent',
          borderBottom: active === i ? '2px solid #3b82f6' : '2px solid transparent',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: active === i ? '600' : '400',
        }
      }, tab.props.label || 'Tab ' + (i + 1))
    )),
    React.createElement('div', { style: { padding: '12px 16px' } },
      tabs[active] || null
    )
  );
};

const CodeBlock = ({ lang, children }) => {
  return React.createElement('pre', {
    style: {
      background: '#f6f8fa',
      padding: '16px',
      borderRadius: '6px',
      overflow: 'auto',
      marginBottom: '16px',
    }
  }, React.createElement('code', {
    className: lang ? 'language-' + lang : '',
    style: { fontSize: '14px', fontFamily: "'SFMono-Regular', Consolas, monospace" }
  }, children));
};

const Step = ({ children }) => React.createElement('div', {
  style: { paddingLeft: '24px', paddingBottom: '16px', borderLeft: '2px solid #e0e0e0', marginLeft: '11px' }
}, children);

const Steps = ({ children }) => React.createElement('div', {
  style: { marginBottom: '16px' }
}, React.Children.toArray(children).map((child, i) =>
  React.createElement('div', { key: i, style: { display: 'flex', gap: '0' } },
    React.createElement('div', {
      style: {
        width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: '600', flexShrink: '0', marginTop: '2px',
      }
    }, i + 1),
    React.createElement('div', { style: { flex: 1 } }, child)
  )
));

const Badge = ({ variant = 'default', children }) => {
  const colors = {
    default: { bg: '#e5e7eb', text: '#374151' },
    primary: { bg: '#dbeafe', text: '#1e40af' },
    success: { bg: '#dcfce7', text: '#166534' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    danger:  { bg: '#fee2e2', text: '#991b1b' },
  };
  const c = colors[variant] || colors.default;
  return React.createElement('span', {
    style: {
      display: 'inline-block', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '12px', fontWeight: '500', background: c.bg, color: c.text,
    }
  }, children);
};

const AccordionItem = ({ title, children }) => {
  const [open, setOpen] = React.useState(false);
  return React.createElement('div', {
    style: { borderBottom: '1px solid #e0e0e0' }
  },
    React.createElement('button', {
      onClick: () => setOpen(!open),
      style: {
        width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500', textAlign: 'left',
      }
    }, title, React.createElement('span', {
      style: { transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }
    }, '\\u25BC')),
    open ? React.createElement('div', { style: { padding: '0 16px 12px' } }, children) : null
  );
};

const Accordion = ({ children }) => React.createElement('div', {
  style: { border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }
}, children);
`

export const builtinComponentNames = [
  'Callout', 'Tab', 'Tabs', 'CodeBlock', 'Step', 'Steps', 'Badge', 'AccordionItem', 'Accordion'
]
```

- [ ] **Step 2: Write iframe template generator**

```typescript
// src/mdx/iframe-template.ts
import { builtinComponentsCode, builtinComponentNames } from './builtins'
import markdownThemeCss from '../styles/markdown-theme.css?raw'

export function generateIframeTemplate(theme: 'light' | 'dark'): string {
  return `<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18?bundle",
      "react-dom/client": "https://esm.sh/react-dom@18/client?bundle",
      "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime?bundle"
    }
  }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${markdownThemeCss}</style>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    #error-display {
      display: none;
      padding: 12px 16px;
      background: #fef2f2;
      color: #dc2626;
      font-family: monospace;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      border-bottom: 2px solid #fca5a5;
    }
    [data-theme='dark'] #error-display {
      background: #2e1a1a;
      color: #f38ba8;
      border-bottom-color: #6b2020;
    }
  </style>
</head>
<body>
  <div id="error-display"></div>
  <div id="root" class="markdown-body"></div>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

    ${builtinComponentsCode}

    const builtinComponents = { ${builtinComponentNames.join(', ')} };

    const root = createRoot(document.getElementById('root'));
    const errorEl = document.getElementById('error-display');

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }

    function hideError() {
      errorEl.style.display = 'none';
    }

    window.addEventListener('message', async (event) => {
      const { type, code, userComponentCode, theme } = event.data;

      if (type === 'theme') {
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('root').setAttribute('data-theme', theme);
        return;
      }

      if (type !== 'render') return;

      try {
        hideError();

        // Parse user-defined components
        let userComponents = {};
        if (userComponentCode && userComponentCode.trim()) {
          try {
            const fn = new Function('React', userComponentCode);
            userComponents = fn(React) || {};
          } catch (e) {
            showError('Component Error: ' + e.message);
          }
        }

        // Execute compiled MDX
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const mdxFn = new AsyncFunction(code);
        const mod = await mdxFn({ jsx, jsxs, Fragment });
        const MDXContent = mod.default;

        // Merge components and render
        const allComponents = { ...builtinComponents, ...userComponents };
        root.render(React.createElement(MDXContent, { components: allComponents }));
      } catch (e) {
        showError('Render Error: ' + e.message);
        window.parent.postMessage({ type: 'error', message: e.message }, '*');
      }
    });

    // Signal iframe is ready
    window.parent.postMessage({ type: 'ready' }, '*');
  </script>
</body>
</html>`
}
```

- [ ] **Step 3: Commit**

```bash
git add src/mdx/builtins.ts src/mdx/iframe-template.ts
git commit -m "feat: add iframe template with built-in MDX components"
```

---

### Task 7: Preview Component

**Files:**
- Create: `src/components/Preview.tsx`

- [ ] **Step 1: Implement Preview**

```tsx
// src/components/Preview.tsx
import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { generateIframeTemplate } from '../mdx/iframe-template'
import { transformUserComponents, extractComponentNames } from '../mdx/compiler'

interface PreviewProps {
  compiledCode: string | null
  compileError: string | null
  userComponentSource: string
  theme: 'light' | 'dark'
}

export function Preview({ compiledCode, compileError, userComponentSource, theme }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Generate iframe template once on mount (theme changes handled via postMessage)
  const srcdocHtml = useMemo(() => generateIframeTemplate(theme), [])

  // Listen for iframe ready signal
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'ready') {
        setIframeReady(true)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Send theme updates to iframe
  useEffect(() => {
    if (!iframeReady || !iframeRef.current) return
    iframeRef.current.contentWindow?.postMessage({ type: 'theme', theme }, '*')
  }, [theme, iframeReady])

  // Send compiled code to iframe
  const sendToIframe = useCallback(() => {
    if (!iframeReady || !iframeRef.current || !compiledCode) return

    let userComponentCode = ''
    if (userComponentSource.trim()) {
      try {
        const transformed = transformUserComponents(userComponentSource)
        const names = extractComponentNames(userComponentSource)
        if (names.length > 0) {
          userComponentCode = transformed + '\nreturn { ' + names.join(', ') + ' };'
        }
      } catch {
        // User component transform errors are non-fatal for MDX rendering
      }
    }

    iframeRef.current.contentWindow?.postMessage({
      type: 'render',
      code: compiledCode,
      userComponentCode,
    }, '*')
  }, [iframeReady, compiledCode, userComponentSource])

  useEffect(() => {
    sendToIframe()
  }, [sendToIframe])

  return (
    <div className="preview-pane" style={{ flex: 1 }}>
      <div className="pane-header">Preview</div>
      {compileError && (
        <div className="error-overlay">{compileError}</div>
      )}
      <div className="pane-content">
        <iframe
          ref={iframeRef}
          className="preview-iframe"
          srcDoc={srcdocHtml}
          sandbox="allow-scripts"
          title="MDX Preview"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Preview.tsx
git commit -m "feat: add Preview component with iframe isolation and postMessage"
```

---

### Task 8: Editor Component

**Files:**
- Create: `src/components/Editor.tsx`

- [ ] **Step 1: Implement Editor**

```tsx
// src/components/Editor.tsx
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  isDark: boolean
}

const mdxExtensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
]

export function Editor({ value, onChange, isDark }: EditorProps) {
  return (
    <div className="editor-pane" style={{ flex: 1 }}>
      <div className="pane-header">MDX</div>
      <div className="pane-content">
        <CodeMirror
          value={value}
          height="100%"
          theme={isDark ? oneDark : 'light'}
          extensions={mdxExtensions}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            foldGutter: true,
            history: true,
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Editor.tsx
git commit -m "feat: add CodeMirror 6 MDX editor component"
```

---

### Task 9: Resizer Component

**Files:**
- Create: `src/components/Resizer.tsx`

- [ ] **Step 1: Implement Resizer**

```tsx
// src/components/Resizer.tsx
import { useCallback, useRef, useEffect, useState } from 'react'

interface ResizerProps {
  onResize: (leftWidthPercent: number) => void
}

export function Resizer({ onResize }: ResizerProps) {
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    containerRef.current = (e.target as HTMLElement).parentElement
  }, [])

  useEffect(() => {
    if (!dragging) return

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(Math.max(percent, 20), 80)
      onResize(clamped)
    }

    const onMouseUp = () => setDragging(false)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, onResize])

  return (
    <div
      className={`resizer ${dragging ? 'active' : ''}`}
      onMouseDown={onMouseDown}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Resizer.tsx
git commit -m "feat: add draggable Resizer component for split panes"
```

---

### Task 10: ComponentPanel

**Files:**
- Create: `src/components/ComponentPanel.tsx`

- [ ] **Step 1: Implement ComponentPanel**

```tsx
// src/components/ComponentPanel.tsx
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface ComponentPanelProps {
  value: string
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  isDark: boolean
}

const jsxExtensions = [
  javascript({ jsx: true, typescript: true }),
]

export function ComponentPanel({ value, onChange, isOpen, onToggle, isDark }: ComponentPanelProps) {
  return (
    <div className="component-panel">
      <div className="component-panel-header" onClick={onToggle}>
        <span>Custom Components</span>
        <span className={`component-panel-toggle ${isOpen ? 'open' : ''}`}>
          &#9660;
        </span>
      </div>
      {isOpen && (
        <div className="component-panel-content">
          <CodeMirror
            value={value}
            height="200px"
            theme={isDark ? oneDark : 'light'}
            extensions={jsxExtensions}
            onChange={onChange}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              history: true,
            }}
            placeholder="// Define custom React components here using JSX syntax.
// Example:
// const MyCard = ({ title, children }) => (
//   <div className='border rounded-lg p-4'>
//     <h3 className='font-bold'>{title}</h3>
//     {children}
//   </div>
// )"
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add @codemirror/lang-javascript dependency**

Check that `@codemirror/lang-javascript` is included. It should be pulled in transitively by `@uiw/react-codemirror`, but if not:

```bash
bun add @codemirror/lang-javascript
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ComponentPanel.tsx
git commit -m "feat: add collapsible ComponentPanel with JSX editor"
```

---

### Task 11: Toolbar

**Files:**
- Create: `src/components/Toolbar.tsx`

- [ ] **Step 1: Implement Toolbar**

```tsx
// src/components/Toolbar.tsx

interface ToolbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Toolbar({ theme, onToggleTheme }: ToolbarProps) {
  return (
    <div className="toolbar">
      <span className="toolbar-title">MDX Playground</span>
      <div className="toolbar-actions">
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'light' ? '\u263E' : '\u2600'}{' '}
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Toolbar.tsx
git commit -m "feat: add Toolbar with theme toggle"
```

---

### Task 12: App.tsx — Wire Everything Together

**Files:**
- Create: `src/mdx/default-content.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create default content**

```typescript
// src/mdx/default-content.ts
export const defaultMdxContent = `# Welcome to MDX Playground

This is a **live MDX editor**. Edit the content on the left and see the preview on the right.

## Markdown Features

- Lists, **bold**, *italic*, \`inline code\`
- [Links](https://mdxjs.com) and images
- Tables, blockquotes, and more

> Blockquotes are supported too!

| Feature | Status |
|---------|--------|
| Markdown | Supported |
| JSX | Supported |
| Tailwind | Supported |

## Using Components

<Callout type="tip">
  You can use built-in components like this Callout directly in your MDX content.
</Callout>

<Callout type="warning">
  This is a warning callout. Use it to highlight important information.
</Callout>

<Tabs>
  <Tab label="JavaScript">
    console.log('Hello from JS!')
  </Tab>
  <Tab label="Python">
    print('Hello from Python!')
  </Tab>
</Tabs>

## Steps Example

<Steps>
  <Step>Install the dependencies</Step>
  <Step>Write your MDX content</Step>
  <Step>See the live preview</Step>
</Steps>

## Badges

<Badge variant="primary">v1.0.0</Badge> <Badge variant="success">Stable</Badge> <Badge variant="warning">Beta</Badge>

## Tailwind CSS Support

<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
  <h3 className="text-xl font-bold mb-2">Tailwind CSS Works!</h3>
  <p>You can use Tailwind CSS classes directly in your MDX content.</p>
</div>

<div className="mt-4 grid grid-cols-2 gap-4">
  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg text-center font-medium">
    Card 1
  </div>
  <div className="bg-amber-100 text-amber-800 p-4 rounded-lg text-center font-medium">
    Card 2
  </div>
</div>
`

export const defaultComponentSource = ''
```

- [ ] **Step 2: Wire up App.tsx**

```tsx
// src/App.tsx
import { useCallback } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useMdxCompiler } from './hooks/useMdxCompiler'
import { Toolbar } from './components/Toolbar'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { Resizer } from './components/Resizer'
import { ComponentPanel } from './components/ComponentPanel'
import { defaultMdxContent, defaultComponentSource } from './mdx/default-content'

export function App() {
  const { theme, toggleTheme } = useTheme()

  const [mdxSource, setMdxSource] = useLocalStorage('mdx-playground-source', defaultMdxContent)
  const [componentSource, setComponentSource] = useLocalStorage('mdx-playground-components', defaultComponentSource)
  const [panelOpen, setPanelOpen] = useLocalStorage('mdx-playground-panel', false)
  const [editorWidth, setEditorWidth] = useLocalStorage('mdx-playground-width', 50)

  const { code: compiledCode, error: compileError } = useMdxCompiler(mdxSource)

  const handleTogglePanel = useCallback(() => {
    setPanelOpen(prev => !prev)
  }, [setPanelOpen])

  return (
    <div className="app-layout">
      <Toolbar theme={theme} onToggleTheme={toggleTheme} />
      <div className="main-area">
        <div style={{ width: `${editorWidth}%` }}>
          <Editor
            value={mdxSource}
            onChange={setMdxSource}
            isDark={theme === 'dark'}
          />
        </div>
        <Resizer onResize={setEditorWidth} />
        <Preview
          compiledCode={compiledCode}
          compileError={compileError}
          userComponentSource={componentSource}
          theme={theme}
        />
      </div>
      <ComponentPanel
        value={componentSource}
        onChange={setComponentSource}
        isOpen={panelOpen}
        onToggle={handleTogglePanel}
        isDark={theme === 'dark'}
      />
    </div>
  )
}
```

- [ ] **Step 3: Start dev server and verify the full app works**

```bash
bun run dev
```

Open `http://localhost:5173/mdx-renderer/` in a browser. Verify:
1. Editor shows default MDX content on the left
2. Preview renders the MDX on the right (after iframe loads)
3. Theme toggle switches light/dark
4. Resizer adjusts pane widths
5. Component panel toggles open/closed
6. Content persists after page reload (localStorage)

- [ ] **Step 4: Fix any issues found during manual testing**

Address any integration bugs (layout, postMessage timing, theme sync, etc.).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/mdx/default-content.ts
git commit -m "feat: wire up App with all components, state management, and default content"
```

---

### Task 13: GitHub Actions Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Run a local build to verify it succeeds**

```bash
bun run build
```

Expected: Build succeeds. `dist/` contains `index.html` and JS/CSS assets.

- [ ] **Step 3: Run tests to verify everything passes**

```bash
bun run test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `bun run dev` starts dev server without errors
- [ ] Default MDX content renders in preview on first load
- [ ] Editing MDX in left pane updates preview in right pane (with ~300ms debounce)
- [ ] MDX compile errors show as red overlay in preview area, don't crash the app
- [ ] Built-in components (Callout, Tabs, CodeBlock, Steps, Badge, Accordion) render correctly
- [ ] Custom component panel opens/closes, default collapsed
- [ ] Custom components defined in panel are usable in MDX editor
- [ ] Tailwind CSS classes work in preview (e.g., `className="bg-blue-500"`)
- [ ] Theme toggle switches editor and preview between light/dark
- [ ] Resizer adjusts pane widths by dragging
- [ ] All state (source, components, theme, panel, width) persists in localStorage across reload
- [ ] `bun run build` produces valid static output in `dist/`
- [ ] `bun run test` all tests pass
