import { useEffect } from 'react'
import GoogleDuotoneIcon from '@/components/GoogleDuotoneIcon'

type ToastProps = {
  message: string
  open: boolean
  onClose: () => void
  durationMs?: number
}

export default function Toast({ message, open, onClose, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timer)
  }, [open, onClose, durationMs])

  if (!open) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed bottom-6 left-1/2 z-[100] flex max-w-sm -translate-x-1/2 items-center gap-3 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-4 py-3 text-sm text-brandcolor-textstrong shadow-lg"
    >
      <p className="min-w-0 flex-1 font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded hover:bg-brandcolor-fill"
        aria-label="Dismiss notification"
      >
        <GoogleDuotoneIcon name="close" className="text-[18px] !text-brandcolor-strokestrong" />
      </button>
    </div>
  )
}
