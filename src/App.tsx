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
