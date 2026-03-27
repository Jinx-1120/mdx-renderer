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
