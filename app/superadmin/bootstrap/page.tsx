"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Org = { id: string; name: string };

export default function SuperAdminBootstrapPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState({
    organizationId: "",
    email: "",
    full_name: "",
    password: "",
    role: "admin" as "admin" | "manager" | "investigator",
    department: "",
  });

  useEffect(() => {
    const loadOrgs = async () => {
      setLoadingOrgs(true);
      try {
        // Use existing superadmin orgs API
        const res = await fetch("/api/superadmin/organizations", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data?.organizations) {
          setOrgs(
            data.organizations.map((o: any) => ({ id: o.id, name: o.name })) || []
          );
        } else {
          toast.error(data?.error || "Failed to load organizations");
        }
      } catch (e) {
        toast.error("Failed to load organizations");
      } finally {
        setLoadingOrgs(false);
      }
    };
    loadOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const newErrors: string[] = [];
    if (!form.organizationId) newErrors.push("Organization is required");
    if (!form.email) newErrors.push("Email is required");
    if (!form.full_name) newErrors.push("Full name is required");
    if (!form.password || form.password.length < 8) newErrors.push("Password must be at least 8 characters");
    if (!form.role) newErrors.push("Role is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/superadmin/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to create admin");
        return;
      }
      toast.success("Admin created and invited successfully");
      setForm({ organizationId: "", email: "", full_name: "", password: "", role: "admin", department: "" });
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Super Admin – Bootstrap Admin User
            </CardTitle>
            <CardDescription>
              Create the first or additional admin for an organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={form.organizationId}
                  onValueChange={(v) => setForm((f) => ({ ...f, organizationId: v }))}
                  disabled={loadingOrgs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOrgs ? "Loading..." : "Select organization"} />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="admin@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    placeholder="Jane Admin"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v: any) => setForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="investigator">Investigator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  placeholder="Compliance, HR, etc."
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


