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
