import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-600 text-white hover:bg-emerald-700",
        secondary:
          "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        destructive:
          "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        outline: "border-emerald-300 text-emerald-700 bg-transparent",
        warning:
          "border-transparent bg-amber-100 text-amber-800",
        success:
          "border-transparent bg-green-100 text-green-800",
        info:
          "border-transparent bg-blue-100 text-blue-800",
        dark:
          "border-transparent bg-gray-800 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
