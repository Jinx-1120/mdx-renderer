import { useState, useEffect, useRef } from 'react'
import { compileMdx } from '../mdx/compiler'

interface CompileResult {
  code: string | null
  error: string | null
}

export function useMdxCompiler(source: string, debounceMs = 300): CompileResult {
  const [result, setResult] = useState<CompileResult>({ code: null, error: null })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
