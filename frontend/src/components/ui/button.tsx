import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
