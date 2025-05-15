import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { handleUpperCaseInput } from "@/lib/utils"

const UppercaseInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const modifiedEvent = handleUpperCaseInput(e) as React.ChangeEvent<HTMLInputElement>;
      onChange?.(modifiedEvent);
    };

    return (
      <Input
        type={type}
        className={cn(className)}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
UppercaseInput.displayName = "UppercaseInput";

export { UppercaseInput }; 