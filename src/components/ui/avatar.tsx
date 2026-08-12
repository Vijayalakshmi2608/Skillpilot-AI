import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };

function Avatar({ initials, color = "bg-primary", size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm",
        sizes[size],
        color,
        className
      )}
      {...props}
    >
      {initials ?? "?"}
    </div>
  );
}

export { Avatar };
