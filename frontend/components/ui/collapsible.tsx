"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface CollapsibleContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined);

interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Collapsible({ children, defaultOpen = false, open, onOpenChange }: CollapsibleProps) {
  const [isOpenState, setIsOpenState] = React.useState(defaultOpen);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : isOpenState;
  
  const setIsOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setIsOpenState(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);
  
  return (
    <CollapsibleContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="space-y-2">
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function CollapsibleTrigger({ children, className, ...props }: CollapsibleTriggerProps) {
  const context = React.useContext(CollapsibleContext);
  
  if (!context) {
    throw new Error('CollapsibleTrigger must be used within a Collapsible');
  }
  
  const { isOpen, setIsOpen } = context;
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex w-full items-center justify-between py-2 text-sm font-medium transition-all",
        "hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown 
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} 
      />
    </button>
  );
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const context = React.useContext(CollapsibleContext);
  
  if (!context) {
    throw new Error('CollapsibleContent must be used within a Collapsible');
  }
  
  const { isOpen } = context;
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={cn(
        "animate-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
