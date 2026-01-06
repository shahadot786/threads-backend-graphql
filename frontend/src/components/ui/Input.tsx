import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border border-border h-[56px] w-full min-w-0 rounded-2xl bg-secondary/30 px-4 py-3 text-[15px] shadow-sm transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
