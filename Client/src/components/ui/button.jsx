import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow hover:bg-emerald-700 active:scale-95",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95",
        outline:
          "border border-emerald-600 bg-transparent text-emerald-700 shadow-sm hover:bg-emerald-50 active:scale-95",
        secondary:
          "bg-emerald-100 text-emerald-900 shadow-sm hover:bg-emerald-200 active:scale-95",
        ghost:
          "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
        link: "text-emerald-600 underline-offset-4 hover:underline",
        dark: "bg-gray-900 text-white shadow hover:bg-gray-800 active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-13 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
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
