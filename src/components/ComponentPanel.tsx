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
