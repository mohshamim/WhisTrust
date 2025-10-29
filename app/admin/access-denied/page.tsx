"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle>Access denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            You don’t have permission to view this page. If you believe this is
            an error, please contact your administrator.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="default">Go to dashboard</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
