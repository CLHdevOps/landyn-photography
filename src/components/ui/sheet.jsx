import * as React from "react"
import { cn } from "@/lib/utils"

const Sheet = ({ children, open, onOpenChange }) => {
  return (
    <>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 z-50 h-full w-3/4 border-l bg-background shadow-lg transition ease-in-out sm:max-w-sm">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && child.type === SheetContent) {
                return React.cloneElement(child, { onOpenChange });
              }
              return null;
            })}
          </div>
        </div>
      )}
    </>
  );
};

const SheetTrigger = ({ children, asChild, ...props }) => {
  return React.cloneElement(children, props);
};

const SheetContent = ({ className, children, onOpenChange, ...props }) => (
  <div className={cn("flex h-full flex-col", className)} {...props}>
    <button
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
      onClick={() => onOpenChange?.(false)}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div className="flex-1 overflow-auto p-6">
      {children}
    </div>
  </div>
);

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);

const SheetTitle = ({ className, ...props }) => (
  <h2
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
);

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
}