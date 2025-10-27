import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Globe, Phone, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: "online" | "offline" | "phone" | "email";
  variant?: "default" | "outline";
  className?: string;
}

export function SourceBadge({
  source,
  variant = "default",
  className,
}: SourceBadgeProps) {
  const variants = {
    online: {
      label: "Online",
      icon: Globe,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    offline: {
      label: "Offline",
      icon: FileText,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    phone: {
      label: "Phone",
      icon: Phone,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    email: {
      label: "Email",
      icon: Mail,
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
  };

  const config = variants[source];
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
