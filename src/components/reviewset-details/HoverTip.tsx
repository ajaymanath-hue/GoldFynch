type HoverTipProps = {
  label: string
  /** Position classes, e.g. left/right/top offsets */
  className?: string
  /** Dark navy tip for Solution D team overlap disclosure */
  variant?: 'light' | 'dark'
}

const TIP_SURFACE_LIGHT =
  'pointer-events-none absolute z-50 hidden max-w-[11rem] whitespace-pre-line rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-[11px] font-medium leading-snug text-brandcolor-textstrong shadow-md group-hover/tip:block group-focus-within/tip:block'

const TIP_SURFACE_DARK =
  'pointer-events-none absolute z-50 hidden max-w-[14rem] whitespace-pre-line rounded-md bg-[#2D333F] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-white shadow-md group-hover/tip:block group-focus-within/tip:block'

/** Break tooltip copy so each line has at most `wordsPerLine` words. */
export function formatTipLines(label: string, wordsPerLine = 3): string {
  const words = label.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '))
  }
  return lines.join('\n')
}

/** Hover tip — light (default) or dark (team overlap disclosure). */
export default function HoverTip({
  label,
  className = '',
  variant = 'light',
}: HoverTipProps) {
  const surface = variant === 'dark' ? TIP_SURFACE_DARK : TIP_SURFACE_LIGHT
  const wordsPerLine = variant === 'dark' ? 4 : 3
  return (
    <span role="tooltip" className={`${surface} ${className}`}>
      {formatTipLines(label, wordsPerLine)}
    </span>
  )
}

export const TIP_TRIGGER = 'group/tip relative'
