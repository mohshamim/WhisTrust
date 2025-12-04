"use client";

import { LogOut } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

  const getRoleLabel = (role: string | null) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <SidebarMenu>
      {/* Static user info */}
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name?.substring(0, 2).toUpperCase() || "CN"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="flex items-center gap-2 text-sidebar-foreground">
              <span className="truncate font-semibold">{user.name}</span>
              {role && (
                <Badge
                  variant="default"
                  className="text-[10px] leading-none px-2 h-5 rounded-full !text-primary-foreground !border-transparent"
                  style={{ 
                    backgroundColor: 'var(--brand-primary-hex, hsl(var(--primary)))'
                  }}
                >
                  {getRoleLabel(role)}
                </Badge>
              )}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
