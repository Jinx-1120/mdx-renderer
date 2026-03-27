import { useCallback, useRef, useEffect, useState } from 'react'

interface ResizerProps {
  onResize: (leftWidthPercent: number) => void
}

export function Resizer({ onResize }: ResizerProps) {
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    containerRef.current = (e.target as HTMLElement).parentElement
  }, [])

  useEffect(() => {
    if (!dragging) return

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(Math.max(percent, 20), 80)
      onResize(clamped)
    }

    const onMouseUp = () => setDragging(false)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, onResize])

  return (
    <div
      className={`resizer ${dragging ? 'active' : ''}`}
      onMouseDown={onMouseDown}
    />
  )
}
