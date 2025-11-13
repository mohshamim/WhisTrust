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

  const data = React.useMemo(
    () => ({
      user,
      navMain: buildNav(subdomain, userRole),
    }),
    [subdomain, userRole, user]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sidebar-accent-foreground">
          <Building2 className="size-5" />
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

