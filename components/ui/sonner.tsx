"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={false}
      duration={5000}
      closeButton={true}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "group toast group-[.toaster]:shadow-xl",
          title: "text-sm font-bold",
          description: "text-sm font-medium opacity-95",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-primary group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:font-semibold",
          closeButton:
            "group-[.toast]:bg-white/20 group-[.toast]:border-white/30 group-[.toast]:hover:bg-white/30",
          success:
            "group-[.toaster]:bg-green-600 group-[.toaster]:text-white group-[.toaster]:shadow-green-600/20",
          error:
            "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:shadow-red-600/20",
          info: "group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:shadow-blue-600/20",
          warning:
            "group-[.toaster]:bg-orange-600 group-[.toaster]:text-white group-[.toaster]:shadow-orange-600/20",
          loading:
            "group-[.toaster]:bg-purple-600 group-[.toaster]:text-white group-[.toaster]:shadow-purple-600/20",
        },
        style: {
          padding: "18px 24px",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: "600",
          border: "3px solid oklch(0.6171 0.1375 39.0427)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)",
        } as React.CSSProperties,
      }}
      {...props}
    />
  );
};

export { Toaster };
