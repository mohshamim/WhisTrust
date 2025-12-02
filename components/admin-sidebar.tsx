"use client";

import * as React from "react";
import { useUserRole, Permissions } from "@/hooks/use-user-role";
import {
  LayoutDashboard,
  FileSearch,
  Settings,
  Shield,
  BarChart3,
  History,
  BookOpen,
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

function buildNav(role: ReturnType<typeof useUserRole>["role"]) {
  const nav: any[] = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "All Cases",
      url: "/admin/cases",
      icon: FileSearch,
      items: [
        { title: "Pending", url: "/admin/cases?status=pending" },
        { title: "In Review", url: "/admin/cases?status=in_review" },
        { title: "In Progress", url: "/admin/cases?status=in_progress" },
        { title: "Resolved", url: "/admin/cases?status=resolved" },
        { title: "Closed", url: "/admin/cases?status=closed" },
      ],
    },
  ];

  if (Permissions.canViewAnalytics(role)) {
    nav.push({ title: "Analytics", url: "/admin/analytics", icon: BarChart3 });
  }
  if (Permissions.canViewAuditLogs(role)) {
    nav.push({ title: "Audit Logs", url: "/admin/audit-logs", icon: History });
  }
  if (Permissions.canManageUsers(role)) {
    nav.push({ title: "Users", url: "/admin/users", icon: Settings });
  }
  nav.push({ title: "Settings", url: "/admin/settings", icon: Settings });
  nav.push({ title: "Documentation", url: "/admin/documentation", icon: BookOpen });

  return nav;
}

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { role } = useUserRole();
  const data = React.useMemo(
    () => ({
      user: {
        name: "Admin",
        email: "admin@whistrust.com",
        avatar: "/avatars/admin.jpg",
      },
      navMain: buildNav(role),
    }),
    [role]
  );
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sidebar-accent-foreground">
          <Shield className="size-5" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">WhisTrust</span>
            <span className="truncate text-xs">Admin Portal</span>
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
