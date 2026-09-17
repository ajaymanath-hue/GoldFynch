type HoverTipProps = {
  label: string
  /** Position / wrap classes, e.g. left/right/top offsets */
  className?: string
  /** Allow multi-line tip (default single line) */
  wrap?: boolean
}

const TIP_SURFACE =
  'pointer-events-none absolute z-50 hidden rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-2 py-1 text-[11px] font-medium leading-snug text-brandcolor-textstrong shadow-md group-hover/tip:block group-focus-within/tip:block'

/** White rounded hover tip — same style as the “You removed review” tip. */
export default function HoverTip({ label, className = '', wrap = false }: HoverTipProps) {
  return (
    <span
      role="tooltip"
      className={`${TIP_SURFACE} ${wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'} ${className}`}
    >
      {label}
    </span>
  )
}

export const TIP_TRIGGER = 'group/tip relative'
