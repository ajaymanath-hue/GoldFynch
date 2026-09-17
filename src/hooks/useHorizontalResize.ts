import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type UseHorizontalResizeOptions = {
  initialWidth: number
  minWidth: number
  maxWidth: number
  /** When true, dragging right decreases width (for a panel on the right side). */
  invert?: boolean
}

export function useHorizontalResize({
  initialWidth,
  minWidth,
  maxWidth,
  invert = false,
}: UseHorizontalResizeOptions) {
  const [width, setWidth] = useState(initialWidth)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragRef.current) return
      const delta = event.clientX - dragRef.current.startX
      const next = invert
        ? dragRef.current.startWidth - delta
        : dragRef.current.startWidth + delta
      setWidth(Math.min(maxWidth, Math.max(minWidth, next)))
    },
    [invert, maxWidth, minWidth],
  )

  const onPointerUp = useCallback(() => {
    dragRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  const startResize = useCallback(
    (event: ReactPointerEvent) => {
      event.preventDefault()
      dragRef.current = { startX: event.clientX, startWidth: width }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [width],
  )

  return { width, startResize }
}
