import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-2.5 text-sm", className)}>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className="peer h-4 w-4 appearance-none rounded border border-input bg-background transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...props}
        />
        <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3.5 w-3.5 scale-0 text-primary-foreground transition-transform peer-checked:scale-100" />
      </span>
      {label && <span>{label}</span>}
    </label>
  )
);
Checkbox.displayName = "Checkbox";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  className?: string;
  label?: string;
}

function Switch({ checked, onCheckedChange, className, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-input",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
      {label && <span className="ml-3 text-sm">{label}</span>}
    </button>
  );
}

export { Checkbox, Switch };
