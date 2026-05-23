import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-purple-600/20 text-purple-300 border-purple-500/30',
        secondary:
          'border-transparent bg-white/10 text-white/70',
        destructive:
          'border-transparent bg-red-600/20 text-red-300 border-red-500/30',
        outline:
          'border-white/20 text-white/70',
        success:
          'border-transparent bg-green-600/20 text-green-300 border-green-500/30',
        warning:
          'border-transparent bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
