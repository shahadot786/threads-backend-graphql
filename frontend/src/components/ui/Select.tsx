"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Since we don't have radix-ui installed, we will create a simple HTML Select wrapper 
 * that mimics the API of the shadcn/ui Select for now to get the code running.
 * 
 * NOTE: PROPER IMPLEMENTATION SHOULD USE RADIX-UI OR SIMILAR IF AVAILABLE.
 * For this fix, we are using a simplified version.
 */

// Placeholder context to share state
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export const Select = ({ value, onValueChange, children }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
        {children}
      </SelectContext.Provider>
    </div>
  );
};

export const SelectTrigger = ({ className, children }: any) => {
  const ctx = React.useContext(SelectContext);
  return (
    <button
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder }: any) => {
  const ctx = React.useContext(SelectContext);
  return <span>{ctx?.value || placeholder}</span>;
};

export const SelectContent = ({ children }: any) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <div className="absolute top-full left-0 w-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem = ({ value, children }: any) => {
  const ctx = React.useContext(SelectContext);
  const isSelected = ctx?.value === value;

  return (
    <div
      onClick={() => {
        ctx?.onValueChange(value);
        ctx?.setOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent"
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};
