import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-8 w-full border-input bg-sipe-blue-dark px-2 py-2 text-lg text-sipe-white font-light ring-offset-background border-sipe-gray file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-sipe-gray focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
