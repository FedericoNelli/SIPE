import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/10",
        ghost: "bg-sipe-orange-light hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sipebutton: "w-full text-sipe-white bg-sipe-orange-light text-4xl font-bold p-9 hover:bg-sipe-orange-light-variant gap-2",
        sipebuttonalt: "w-full text-sipe-white bg-sipe-orange-dark text-4xl font-bold p-9 hover:bg-sipe-orange-dark-variant gap-2",
        sipebuttonalt2: "w-full text-sipe-white bg-sipe-orange-super-light text-2xl font-bold p-9 hover:bg-sipe-orange-super-light-variant gap-2",
        sipebuttonalt3: "w-full text-sipe-white bg-sipe-gray text-xl font-bold p-9 hover:bg-sipe-gray gap-2",
        sipebuttonalt4: "w-full text-sipe-white bg-sipe-orange-dark text-xl font-bold p-9 hover:bg-sipe-orange-dark-variant gap-2",
        sipebuttonalt5: "w-full text-sipe-white bg-sipe-orange-super-light text-4xl font-bold p-9 hover:bg-sipe-orange-super-light-variant gap-2",
        sipehover:"hover:bg-sipe-orange-light hover:text-accent-foreground",
        sipepagination: "bg-sipe-orange-light hover:bg-sipe-orange-light-variant hover:text-accent-foreground",
        sipepaginationalt: "bg-sipe-orange-dark hover:bg-sipe-orange-dark-variant hover:text-accent-foreground",
        sipemodal: "w-30 text-sipe-white bg-sipe-orange-light text-xl font-bold hover:bg-sipe-orange-light-variant gap-2",
        sipemodalalt: "w-30 text-sipe-white bg-sipe-orange-dark text-xl font-bold hover:bg-sipe-orange-dark-variant gap-2",
        sipemodalalt2: "w-30 text-sipe-white bg-sipe-orange-super-light text-xl font-bold hover:bg-sipe-orange-super-light-variant gap-2",
        sipemodalalt3: "w-30 text-sipe-white bg-sipe-orange-dark-2 text-xl font-bold hover:bg-sipe-orange-super-light-variant gap-2"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        sipebutton: "p-4 rounded-xl",
        sipebuttonmodal: "p-1 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }