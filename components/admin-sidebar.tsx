"use client";

import * as React from "react";
import {
  LayoutDashboard,
  FileSearch,
  Settings,
  Shield,
  BarChart3,
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

const data = {
  user: {
    name: "Compliance Manager",
    email: "manager@whistrust.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
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
        {
          title: "Pending",
          url: "/admin/cases?status=pending",
        },
        {
          title: "In Review",
          url: "/admin/cases?status=in_review",
        },
        {
          title: "In Progress",
          url: "/admin/cases?status=in_progress",
        },
        {
          title: "Resolved",
          url: "/admin/cases?status=resolved",
        },
        {
          title: "Closed",
          url: "/admin/cases?status=closed",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: History,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
