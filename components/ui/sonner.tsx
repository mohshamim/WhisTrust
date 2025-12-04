"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

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
          toast: 'group toast group-[.toaster]:shadow-lg',
          title: 'text-sm font-semibold',
          description: 'text-sm opacity-90',
          actionButton: 'group-[.toast]:bg-white group-[.toast]:text-primary',
          cancelButton: 'group-[.toast]:bg-white/20',
          closeButton: 'group-[.toast]:bg-white/20 group-[.toast]:border-white/30',
          success: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-emerald-500 group-[.toaster]:to-green-600 group-[.toaster]:text-white group-[.toaster]:border-white/20',
          error: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-red-500 group-[.toaster]:to-rose-600 group-[.toaster]:text-white group-[.toaster]:border-white/20',
          info: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-blue-500 group-[.toaster]:to-indigo-600 group-[.toaster]:text-white group-[.toaster]:border-white/20',
          warning: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-orange-500 group-[.toaster]:to-amber-600 group-[.toaster]:text-white group-[.toaster]:border-white/20',
          loading: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-purple-500 group-[.toaster]:to-pink-600 group-[.toaster]:text-white group-[.toaster]:border-white/20',
        },
        style: {
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '500',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        } as React.CSSProperties,
      }}
      {...props}
    />
  )
}

export { Toaster }
