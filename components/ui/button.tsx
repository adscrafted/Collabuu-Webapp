import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-pink-500 text-white shadow-sm hover:bg-pink-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
        outline:
          "border-2 border-gray-400 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:border-gray-500 active:bg-gray-100 active:border-gray-600",
        secondary:
          "border-2 border-gray-400 bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:border-gray-500 active:bg-gray-300 active:border-gray-600",
        ghost: "border border-gray-300 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200 active:border-gray-500",
        link: "text-pink-500 underline-offset-4 hover:text-pink-600 hover:underline",
        business: "bg-blue-500 text-white shadow-sm hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
        influencer: "bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
        success: "bg-green-500 text-white shadow-sm hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
