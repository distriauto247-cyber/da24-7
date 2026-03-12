export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-16 h-auto',
    md: 'w-24 h-auto',
    lg: 'w-32 h-auto',
    xl: 'w-40 h-auto'
  }

  return (
    <div className={`${sizes[size]} mx-auto mb-6 ${className}`}>
      <img 
        src="/logo.png" 
        alt="DA24/7 Logo" 
        className="w-full h-auto"
      />
    </div>
  )
}
