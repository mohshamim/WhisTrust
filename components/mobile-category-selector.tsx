"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  value: string;
  label: string;
  icon?: string;
}

interface MobileCategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  placeholder?: string;
  isMobile?: boolean;
}

export function MobileCategorySelector({
  value,
  onValueChange,
  categories,
  placeholder = "Select a category",
  isMobile = false,
}: MobileCategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedCategory = categories.find((cat) => cat.value === value);

  // Use Sheet (bottom sheet) on mobile, regular select on desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 justify-between text-left font-normal"
          >
            <span className={cn(!selectedCategory && "text-muted-foreground")}>
              {selectedCategory ? selectedCategory.label : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select Category</SheetTitle>
            <SheetDescription>
              Choose the category that best describes your report
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                type="button"
                variant={value === category.value ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto py-4 px-4 text-left",
                  value === category.value && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  onValueChange(category.value);
                  setOpen(false);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{category.label}</span>
                  {value === category.value && (
                    <Check className="h-5 w-5" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Regular select (fallback to default Select component)
  return null;
}

