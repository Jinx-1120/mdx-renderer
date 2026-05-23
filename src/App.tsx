// src/App.tsx
import { lazy, Suspense, useCallback } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useMdxCompiler } from './hooks/useMdxCompiler'
import { Toolbar } from './components/Toolbar'
import { Preview } from './components/Preview'
import { Resizer } from './components/Resizer'
import { ComponentPanel } from './components/ComponentPanel'
import { defaultMdxContent, defaultComponentSource } from './mdx/default-content'

const Editor = lazy(() =>
  import('./components/Editor').then(module => ({ default: module.Editor })),
)

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
          <Suspense
            fallback={
              <div className="editor-pane" style={{ flex: 1 }}>
                <div className="pane-header">MDX</div>
                <div className="editor-loading">Loading editor...</div>
              </div>
            }
          >
            <Editor
              value={mdxSource}
              onChange={setMdxSource}
              isDark={theme === 'dark'}
            />
          </Suspense>
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
