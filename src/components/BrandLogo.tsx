import { Link } from 'react-router-dom'
import { publicUrl } from '@/lib/publicUrl'

type BrandLogoProps = {
  to?: string
  className?: string
  imgClassName?: string
}

/** Product mark used in header / sidebar (links to catalog). */
export default function BrandLogo({
  to = '/catalog/home',
  className = '',
  imgClassName = 'h-8 w-auto',
}: BrandLogoProps) {
  return (
    <Link to={to} className={`inline-flex shrink-0 items-center ${className}`} aria-label="GoldFynch home">
      <img
        src={publicUrl('landing/logo.png')}
        alt="GoldFynch"
        className={imgClassName}
        width={401}
        height={78}
      />
    </Link>
  )
}
