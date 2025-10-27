"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FileText } from "lucide-react";

// BRD Phase 3: Offline Case Entry Form
export function CreateCaseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    source: "offline" as "offline" | "phone" | "email",
    priority: "medium" as "low" | "medium" | "high",
    reporter_name: "",
    reporter_email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { createAdminReport } = await import("@/lib/services/reports");

      const result = await createAdminReport({
        category: formData.category,
        description: formData.description,
        source: formData.source,
        priority: formData.priority,
        submitted_by: "admin",
        reporter_name: formData.reporter_name || undefined,
        reporter_email: formData.reporter_email || undefined,
      });

      if (result.success) {
        // Reset form
        setFormData({
          category: "",
          description: "",
          source: "offline",
          priority: "medium",
          reporter_name: "",
          reporter_email: "",
        });

        setOpen(false);

        // Notify parent to refresh
        if (onSuccess) {
          onSuccess();
        }

        // Show success toast (could use sonner or similar)
        alert("Offline case created successfully!");
      } else {
        alert(result.error || "Failed to create case");
      }
    } catch (error) {
      console.error("Error creating case:", error);
      alert("An error occurred while creating the case");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Offline Case
          </DialogTitle>
          <DialogDescription>
            Manually log a report received via phone, email, or in-person
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., fraud, harassment, safety"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value: "offline" | "phone" | "email") =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporter_name">Reporter Name (Optional)</Label>
              <Input
                id="reporter_name"
                value={formData.reporter_name}
                onChange={(e) =>
                  setFormData({ ...formData, reporter_name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporter_email">Reporter Email (Optional)</Label>
            <Input
              id="reporter_email"
              type="email"
              value={formData.reporter_email}
              onChange={(e) =>
                setFormData({ ...formData, reporter_email: e.target.value })
              }
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide details about the report..."
              rows={6}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
