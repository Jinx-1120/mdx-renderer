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
