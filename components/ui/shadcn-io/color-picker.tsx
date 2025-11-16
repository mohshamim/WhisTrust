/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ColorContextValue = {
  color: string;
  setColor: (hex: string) => void;
  format: "hex";
};

const ColorContext = React.createContext<ColorContextValue | null>(null);

export function ColorPicker({
  className,
  children,
  defaultValue = "#0ea5e9",
  onChange,
}: {
  className?: string;
  children: React.ReactNode;
  defaultValue?: string;
  onChange?: (hex: string) => void;
}) {
  const [color, setColor] = React.useState<string>(normalize(defaultValue));

  const update = React.useCallback(
    (hex: string) => {
      const v = normalize(hex);
      setColor(v);
      onChange?.(v);
      // live brand css var for preview consumers
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--brand-primary", v);
      }
    },
    [onChange]
  );

  return (
    <div className={className}>
      <ColorContext.Provider value={{ color, setColor: update, format: "hex" }}>{children}</ColorContext.Provider>
    </div>
  );
}

export function ColorPickerSelection() {
  const ctx = React.useContext(ColorContext)!;
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="h-10 w-10 rounded border" style={{ background: ctx.color }} aria-label="Selected color" />
      <span className="text-sm text-muted-foreground">{ctx.color}</span>
    </div>
  );
}

export function ColorPickerHue() {
  const ctx = React.useContext(ColorContext)!;
  return (
    <input
      type="color"
      value={ctx.color}
      onChange={(e) => ctx.setColor(e.target.value)}
      className="h-10 w-full cursor-pointer rounded border bg-background p-0"
      aria-label="Hue"
    />
  );
}

export function ColorPickerAlpha() {
  // Hex without alpha; show disabled slider for UI parity
  return (
    <input
      type="range"
      min={0}
      max={100}
      defaultValue={100}
      disabled
      className="h-2 w-full cursor-not-allowed opacity-50"
      aria-label="Alpha"
    />
  );
}

export function ColorPickerEyeDropper() {
  const ctx = React.useContext(ColorContext)!;
  const pick = async () => {
    // Browser EyeDropper API (Chromium). Graceful degrade.
    try {
      // @ts-ignore
      if ("EyeDropper" in window) {
        // @ts-ignore
        const ed = new window.EyeDropper();
        const res = await ed.open();
        if (res?.sRGBHex) ctx.setColor(res.sRGBHex);
      }
    } catch {
      // ignore
    }
  };
  return (
    <Button type="button" variant="outline" onClick={pick}>
      Eyedropper
    </Button>
  );
}

export function ColorPickerOutput() {
  const ctx = React.useContext(ColorContext)!;
  return (
    <Input
      value={ctx.color}
      onChange={(e) => ctx.setColor(normalize(e.target.value))}
      placeholder="#0ea5e9"
      aria-label="Color hex"
    />
  );
}

export function ColorPickerFormat() {
  // Only hex supported in this lightweight implementation
  return (
    <Select defaultValue="hex">
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hex">HEX</SelectItem>
      </SelectContent>
    </Select>
  );
}

function normalize(hex: string) {
  if (!hex) return "#0ea5e9";
  let h = hex.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (/^#([0-9A-F]{3}){1,2}$/i.test(h)) return h;
  return "#0ea5e9";
}


