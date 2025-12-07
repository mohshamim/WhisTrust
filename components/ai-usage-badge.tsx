"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface AIUsageBadgeProps {
  subdomain: string;
  featureType: 'smart_search' | 'risk_predictor' | 'attachment_analyzer';
}

export function AIUsageBadge({ subdomain, featureType }: AIUsageBadgeProps) {
  // Only show for demo organization
  if (subdomain !== 'demo') {
    return null;
  }

  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    remaining: number;
    resetAt: Date | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch(`/api/ai/usage?subdomain=${subdomain}&feature=${featureType}`);
        const data = await response.json();
        console.log(`📊 Usage badge data for ${featureType}:`, data);
        setUsage({
          used: data.used,
          limit: data.limit,
          remaining: data.remaining,
          resetAt: data.resetAt ? new Date(data.resetAt) : null
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading usage badge:", error);
        setUsage(null);
        setLoading(false);
      }
    };

    fetchUsage();
    
    // Refresh usage every 2 seconds to keep it updated
    const interval = setInterval(fetchUsage, 2000);
    return () => clearInterval(interval);
  }, [subdomain, featureType]);

  if (loading || !usage) return null;

  const percentage = (usage.used / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isExceeded = usage.remaining <= 0;

  return (
    <div className="space-y-2 p-4 bg-muted rounded-lg border">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {usage.remaining > 0 ? (
            <span className="text-primary">
              {usage.remaining} / {usage.limit} left today
            </span>
          ) : (
            <span className="text-destructive">Limit Exceeded</span>
          )}
        </span>
        {isExceeded && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Limit Exceeded
          </Badge>
        )}
        {isNearLimit && !isExceeded && (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            {usage.remaining} left
          </Badge>
        )}
      </div>
      <Progress 
        value={percentage} 
        className={isNearLimit ? "bg-orange-500" : ""}
      />
      {usage.resetAt && (
        <p className="text-xs text-muted-foreground">
          Resets tomorrow at midnight
        </p>
      )}
    </div>
  );
}

