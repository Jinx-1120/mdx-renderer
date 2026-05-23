import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface ComponentEditorProps {
  value: string
  onChange: (value: string) => void
  isDark: boolean
}

const jsxExtensions = [
  javascript({ jsx: true, typescript: true }),
]

export function ComponentEditor({ value, onChange, isDark }: ComponentEditorProps) {
  return (
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
  )
}
