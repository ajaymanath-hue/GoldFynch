type Fa4Name = 'arrow-left' | 'arrow-right' | 'ellipsis-v' | 'tag' | 'file-pdf-o'
type Fa6SolidName = 'list-check' | 'turn-down'

type FontAwesomeIconProps = {
  name: Fa4Name | Fa6SolidName
  className?: string
}

const FA6_SOLID = new Set<string>(['list-check', 'turn-down'])

/** Font Awesome icon — FA4 `fa fa-*` or FA6 solid `fa-solid fa-*`. */
export default function FontAwesomeIcon({ name, className = '' }: FontAwesomeIconProps) {
  const iconClass = FA6_SOLID.has(name) ? `fa-solid fa-${name}` : `fa fa-${name}`
  /** Avoid inline-flex on FA4 pdf glyph — breaks ::before on some browsers. */
  const layoutClass =
    name === 'file-pdf-o'
      ? 'inline-block shrink-0 leading-none'
      : 'inline-flex shrink-0 items-center justify-center leading-none'

  return (
    <i
      className={`${iconClass} ${layoutClass} text-brandcolor-strokeweak ${className}`}
      aria-hidden
    />
  )
}
