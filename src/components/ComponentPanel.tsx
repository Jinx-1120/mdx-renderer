import { lazy, Suspense } from 'react'

interface ComponentPanelProps {
  value: string
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  isDark: boolean
}

const ComponentEditor = lazy(() =>
  import('./ComponentEditor').then(module => ({ default: module.ComponentEditor })),
)

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
          <Suspense fallback={<div className="component-panel-loading">Loading editor...</div>}>
            <ComponentEditor value={value} onChange={onChange} isDark={isDark} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
