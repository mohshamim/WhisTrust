"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { formatHex, formatCss, oklch } from "culori";
import {
  LayoutDashboard,
  FileSearch,
  Settings,
  Building2,
  BarChart3,
  Users,
  History,
  Sparkles,
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
import { LogOut } from "lucide-react";

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

  // AI Powered Section - available to all roles
  nav.push({ 
    title: "AI Powered Section", 
    url: `${baseUrl}/ai-powered-section`, 
    icon: Sparkles 
  });

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

  nav.push({
    title: "Documentation",
    url: `${baseUrl}/documentation`,
    icon: FileSearch,
  });

  // Logout as the last item in main navigation
  nav.push({
    title: "Log out",
    url: "#",
    icon: LogOut,
    isLogout: true,
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

  const handleLogout = async () => {
    try {
      const { signOutClient } = await import("@/lib/services/client-auth");
      const result = await signOutClient();

      if (result.success) {
        // For demo organization, redirect to /demo page instead of login
        if (subdomain === 'demo') {
          window.location.href = '/demo';
        } else {
          window.location.href = `/org/${subdomain}/login`;
        }
      } else {
        console.error("Logout failed:", result.error);
        const { toast } = await import("sonner");
        toast.error("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      const { toast } = await import("sonner");
      toast.error("An error occurred during logout.");
    }
  };

  // Apply organization branding theme globally
  React.useEffect(() => {
    let cancelled = false;

    const setBrandPalette = (hex: string) => {
      try {
        console.log("Applying brand color (hex):", hex);
        
        // Simple approach: Just use the hex color directly
        // Tailwind and modern CSS can handle hex in custom properties
        document.documentElement.style.setProperty("--brand-primary-hex", hex);
        
        // For backward compatibility, also try OKLCH conversion
        const color = oklch(hex);
        if (color) {
          const oklchValue = `${color.l.toFixed(4)} ${(color.c || 0).toFixed(4)} ${(color.h || 0).toFixed(4)}`;
          document.documentElement.style.setProperty("--primary", oklchValue);
          document.documentElement.style.setProperty("--sidebar-primary", oklchValue);
          
          // Generate chart colors
          const steps = [0, -0.1, 0.1, -0.15, 0.15];
          steps.forEach((delta, idx) => {
            const l = Math.max(0, Math.min(1, color.l + delta));
            const chartColor = `${l.toFixed(4)} ${(color.c || 0).toFixed(4)} ${(color.h || 0).toFixed(4)}`;
            document.documentElement.style.setProperty(`--chart-${idx + 1}`, chartColor);
          });
        }
        
        // Also create a style tag with direct color overrides
        let styleEl = document.getElementById('brand-color-override');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'brand-color-override';
          document.head.appendChild(styleEl);
        }
        
        // Use !important to ensure it overrides default styles
        styleEl.textContent = `
          :root {
            --brand-primary-hex: ${hex};
          }
          
          /* Primary background colors */
          .bg-primary,
          .\\!bg-primary,
          [class~="bg-primary"],
          [class*="!bg-primary"] {
            background-color: ${hex} !important;
          }
          
          /* Primary text colors */
          .text-primary,
          .\\!text-primary,
          [class~="text-primary"],
          [class*="!text-primary"] {
            color: ${hex} !important;
          }
          
          /* Primary border colors */
          .border-primary,
          .\\!border-primary,
          [class~="border-primary"],
          [class*="!border-primary"] {
            border-color: ${hex} !important;
          }
          
          /* Hover states */
          .hover\\:bg-primary:hover {
            background-color: ${hex} !important;
            opacity: 0.9;
          }
          
          /* Target ALL badges in sidebar with bg-primary */
          nav[data-sidebar] .badge,
          nav[data-sidebar] [class*="badge"],
          .sidebar-menu .badge,
          .sidebar-menu [data-slot="badge"],
          button[data-slot="menu-button"] .badge {
            background-color: ${hex} !important;
          }
        `;
        
        console.log("Brand color applied successfully");
      } catch (error) {
        console.error("Error applying brand palette:", error);
      }
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
        <NavMain items={data.navMain} onLogout={handleLogout} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
