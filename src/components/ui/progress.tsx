import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

function Progress({ value, indicatorClassName, className, ...props }: ProgressProps) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setDisplay(Math.min(100, Math.max(0, value))), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out",
          indicatorClassName
        )}
        style={{ width: `${display}%` }}
      />
    </div>
  );
}

export { Progress };
