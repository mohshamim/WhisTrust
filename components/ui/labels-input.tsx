"use client";

import * as React from "react";
import { X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ReportLabel } from "@/lib/types/database";

interface LabelsInputProps {
  labels: ReportLabel[];
  onAdd: (label: string, color: string) => Promise<void>;
  onRemove: (labelId: string) => Promise<void>;
  disabled?: boolean;
}

const defaultColors = [
  { name: "Gray", value: "#9ca3af" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
];

export function LabelsInput({
  labels,
  onAdd,
  onRemove,
  disabled = false,
}: LabelsInputProps) {
  const [open, setOpen] = React.useState(false);
  const [labelText, setLabelText] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState(defaultColors[0].value);
  const [loading, setLoading] = React.useState(false);

  const handleAdd = async () => {
    if (!labelText.trim() || loading) return;

    setLoading(true);
    try {
      await onAdd(labelText.trim(), selectedColor);
      setLabelText("");
      setSelectedColor(defaultColors[0].value);
      setOpen(false);
    } catch (error) {
      console.error("Failed to add label:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (labelId: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await onRemove(labelId);
    } catch (error) {
      console.error("Failed to remove label:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {labels.map((label) => (
          <Badge
            key={label.id}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1"
            style={{ borderColor: label.color, color: label.color }}
          >
            <Tag className="h-3 w-3" />
            {label.label}
            <button
              onClick={() => handleRemove(label.id)}
              disabled={disabled || loading}
              className="ml-1 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || loading}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Label
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Label Name
                </label>
                <Input
                  placeholder="Enter label..."
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAdd();
                    }
                  }}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {defaultColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      disabled={loading}
                      className={cn(
                        "h-8 w-8 rounded-md border-2 transition-all",
                        selectedColor === color.value
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAdd}
                disabled={!labelText.trim() || loading}
                className="w-full"
                size="sm"
              >
                Add Label
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
