import Image from 'next/image'

export default function PealLogo({ size = 200, compact = false }: { size?: number, compact?: boolean }) {
  if (compact) {
    // For header - just show the image without text
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src="/images/peal-logo.png"
          alt="Peal Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
    )
  }

  // For hero section - show full logo from PNG
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <Image
        src="/images/peal-logo.png"
        alt="Peal Logo"
        width={size}
        height={size}
        className="object-contain drop-shadow-xl"
        priority
      />
    </div>
  )
}