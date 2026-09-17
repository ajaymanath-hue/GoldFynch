type HoverTipProps = {
  label: string
  /** Position classes, e.g. left/right/top offsets */
  className?: string
}

const TIP_SURFACE =
  'pointer-events-none absolute z-50 hidden max-w-[11rem] whitespace-pre-line rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-[11px] font-medium leading-snug text-brandcolor-textstrong shadow-md group-hover/tip:block group-focus-within/tip:block'

/** Break tooltip copy so each line has at most `wordsPerLine` words. */
export function formatTipLines(label: string, wordsPerLine = 3): string {
  const words = label.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '))
  }
  return lines.join('\n')
}

/** White rounded hover tip — same style as the “You removed review” tip. */
export default function HoverTip({ label, className = '' }: HoverTipProps) {
  return (
    <span role="tooltip" className={`${TIP_SURFACE} ${className}`}>
      {formatTipLines(label)}
    </span>
  )
}

export const TIP_TRIGGER = 'group/tip relative'
