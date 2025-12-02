"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { getPermissions, UserRole } from "@/lib/permissions";
import { getAvatarUrl } from "@/lib/services/avatar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  getOrganizationUsers,
  checkEmailExists,
  getUserCasesCount,
  type AdminUser,
} from "@/lib/services/users";

export default function UsersPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<any>(null);

  // Users data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form data
  const [createData, setCreateData] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "investigator" as "admin" | "manager" | "investigator",
    department: "",
  });

  const [editData, setEditData] = useState({
    full_name: "",
    role: "investigator" as "admin" | "manager" | "investigator",
    department: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (organization?.id && permissions) {
      loadUsers();
    }
  }, [organization, permissions]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      if (!clientUser || !org) {
        router.push(`/org/${subdomain}/login`);
        return;
      }

      const perms = getPermissions(clientUser.role as UserRole);
      if (!perms.canManageUsers) {
        router.push(`/org/${subdomain}/dashboard`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);
      setPermissions(perms);
    } catch (error) {
      console.error("Auth error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!organization?.id) return;

    setLoadingUsers(true);

    try {
      const result = await getOrganizationUsers(organization.id);

      if (result.success && result.data) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.department?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((u) => u.is_active === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    setErrors([]);

    // Validation
    const newErrors: string[] = [];
    if (!createData.email) newErrors.push("Email is required");
    if (!createData.full_name) newErrors.push("Full name is required");
    if (!createData.password || createData.password.length < 8)
      newErrors.push("Password must be at least 8 characters");
    if (!createData.role) newErrors.push("Role is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check email uniqueness
    const emailExists = await checkEmailExists(organization.id, createData.email);
    if (emailExists) {
      setErrors(["Email already exists in this organization"]);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...createData,
          organizationId: organization.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsCreateModalOpen(false);
        setCreateData({
          email: "",
          full_name: "",
          password: "",
          role: "investigator",
          department: "",
        });
        await loadUsers();
      } else {
        setErrors([result.error || "Failed to create user"]);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors(["An unexpected error occurred"]);
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setErrors([]);
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        setErrors([result.error || "Failed to update user"]);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setErrors(["An unexpected error occurred"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (hard: boolean = false) => {
    if (!selectedUser) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/delete?hard=${hard}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        setErrors([result.error || "Failed to delete user"]);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrors(["An unexpected error occurred"]);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (userToEdit: AdminUser) => {
    setSelectedUser(userToEdit);
    setEditData({
      full_name: userToEdit.full_name,
      role: userToEdit.role,
      department: userToEdit.department || "",
      is_active: userToEdit.is_active,
    });
    setErrors([]);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (userToDelete: AdminUser) => {
    setSelectedUser(userToDelete);
    setErrors([]);
    setIsDeleteModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: { variant: "default", label: "Admin" },
      manager: { variant: "secondary", label: "Manager" },
      investigator: { variant: "outline", label: "Investigator" },
    };

    const config = variants[role] || { variant: "secondary", label: role };

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  if (isLoading || !user || !organization || !permissions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || user.email,
          email: user.email,
          avatar: getAvatarUrl({ avatar_url: user.avatar_url, email: user.email }),
        }}
        organization={{
          name: organization.name,
          subdomain: organization.subdomain,
        }}
        userRole={user.role || "admin"}
      />
      <SidebarInset>
        <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Users Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <NotificationsDropdown userId={user?.id || ""} organizationId={organization?.id || ""} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Info Alert */}
            <Alert className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Manage admin users who have access to your organization's compliance portal. All changes
                are logged for security purposes.
              </AlertDescription>
            </Alert>

            {/* Filters */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Search and filter users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Search */}
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Role Filter */}
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="investigator">Investigator</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>Organization Users</CardTitle>
                    <CardDescription>
                      Manage admin access to your compliance portal
                    </CardDescription>
                  </div>
                  <HelpTooltip text="Roles define permissions in WhisTrust. Use Admin for configuration, Manager for oversight, and Investigator for case work." />
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your filters or search term</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage 
                                    src={getAvatarUrl({ avatar_url: u.avatar_url, email: u.email, avatar_style: u.avatar_style })} 
                                    alt={u.full_name} 
                                  />
                                  <AvatarFallback>
                                    {u.full_name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{u.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{u.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(u.role)}</TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {u.department || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {u.is_active ? (
                                <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 text-gray-600 border-gray-600">
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {u.last_login_at
                                  ? new Date(u.last_login_at).toLocaleDateString()
                                  : "Never"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(u)}
                                  aria-label="Edit user"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteModal(u)}
                                  disabled={u.id === user.id}
                                  aria-label="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
        </div>
      </SidebarInset>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create New User
            </DialogTitle>
            <DialogDescription>
              Add a new admin user to your organization
            </DialogDescription>
          </DialogHeader>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={createData.email}
                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                value={createData.full_name}
                onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={createData.password}
                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={createData.role}
                  onValueChange={(value: any) => setCreateData({ ...createData, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="investigator">Investigator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="IT, HR, etc."
                  value={createData.department}
                  onChange={(e) => setCreateData({ ...createData, department: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={selectedUser.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Role</Label>
                  <Select
                    value={editData.role}
                    onValueChange={(value: any) => setEditData({ ...editData, role: value })}
                    disabled={selectedUser.id === user.id}
                  >
                    <SelectTrigger id="edit_role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="investigator">Investigator</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedUser.id === user.id && (
                    <p className="text-xs text-muted-foreground">Cannot change your own role</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_department">Department</Label>
                  <Input
                    id="edit_department"
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={editData.is_active}
                  onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit_is_active">User is active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action will remove the user from your organization
            </DialogDescription>
          </DialogHeader>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{selectedUser.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.full_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {selectedUser.department && (
                      <Badge variant="outline">{selectedUser.department}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Choose deletion type:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <strong>Deactivate:</strong> User account is disabled but data is preserved
                    </li>
                    <li>
                      <strong>Permanent Delete:</strong> User and all associated data is removed
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDeleteUser(false)}
              disabled={saving}
            >
              {saving ? "Processing..." : "Deactivate"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(true)}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Permanent Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
