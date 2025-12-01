"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/use-user-role";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { role } = useUserRole();
  const router = useRouter();
  const params = useParams();

  const handleLogout = async () => {
    try {
      // Check if we're in a client organization context or admin context
      const subdomain = params?.subdomain as string | undefined;
      
      if (subdomain) {
        // Client organization logout
        const { signOutClient } = await import("@/lib/services/client-auth");
        const result = await signOutClient();
        
        if (result.success) {
          router.push(`/org/${subdomain}/login`);
          router.refresh();
        } else {
          console.error("Logout failed:", result.error);
          const { toast } = await import("sonner");
          toast.error("Failed to logout. Please try again.");
        }
      } else {
        // Super admin logout
        const { signOutAdmin } = await import("@/lib/services/auth");
        const result = await signOutAdmin();
        
        if (result.success) {
          router.push("/admin/login");
          router.refresh();
        } else {
          console.error("Logout failed:", result.error);
          const { toast } = await import("sonner");
          toast.error("Failed to logout. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
      const { toast } = await import("sonner");
      toast.error("An error occurred during logout.");
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      case "investigator":
        return "outline";
      case "hr":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="flex items-center gap-2 text-sidebar-foreground">
                  <span className="truncate font-semibold">{user.name}</span>
                  {role && (
                    <Badge
                      variant="default"
                      className="text-[10px] leading-none px-2 h-5 rounded-full !bg-primary !text-primary-foreground !border-transparent"
                    >
                      {getRoleLabel(role)}
                    </Badge>
                  )}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.name}</span>
                    {role && (
                      <Badge
                        variant="default"
                        className="text-[10px] leading-none px-2 h-5 rounded-full !bg-primary !text-primary-foreground !border-transparent"
                      >
                        {getRoleLabel(role)}
                      </Badge>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
