import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | null;
  variant?: "default" | "outline";
  className?: string;
}

export function PriorityBadge({
  priority,
  variant = "default",
  className,
}: PriorityBadgeProps) {
  if (!priority) {
    return null;
  }

  const variants = {
    low: {
      label: "Low",
      className: "bg-green-100 text-green-800 border-green-200",
      icon: TrendingUp,
    },
    medium: {
      label: "Medium",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: AlertCircle,
    },
    high: {
      label: "High",
      className: "bg-red-100 text-red-800 border-red-200",
      icon: AlertTriangle,
    },
  };

  const config = variants[priority];
  const Icon = config.icon;

  return (
    <Badge
      variant={variant}
      className={cn(
        config.className,
        "flex items-center gap-1 font-medium",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
