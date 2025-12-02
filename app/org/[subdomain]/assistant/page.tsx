"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { OrgAssistantButton } from "@/components/org-assistant-button";

export default function OrgAssistantPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { user, organization } = await getCurrentClientAdmin();
      if (!user || !organization || organization.subdomain !== subdomain) {
        router.push(`/org/${subdomain}/login`);
        return;
      }
      setOrgId(organization.id);
    };
    load();
  }, [router, subdomain]);

  if (!orgId) {
    return null;
  }

  // For now just render the assistant button/panel on a blank canvas
  return (
    <div className="min-h-screen bg-background">
      <OrgAssistantButton organizationId={orgId} subdomain={subdomain} />
    </div>
  );
}


