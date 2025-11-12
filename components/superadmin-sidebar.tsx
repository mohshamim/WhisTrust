"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Shield,
  BarChart3,
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

const navItems = [
  {
    title: "Dashboard",
    url: "/superadmin/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Organizations",
    url: "/superadmin/organizations",
    icon: Building2,
  },
  {
    title: "All Users",
    url: "/superadmin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/superadmin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/superadmin/settings",
    icon: Settings,
  },
];

export function SuperAdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const data = React.useMemo(
    () => ({
      user: {
        name: "Super Admin",
        email: "sup-adm@whistrust.com",
        avatar: "/avatars/superadmin.jpg",
      },
      navMain: navItems,
    }),
    []
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sidebar-accent-foreground">
          <Shield className="size-5" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">WhisTrust</span>
            <span className="truncate text-xs">Super Admin</span>
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

