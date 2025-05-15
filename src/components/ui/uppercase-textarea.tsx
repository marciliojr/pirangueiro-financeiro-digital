import * as React from "react"
import { Textarea } from "./textarea"
import { cn } from "@/lib/utils"
import { handleUpperCaseInput } from "@/lib/utils"

const UppercaseTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const modifiedEvent = handleUpperCaseInput(e) as React.ChangeEvent<HTMLTextAreaElement>;
      onChange?.(modifiedEvent);
    };

    return (
      <Textarea
        className={cn(className)}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
UppercaseTextarea.displayName = "UppercaseTextarea";

export { UppercaseTextarea }; 