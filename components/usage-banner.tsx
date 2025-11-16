"use client";

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

type UsageBannerProps = {
  organization: {
    current_admin_users: number;
    max_admin_users: number;
    current_reports_count: number;
    max_reports_per_month: number;
    current_storage_mb: number;
    max_storage_mb: number;
  };
};

export function UsageBanner({ organization }: UsageBannerProps) {
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
  const usersPct = pct(organization.current_admin_users, organization.max_admin_users);
  const reportsPct = pct(organization.current_reports_count, organization.max_reports_per_month);
  const storagePct = pct(organization.current_storage_mb, organization.max_storage_mb);

  const nearLimit = (v: number) => v >= 80;

  return (
    <Card className="p-3 sm:p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Users</span>
            <span>
              {organization.current_admin_users}/{organization.max_admin_users}
            </span>
          </div>
          <Progress value={usersPct} className={nearLimit(usersPct) ? "bg-amber-100" : undefined} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Reports (month)</span>
            <span>
              {organization.current_reports_count}/{organization.max_reports_per_month}
            </span>
          </div>
          <Progress value={reportsPct} className={nearLimit(reportsPct) ? "bg-amber-100" : undefined} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Storage (MB)</span>
            <span>
              {organization.current_storage_mb}/{organization.max_storage_mb}
            </span>
          </div>
          <Progress value={storagePct} className={nearLimit(storagePct) ? "bg-amber-100" : undefined} />
        </div>
      </div>
      {(nearLimit(usersPct) || nearLimit(reportsPct) || nearLimit(storagePct)) && (
        <p className="text-xs mt-2 text-amber-800 dark:text-amber-200">
          You are nearing your plan limits. Contact sales or upgrade to avoid interruptions.
        </p>
      )}
    </Card>
  );
}


