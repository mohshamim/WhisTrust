"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  Settings,
  Building2,
  BarChart3,
  Users,
  History,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { getOrganizationBySubdomain } from "@/lib/services/client-auth";

interface ClientSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  organization: {
    name: string;
    subdomain: string;
  };
  userRole: string;
}

function buildNav(subdomain: string, role: string) {
  const baseUrl = `/org/${subdomain}`;
  
  const nav: any[] = [
    {
      title: "Dashboard",
      url: `${baseUrl}/dashboard`,
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Reports",
      url: `${baseUrl}/reports`,
      icon: FileSearch,
      items: [
        { title: "All Reports", url: `${baseUrl}/reports` },
        { title: "Create Case", url: `${baseUrl}/reports/create` },
        { title: "Submitted", url: `${baseUrl}/reports?status=submitted` },
        { title: "Under Review", url: `${baseUrl}/reports?status=under_review` },
        { title: "Investigating", url: `${baseUrl}/reports?status=investigating` },
        { title: "Resolved", url: `${baseUrl}/reports?status=resolved` },
        { title: "Closed", url: `${baseUrl}/reports?status=closed` },
      ],
    },
  ];

  // Role-based navigation
  if (role === 'admin' || role === 'manager') {
    nav.push({ 
      title: "Analytics", 
      url: `${baseUrl}/analytics`, 
      icon: BarChart3 
    });
  }

  if (role === 'admin') {
    nav.push({ 
      title: "Audit Logs", 
      url: `${baseUrl}/audit-logs`, 
      icon: History 
    });
    nav.push({ 
      title: "Users", 
      url: `${baseUrl}/users`, 
      icon: Users 
    });
  }

  nav.push({ 
    title: "Settings", 
    url: `${baseUrl}/settings`, 
    icon: Settings 
  });

  return nav;
}

export function ClientSidebar({
  user,
  organization,
  userRole,
  ...props
}: ClientSidebarProps) {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [branding, setBranding] = React.useState<any>(null);

  // Apply organization branding theme globally
  React.useEffect(() => {
    let cancelled = false;

    const hexToHslString = (hex: string) => {
      let c = hex.replace("#", "");
      if (c.length === 3) {
        c = c.split("").map((x) => x + x).join("");
      }
      const r = parseInt(c.substring(0, 2), 16) / 255;
      const g = parseInt(c.substring(2, 4), 16) / 255;
      const b = parseInt(c.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      const d = max - min;
      if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const setBrandPalette = (hex: string) => {
      const hsl = hexToHslString(hex);
      document.documentElement.style.setProperty("--brand-primary", hex);
      document.documentElement.style.setProperty("--ring", hsl);
      document.documentElement.style.setProperty("--primary", hsl);
      document.documentElement.style.setProperty("--sidebar-primary", hsl);
      // simple chart palette based on lightness steps
      const [hStr, sStr, lStr] = hsl.split(" ");
      const h = hStr;
      const s = sStr;
      const baseL = parseInt(lStr);
      const steps = [0, -10, 10, -20, 20];
      steps.forEach((delta, idx) => {
        const l = Math.max(0, Math.min(100, baseL + delta));
        document.documentElement.style.setProperty(`--chart-${idx + 1}`, `${h} ${s} ${l}%`);
      });
    };

    const apply = async () => {
      try {
        const res = await getOrganizationBySubdomain(subdomain);
        if (!res.success || !res.organization || cancelled) return;
        const brandingData: any = res.organization.branding || {};
        setBranding(brandingData);

        // Theme mode
        if (brandingData.theme_mode === "dark") document.documentElement.classList.add("dark");
        if (brandingData.theme_mode === "light") document.documentElement.classList.remove("dark");

        // Primary color mapping
        const hex: string | undefined = brandingData.primary_color;
        if (hex) {
          setBrandPalette(hex);
        }

        // Favicon
        if (brandingData.favicon_url) {
          const existing = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
          const link = existing || document.createElement("link");
          link.rel = "icon";
          link.href = brandingData.favicon_url;
          if (!existing) document.head.appendChild(link);
        }
      } catch {}
    };
    apply();
    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  const data = React.useMemo(
    () => ({
      user,
      navMain: buildNav(subdomain, userRole),
    }),
    [subdomain, userRole, user]
  );

  const roleLabel =
    userRole === "admin"
      ? "Admin workspace"
      : userRole === "manager"
        ? "Manager workspace"
        : "Investigator workspace";

  const resolvedLogo =
    (typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? branding?.logo_dark_url
      : branding?.logo_light_url) || branding?.logo_url;

  const logoNode = resolvedLogo ? (
    <img src={resolvedLogo} alt={organization.name} className="size-5 object-contain" />
  ) : (
    <Building2 className="size-5" />
  );

  const mobileHeader = (
    <>
      <SheetTitle className="flex items-center gap-3 text-base">
        <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary/10 text-sidebar-primary">
          {logoNode}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{organization.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{roleLabel}</span>
        </span>
      </SheetTitle>
      <SheetDescription className="text-xs text-muted-foreground">
        Navigate reports, users, and settings for {organization.name}.
      </SheetDescription>
    </>
  );

  return (
    <Sidebar collapsible="icon" mobileHeader={mobileHeader} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sidebar-accent-foreground">
          {logoNode}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{organization.name}</span>
            <span className="truncate text-xs">Compliance Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

