export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-secondary',
    outline: 'bg-transparent text-primary border border-primary hover:bg-secondary'
  }

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
