import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  outline:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
