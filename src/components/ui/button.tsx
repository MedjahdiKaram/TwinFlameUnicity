import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-purple-600 text-white shadow hover:bg-purple-500 active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white shadow hover:bg-red-500',
        outline:
          'border border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white',
        secondary:
          'bg-white/10 text-white hover:bg-white/20',
        ghost:
          'text-white/70 hover:bg-white/10 hover:text-white',
        link:
          'text-purple-400 underline-offset-4 hover:underline p-0 h-auto',
        glow:
          'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98]',
        glass:
          'bg-white/[0.08] border border-white/20 backdrop-blur-sm text-white hover:bg-white/[0.15] hover:border-white/30',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-base',
        xl: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
