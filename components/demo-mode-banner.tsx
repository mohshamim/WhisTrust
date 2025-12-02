"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Sparkles, RotateCcw, X } from "lucide-react";
import { useState } from "react";

interface DemoModeBannerProps {
  organizationName?: string;
  showDismiss?: boolean;
}

export function DemoModeBanner({ 
  organizationName = "Demo Company",
  showDismiss = true 
}: DemoModeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 mb-4 relative">
      <div className="flex items-start gap-3 pr-8">
        <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100">
              <Info className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
            <AlertDescription className="text-sm font-medium text-amber-900 dark:text-amber-100">
              You're viewing a demonstration environment
            </AlertDescription>
          </div>
          <AlertDescription className="text-sm text-amber-700 dark:text-amber-200">
            This is <strong>{organizationName}</strong> with sample data for testing purposes. 
            All reports, users, and data shown here are fictional. Your actions won't affect real data.
            {" "}
            <span className="inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              Demo data resets weekly.
            </span>
          </AlertDescription>
        </div>
      </div>
      {showDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-amber-600 hover:text-amber-900 hover:bg-amber-200"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

