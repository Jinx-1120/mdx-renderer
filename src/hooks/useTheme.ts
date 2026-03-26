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
