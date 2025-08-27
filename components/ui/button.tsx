import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap font-mono text-xs uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 disabled:pointer-events-none disabled:opacity-50 disabled:transform-none rounded-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.2)] hover:from-sky-400 hover:to-sky-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:from-sky-600 active:to-sky-700 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.3)] active:translate-y-0",
        destructive:
          "bg-gradient-to-b from-red-900/30 to-red-950/40 text-red-400 border border-red-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:from-red-900/40 hover:to-red-950/50 hover:text-red-300 hover:border-red-500/70 hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_0_12px_rgba(239,68,68,0.1)] hover:-translate-y-[1px] active:from-red-950/50 active:to-red-900/40 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:translate-y-0",
        outline: 
          "border border-gray-700 bg-transparent text-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-gray-900/30 hover:border-gray-600 hover:text-gray-100 hover:shadow-[0_2px_3px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:bg-gray-900/50 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] active:translate-y-0",
        secondary: 
          "bg-gradient-to-b from-gray-800 to-gray-850 text-gray-300 border border-gray-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_1px_3px_rgba(0,0,0,0.3)] hover:from-gray-750 hover:to-gray-800 hover:text-gray-100 hover:border-gray-600 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:from-gray-850 active:to-gray-900 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] active:translate-y-0",
        ghost: 
          "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30 active:bg-gray-900/50 active:text-gray-100",
        link: 
          "text-sky-400 underline-offset-4 hover:text-sky-300 hover:underline",
        success:
          "bg-gradient-to-b from-emerald-900/30 to-emerald-950/40 text-emerald-400 border border-emerald-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:from-emerald-900/40 hover:to-emerald-950/50 hover:text-emerald-300 hover:border-emerald-500/70 hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_0_12px_rgba(16,185,129,0.1)] hover:-translate-y-[1px] active:from-emerald-950/50 active:to-emerald-900/40 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:translate-y-0",
        warning:
          "bg-gradient-to-b from-amber-900/30 to-amber-950/40 text-amber-400 border border-amber-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:from-amber-900/40 hover:to-amber-950/50 hover:text-amber-300 hover:border-amber-500/70 hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_0_12px_rgba(251,146,60,0.1)] hover:-translate-y-[1px] active:from-amber-950/50 active:to-amber-900/40 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:translate-y-0",
      },
      size: {
        default: "h-9 px-6 py-2",
        sm: "h-7 px-4 text-[10px]",
        lg: "h-11 px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }