import * as React from "react";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";

interface TextareaWithCountProps extends React.ComponentProps<typeof Textarea> {
  maxLength?: number;
  showCount?: boolean;
}

const TextareaWithCount = React.forwardRef<HTMLTextAreaElement, TextareaWithCountProps>(
  ({ className, maxLength = 500, showCount = true, value, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(String(value || '').length);

    React.useEffect(() => {
      setCharCount(String(value || '').length);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          className={cn(showCount && "pb-6", className)}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showCount && (
          <span className={cn(
            "absolute bottom-2 right-3 text-xs",
            charCount > maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    );
  }
);
TextareaWithCount.displayName = "TextareaWithCount";

export { TextareaWithCount };
