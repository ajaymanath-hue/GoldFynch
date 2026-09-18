type FontAwesomeIconProps = {
  name: 'arrow-left' | 'arrow-right' | 'ellipsis-v' | 'file-pdf-o' | 'file-image-o' | 'tag'
  className?: string
}

/** Font Awesome 4 icon — uses `fa fa-{name}` classes. */
export default function FontAwesomeIcon({ name, className = '' }: FontAwesomeIconProps) {
  return (
    <i
      className={`fa fa-${name} inline-flex shrink-0 items-center justify-center leading-none text-brandcolor-strokeweak ${className}`}
      aria-hidden
    />
  )
}
