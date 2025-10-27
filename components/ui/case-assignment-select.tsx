"use client";

import * as React from "react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/types/database";

interface CaseAssignmentSelectProps {
  admins: AdminUser[];
  currentAssigneeId?: string | null;
  onAssign: (adminId: string) => Promise<void>;
  disabled?: boolean;
}

export function CaseAssignmentSelect({
  admins,
  currentAssigneeId,
  onAssign,
  disabled = false,
}: CaseAssignmentSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const currentAssignee = admins.find((a) => a.id === currentAssigneeId);

  const handleSelect = async (adminId: string) => {
    if (disabled || loading) return;

    setLoading(true);
    try {
      await onAssign(adminId);
    } catch (error) {
      console.error("Failed to assign case:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="truncate">
              {currentAssignee ? currentAssignee.full_name || currentAssignee.email : "Unassigned"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search admins..." />
          <CommandList>
            <CommandEmpty>No admin found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="unassign"
                value="unassign"
                onSelect={() => handleSelect("")}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !currentAssigneeId ? "opacity-100" : "opacity-0"
                  )}
                />
                Unassigned
              </CommandItem>
              {admins.map((admin) => (
                <CommandItem
                  key={admin.id}
                  value={admin.id}
                  onSelect={() => handleSelect(admin.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentAssigneeId === admin.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {admin.full_name || admin.email}
                    </span>
                    {admin.role && (
                      <span className="text-xs text-muted-foreground">
                        {admin.role}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
