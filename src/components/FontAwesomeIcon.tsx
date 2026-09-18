type Fa4Name = 'arrow-left' | 'arrow-right' | 'ellipsis-v' | 'file-pdf-o' | 'file-image-o' | 'tag'
type Fa6SolidName = 'list-check'

type FontAwesomeIconProps = {
  name: Fa4Name | Fa6SolidName
  className?: string
}

const FA6_SOLID = new Set<string>(['list-check'])

/** Font Awesome icon — FA4 `fa fa-*` or FA6 solid `fa-solid fa-*`. */
export default function FontAwesomeIcon({ name, className = '' }: FontAwesomeIconProps) {
  const iconClass = FA6_SOLID.has(name) ? `fa-solid fa-${name}` : `fa fa-${name}`

  return (
    <i
      className={`${iconClass} inline-flex shrink-0 items-center justify-center leading-none text-brandcolor-strokeweak ${className}`}
      aria-hidden
    />
  )
}
