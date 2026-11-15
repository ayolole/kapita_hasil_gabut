import { useEffect, useState } from 'react'
import { LeafIcon } from './Icons'

export default function SafeImage({
  src,
  alt,
  className = '',
  fallbackClassName = 'bg-emerald-50 text-emerald-300',
  iconClassName = 'h-10 w-10',
  ...props
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center ${fallbackClassName} ${className}`}
      >
        <LeafIcon className={iconClassName} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  )
}
