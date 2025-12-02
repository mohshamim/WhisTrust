"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { ClientSidebar } from "@/components/client-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  FileText,
  HardDrive,
  Mail,
  Phone,
  Calendar,
  Palette,
  Image as ImageIcon,
  Save,
  Bell,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Key,
  Globe,
  Upload,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import { UsageBanner } from "@/components/usage-banner";
import { uploadAvatar, deleteAvatar, getAvatarUrl, setAvatarStyle, AVATAR_STYLES, type AvatarStyle } from "@/lib/services/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ClientSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);
  const [savingSSO, setSavingSSO] = useState(false);
  
  // SSO configuration state
  const [ssoConfig, setSsoConfig] = useState({
    sso_enabled: false,
    sso_provider: "" as "azure" | "google" | "oidc" | "",
    sso_client_id: "",
    sso_client_secret: "",
    sso_issuer_url: "",
    sso_redirect_url: "",
    sso_domain_restriction: "",
  });

  // Branding form state
  const [branding, setBranding] = useState({
    logo_url: "",
    logo_light_url: "",
    logo_dark_url: "",
    email_logo_url: "",
    favicon_url: "",
    support_email: "",
    support_phone: "",
    primary_color: "",
    theme_mode: "system",
  });
  const [notifPrefs, setNotifPrefs] = useState<{
    new_report: boolean;
    reporter_message: boolean;
    assignment_change: boolean;
    status_change: boolean;
  }>({
    new_report: true,
    reporter_message: true,
    assignment_change: true,
    status_change: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoLightFile, setLogoLightFile] = useState<File | null>(null);
  const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
  const [emailLogoFile, setEmailLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<AvatarStyle>('avataaars');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    support_email?: string;
    support_phone?: string;
  }>({});

  // Load SSO configuration function (defined before checkAuth)
  const loadSSOConfig = async () => {
    try {
      const res = await fetch("/api/org/sso", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success && data.config) {
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : 'http://localhost:3000';
        const defaultRedirectUrl = `${baseUrl}/org/${subdomain}/sso/callback`;
        
        setSsoConfig({
          sso_enabled: data.config.sso_enabled || false,
          sso_provider: data.config.sso_provider || "",
          sso_client_id: data.config.sso_client_id || "",
          sso_client_secret: "", // Never load secret
          sso_issuer_url: data.config.sso_issuer_url || "",
          sso_redirect_url: data.config.sso_redirect_url || defaultRedirectUrl,
          sso_domain_restriction: data.config.sso_domain_restriction || "",
        });
      }
    } catch (err) {
      console.error("Failed to load SSO config:", err);
    }
  };

  useEffect(() => {
    if (subdomain) {
      checkAuth();
    }
  }, [subdomain]);

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(avatarFile, user.id);
      
      if (result.success) {
        toast.success("Avatar uploaded successfully");
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // Refresh user data
        const { user: updatedUser } = await getCurrentClientAdmin();
        if (updatedUser) {
          setUser(updatedUser);
        }
      } else {
        toast.error(result.error || "Failed to upload avatar");
      }
    } catch (error) {
      toast.error("An error occurred while uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.id) return;

    setUploadingAvatar(true);
    try {
      const result = await deleteAvatar(user.id);
      
      if (result.success) {
        toast.success("Avatar removed successfully");
        
        // Refresh user data
        const { user: updatedUser } = await getCurrentClientAdmin();
        if (updatedUser) {
          setUser(updatedUser);
        }
      } else {
        toast.error(result.error || "Failed to remove avatar");
      }
    } catch (error) {
      toast.error("An error occurred while removing avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarStyleChange = async (style: AvatarStyle) => {
    if (!user?.id) return;

    setSelectedAvatarStyle(style);
    setUploadingAvatar(true);
    
    try {
      const result = await setAvatarStyle(user.id, style);
      
      if (result.success) {
        toast.success("Avatar style updated successfully");
        
        // Refresh user data
        const { user: updatedUser } = await getCurrentClientAdmin();
        if (updatedUser) {
          setUser(updatedUser);
        }
      } else {
        toast.error(result.error || "Failed to update avatar style");
      }
    } catch (error) {
      toast.error("An error occurred while updating avatar style");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      
      if (!clientUser || !org) {
        console.log("Not authenticated, redirecting to login");
        router.push(`/org/${subdomain}/login`);
        return;
      }

      // Verify user belongs to this organization
      if (org.subdomain !== subdomain) {
        console.log("User doesn't belong to this organization", {
          userOrg: org.subdomain,
          requestedSubdomain: subdomain,
        });
        router.push(`/org/${subdomain}/login`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);

      // Initialize avatar style from user's profile
      if ((clientUser as any).avatar_style) {
        setSelectedAvatarStyle((clientUser as any).avatar_style);
      }

      // Initialize branding state
      const initial = {
        logo_url: org.branding?.logo_url || "",
        logo_light_url: org.branding?.logo_light_url || org.branding?.logo_url || "",
        logo_dark_url: org.branding?.logo_dark_url || org.branding?.logo_url || "",
        email_logo_url: org.branding?.email_logo_url || "",
        favicon_url: org.branding?.favicon_url || "",
        support_email: org.branding?.support_email || "",
        support_phone: org.branding?.support_phone || "",
        primary_color: org.branding?.primary_color || "",
        theme_mode: org.branding?.theme_mode || "system",
      };
      setBranding(initial);

      // Load notification prefs from user if available
      if ((clientUser as any).notification_prefs) {
        setNotifPrefs({
          new_report: (clientUser as any).notification_prefs.new_report !== false,
          reporter_message: (clientUser as any).notification_prefs.reporter_message !== false,
          assignment_change: (clientUser as any).notification_prefs.assignment_change !== false,
          status_change: (clientUser as any).notification_prefs.status_change !== false,
        });
      }

      // Load SSO configuration (don't block on this)
      loadSSOConfig().catch((err) => {
        console.error("Failed to load SSO config:", err);
        // Non-critical, continue anyway
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't redirect on temporary errors - let user retry
      setLoading(false);
    }
  };

  if (loading || !organization || !user) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate usage percentages with zero-division protection
  const calculatePercentage = (current: number, max: number): number => {
    if (!max || max === 0 || isNaN(max) || !isFinite(max)) {
      return 0;
    }
    if (!current || current === 0 || isNaN(current) || !isFinite(current)) {
      return 0;
    }
    const percentage = (current / max) * 100;
    return isNaN(percentage) || !isFinite(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
  };

  const usagePercentages = {
    users: calculatePercentage(organization.current_admin_users, organization.max_admin_users),
    reports: calculatePercentage(organization.current_reports_count, organization.max_reports_per_month),
    storage: calculatePercentage(organization.current_storage_mb, organization.max_storage_mb),
  };

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return undefined; // Empty is allowed (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return undefined; // Empty is allowed (optional field)
    // Basic phone validation: allows digits, spaces, dashes, parentheses, plus sign
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "Please enter a valid phone number";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: { support_email?: string; support_phone?: string } = {};
    
    const emailError = validateEmail(branding.support_email);
    if (emailError) errors.support_email = emailError;

    const phoneError = validatePhone(branding.support_phone);
    if (phoneError) errors.support_phone = phoneError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || 'User',
          email: user.email,
          avatar: getAvatarUrl({ avatar_url: user.avatar_url, email: user.email }),
        }}
        organization={{
          name: organization.name,
          subdomain: subdomain,
        }}
        userRole={user.role}
      />
      <SidebarInset>
        <div className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Organization settings and information
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="max-w-4xl space-y-6">
            <UsageBanner organization={organization} />
            
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Your Profile
                </CardTitle>
                <CardDescription>Manage your profile picture and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                      <AvatarImage 
                        src={avatarPreview || (user?.avatar_url) || getAvatarUrl({ avatar_url: user?.avatar_url, email: user?.email || '' })} 
                        alt={user?.full_name || user?.email || 'User'} 
                      />
                      <AvatarFallback className="text-2xl">
                        {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground text-center max-w-[120px]">
                      JPG, PNG, WebP, GIF<br/>Max 5MB
                    </p>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar-upload">Profile Picture</Label>
                      <div className="flex gap-2">
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleAvatarFileChange}
                          disabled={uploadingAvatar}
                          className="flex-1"
                        />
                        {avatarFile && (
                          <Button
                            onClick={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="gap-2"
                          >
                            {uploadingAvatar ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Upload
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      {avatarPreview && (
                        <p className="text-sm text-muted-foreground">
                          Preview ready - click Upload to save
                        </p>
                      )}
                    </div>

                    {user?.avatar_url && !user.avatar_url.includes('dicebear.com') && (
                      <Button
                        variant="outline"
                        onClick={handleAvatarDelete}
                        disabled={uploadingAvatar}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Custom Avatar
                      </Button>
                    )}

                    <Separator />

                    {/* Avatar Style Picker */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Choose Avatar Style</Label>
                        <p className="text-xs text-muted-foreground">
                          Select a default avatar style (or upload your own above)
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {AVATAR_STYLES.map((style) => {
                          const isActive = selectedAvatarStyle === style.id;
                          const previewUrl = style.image;
                          
                          return (
                            <button
                              key={style.id}
                              onClick={() => handleAvatarStyleChange(style.id)}
                              disabled={uploadingAvatar}
                              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50 ${
                                isActive ? 'border-primary bg-primary/5' : 'border-border'
                              }`}
                            >
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={previewUrl} alt={style.name} />
                                <AvatarFallback>{style.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="text-center">
                                <p className="text-xs font-medium">{style.name}</p>
                                <p className="text-[10px] text-muted-foreground">{style.description}</p>
                              </div>
                              {isActive && (
                                <Badge variant="default" className="text-[10px] h-4 px-1.5">
                                  Active
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={user?.full_name || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact your administrator to update your name
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed after account creation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding
                </CardTitle>
                <CardDescription>Customize your organization’s look and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live theme preview */}
                <LiveThemePreview primaryColor={branding.primary_color} themeMode={branding.theme_mode} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" /> Logo
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!logoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", logoFile);
                            form.append("kind", "logo");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              toast.error(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, logo_url: data.url }));
                            setLogoFile(null); // Clear file input after successful upload
                            toast.success("Logo uploaded successfully");
                          } catch (err) {
                            console.error(err);
                            toast.error("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.logo_url ? (
                      <div className="mt-2">
                        <img
                          src={branding.logo_url}
                          alt="Logo preview"
                          className="h-10 object-contain bg-muted rounded p-1"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Logo (Light Theme)</div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setLogoLightFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!logoLightFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", logoLightFile);
                            form.append("kind", "logo_light");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              toast.error(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, logo_light_url: data.url }));
                            setLogoLightFile(null); // Clear file input after successful upload
                            toast.success("Logo (Light) uploaded successfully");
                          } catch (err) {
                            console.error(err);
                            toast.error("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.logo_light_url ? (
                      <img src={branding.logo_light_url} alt="Logo light" className="h-10 object-contain bg-white rounded p-1 border" />
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Logo (Dark Theme)</div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setLogoDarkFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!logoDarkFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", logoDarkFile);
                            form.append("kind", "logo_dark");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              toast.error(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, logo_dark_url: data.url }));
                            setLogoDarkFile(null); // Clear file input after successful upload
                            toast.success("Logo (Dark) uploaded successfully");
                          } catch (err) {
                            console.error(err);
                            toast.error("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.logo_dark_url ? (
                      <div className="bg-neutral-900 p-2 rounded">
                        <img src={branding.logo_dark_url} alt="Logo dark" className="h-10 object-contain" />
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Email Logo</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEmailLogoFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!emailLogoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", emailLogoFile);
                            form.append("kind", "email_logo");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              toast.error(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, email_logo_url: data.url }));
                            setEmailLogoFile(null); // Clear file input after successful upload
                            toast.success("Email logo uploaded successfully");
                          } catch (err) {
                            console.error(err);
                            toast.error("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.email_logo_url ? (
                      <div className="mt-2">
                        <img
                          src={branding.email_logo_url}
                          alt="Email logo preview"
                          className="h-10 object-contain bg-muted rounded p-1"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Favicon (32x32)</div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!faviconFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", faviconFile);
                            form.append("kind", "favicon");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              toast.error(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, favicon_url: data.url }));
                            setFaviconFile(null); // Clear file input after successful upload
                            // Update head link for live preview
                            const link: HTMLLinkElement =
                              (document.querySelector('link[rel="icon"]') as HTMLLinkElement) ||
                              (() => {
                                const l = document.createElement("link");
                                l.rel = "icon";
                                document.head.appendChild(l);
                                return l;
                              })();
                            link.href = data.url;
                            toast.success("Favicon uploaded successfully");
                          } catch (err) {
                            console.error(err);
                            toast.error("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.favicon_url ? (
                      <img src={branding.favicon_url} alt="Favicon" className="h-8 w-8 rounded bg-muted p-1" />
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support_email" className="text-sm font-medium">
                      Support Email
                    </Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={branding.support_email}
                      onChange={(e) => {
                        setBranding((b) => ({ ...b, support_email: e.target.value }));
                        // Clear error when user starts typing
                        if (validationErrors.support_email) {
                          setValidationErrors((prev) => ({ ...prev, support_email: undefined }));
                        }
                      }}
                      onBlur={() => {
                        const error = validateEmail(branding.support_email);
                        setValidationErrors((prev) => ({ ...prev, support_email: error }));
                      }}
                      placeholder="support@yourorg.com"
                      className={validationErrors.support_email ? "border-red-500" : ""}
                    />
                    {validationErrors.support_email && (
                      <p className="text-sm text-red-500">{validationErrors.support_email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support_phone" className="text-sm font-medium">
                      Support Phone
                    </Label>
                    <Input
                      id="support_phone"
                      value={branding.support_phone}
                      onChange={(e) => {
                        setBranding((b) => ({ ...b, support_phone: e.target.value }));
                        // Clear error when user starts typing
                        if (validationErrors.support_phone) {
                          setValidationErrors((prev) => ({ ...prev, support_phone: undefined }));
                        }
                      }}
                      onBlur={() => {
                        const error = validatePhone(branding.support_phone);
                        setValidationErrors((prev) => ({ ...prev, support_phone: error }));
                      }}
                      placeholder="+1 555-123-4567"
                      className={validationErrors.support_phone ? "border-red-500" : ""}
                    />
                    {validationErrors.support_phone && (
                      <p className="text-sm text-red-500">{validationErrors.support_phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Primary Color (hex)</div>
                    <div className="max-w-sm rounded-md border bg-background p-4 shadow-sm">
                      <ColorPicker
                        defaultValue={branding.primary_color || "#0ea5e9"}
                        onChange={(c) => setBranding((b) => ({ ...b, primary_color: c }))}
                      >
                        <ColorPickerSelection />
                        <div className="flex items-center gap-4">
                          <ColorPickerEyeDropper />
                          <div className="grid w-full gap-1">
                            <ColorPickerHue />
                            <ColorPickerAlpha />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <ColorPickerOutput />
                          <ColorPickerFormat />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Clear to default theme
                              setBranding((b) => ({ ...b, primary_color: "" }));
                              if (typeof document !== "undefined") {
                                document.documentElement.style.removeProperty("--brand-primary");
                                document.documentElement.style.removeProperty("--primary");
                                document.documentElement.style.removeProperty("--ring");
                                document.documentElement.style.removeProperty("--sidebar-primary");
                              }
                            }}
                          >
                            Default
                          </Button>
                        </div>
                      </ColorPicker>
                    </div>
                    <ColorContrastWarning color={branding.primary_color} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Theme</div>
                    <Select
                      value={branding.theme_mode}
                      onValueChange={(v) =>
                        setBranding((b) => ({ ...b, theme_mode: v as "light" | "dark" | "system" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Theme mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      // Validate before saving
                      if (!validateForm()) {
                        toast.error("Please fix validation errors before saving");
                        return;
                      }

                      try {
                        setSaving(true);
                        const res = await fetch("/api/org/branding", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify(branding),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          toast.error(data.error || "Failed to save branding");
                          return;
                        }
                        // reflect saved state in UI
                        setOrganization((o: any) => ({
                          ...o,
                          logo_url: data.organization.logo_url,
                          branding: data.organization.branding,
                        }));
                        // Update favicon link if provided
                        if (branding.favicon_url) {
                          const link: HTMLLinkElement =
                            (document.querySelector('link[rel="icon"]') as HTMLLinkElement) ||
                            (() => {
                              const l = document.createElement("link");
                              l.rel = "icon";
                              document.head.appendChild(l);
                              return l;
                            })();
                          link.href = branding.favicon_url;
                        }
                        toast.success("Branding updated successfully");
                        // Clear validation errors on successful save
                        setValidationErrors({});
                      } catch (err) {
                        console.error(err);
                        toast.error("Something went wrong");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving || Object.keys(validationErrors).length > 0}
                  >
                    <Save className={`h-4 w-4 mr-2 ${saving ? "animate-pulse" : ""}`} />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SSO Configuration */}
            {user.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Single Sign-On (SSO)
                  </CardTitle>
                  <CardDescription>
                    Configure SSO authentication for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Enable SSO Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div>
                        <Label htmlFor="sso_enabled" className="text-sm font-medium cursor-pointer">
                          Enable SSO
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Allow users to sign in with SSO provider
                        </p>
                      </div>
                      <Checkbox
                        id="sso_enabled"
                        checked={ssoConfig.sso_enabled}
                        onCheckedChange={(checked) =>
                          setSsoConfig((c) => ({ ...c, sso_enabled: !!checked }))
                        }
                      />
                    </div>

                    {ssoConfig.sso_enabled && (
                      <>
                        {/* SSO Provider */}
                        <div className="space-y-2">
                          <Label htmlFor="sso_provider">SSO Provider</Label>
                          <Select
                            value={ssoConfig.sso_provider}
                            onValueChange={(value) =>
                              setSsoConfig((c) => ({ ...c, sso_provider: value as any }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="azure">Azure AD</SelectItem>
                              <SelectItem value="google">Google Workspace</SelectItem>
                              <SelectItem value="oidc">Generic OIDC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Client ID */}
                        <div className="space-y-2">
                          <Label htmlFor="sso_client_id">Client ID *</Label>
                          <Input
                            id="sso_client_id"
                            value={ssoConfig.sso_client_id}
                            onChange={(e) =>
                              setSsoConfig((c) => ({ ...c, sso_client_id: e.target.value }))
                            }
                            placeholder="Enter OAuth Client ID"
                          />
                        </div>

                        {/* Client Secret */}
                        <div className="space-y-2">
                          <Label htmlFor="sso_client_secret">Client Secret *</Label>
                          <Input
                            id="sso_client_secret"
                            type="password"
                            value={ssoConfig.sso_client_secret}
                            onChange={(e) =>
                              setSsoConfig((c) => ({ ...c, sso_client_secret: e.target.value }))
                            }
                            placeholder={ssoConfig.sso_client_secret ? "••••••••" : "Enter OAuth Client Secret"}
                          />
                          <p className="text-xs text-muted-foreground">
                            Leave empty to keep existing secret
                          </p>
                        </div>

                        {/* Issuer URL (for OIDC) */}
                        {ssoConfig.sso_provider === "oidc" && (
                          <div className="space-y-2">
                            <Label htmlFor="sso_issuer_url">Issuer URL *</Label>
                            <Input
                              id="sso_issuer_url"
                              value={ssoConfig.sso_issuer_url}
                              onChange={(e) =>
                                setSsoConfig((c) => ({ ...c, sso_issuer_url: e.target.value }))
                              }
                              placeholder="https://your-oidc-provider.com"
                            />
                          </div>
                        )}

                        {/* Redirect URL */}
                        <div className="space-y-2">
                          <Label htmlFor="sso_redirect_url">Redirect URL</Label>
                          <Input
                            id="sso_redirect_url"
                            value={ssoConfig.sso_redirect_url}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Warn if localhost in production
                              if (value.includes('localhost') && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
                                toast.warning("Warning: localhost URLs won't work in production. Use your production domain instead.");
                              }
                              setSsoConfig((c) => ({ ...c, sso_redirect_url: value }));
                            }}
                            placeholder="Auto-generated if left empty"
                          />
                          <p className="text-xs text-muted-foreground">
                            This is your app&apos;s callback URL where Supabase will redirect after OAuth.
                            <br />
                            <strong className="text-foreground">For Production:</strong> Use your production domain (e.g., <code className="text-xs bg-muted px-1 rounded">https://yourdomain.com/org/{organization.subdomain}/sso/callback</code>)
                            <br />
                            <strong className="text-foreground">For Local:</strong> Use <code className="text-xs bg-muted px-1 rounded">http://localhost:3000/org/{organization.subdomain}/sso/callback</code>
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            ⚠️ Important: This URL must also be configured in:
                            <br />
                            • Your identity provider (Google Cloud Console / Azure AD)
                            <br />
                            • Supabase Dashboard (for each OAuth provider)
                            <br />
                            <span className="text-xs">Note: Google Cloud Console should use Supabase&apos;s callback URL: https://[project-ref].supabase.co/auth/v1/callback</span>
                          </p>
                        </div>

                        {/* Domain Restriction (Optional) */}
                        <div className="space-y-2">
                          <Label htmlFor="sso_domain_restriction">Domain Restriction (Optional)</Label>
                          <Input
                            id="sso_domain_restriction"
                            value={ssoConfig.sso_domain_restriction}
                            onChange={(e) =>
                              setSsoConfig((c) => ({ ...c, sso_domain_restriction: e.target.value }))
                            }
                            placeholder="example.com"
                          />
                          <p className="text-xs text-muted-foreground">
                            Only allow emails from this domain (e.g., example.com)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={async () => {
                        try {
                          setSavingSSO(true);
                          const res = await fetch("/api/org/sso", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(ssoConfig),
                          });
                          const data = await res.json();
                          if (!res.ok || !data.success) {
                            toast.error(data.error || "Failed to save SSO configuration");
                            return;
                          }
                          toast.success("SSO configuration updated successfully");
                          // Reload config to get updated redirect URL and refresh UI
                          await loadSSOConfig();
                          // Force a page refresh to ensure SSO section visibility updates
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                          toast.error("Something went wrong");
                        } finally {
                          setSavingSSO(false);
                        }
                      }}
                      disabled={savingSSO}
                    >
                      <Save className={`h-4 w-4 mr-2 ${savingSSO ? "animate-pulse" : ""}`} />
                      {savingSSO ? "Saving..." : "Save SSO Configuration"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="new_report" className="text-sm font-medium cursor-pointer">
                          New Report
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a new report is submitted
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      id="new_report"
                      checked={notifPrefs.new_report}
                      onCheckedChange={(checked) =>
                        setNotifPrefs((p: typeof notifPrefs) => ({ ...p, new_report: !!checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="reporter_message" className="text-sm font-medium cursor-pointer">
                          Reporter Message
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a reporter sends a message
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      id="reporter_message"
                      checked={notifPrefs.reporter_message}
                      onCheckedChange={(checked) =>
                        setNotifPrefs((p: typeof notifPrefs) => ({ ...p, reporter_message: !!checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="assignment_change" className="text-sm font-medium cursor-pointer">
                          Assignment Change
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a report is assigned or reassigned
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      id="assignment_change"
                      checked={notifPrefs.assignment_change}
                      onCheckedChange={(checked) =>
                        setNotifPrefs((p: typeof notifPrefs) => ({ ...p, assignment_change: !!checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="status_change" className="text-sm font-medium cursor-pointer">
                          Status Change
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a report status is updated
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      id="status_change"
                      checked={notifPrefs.status_change}
                      onCheckedChange={(checked) =>
                        setNotifPrefs((p: typeof notifPrefs) => ({ ...p, status_change: !!checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={async () => {
                      try {
                        setSavingNotifPrefs(true);
                        const res = await fetch("/api/me/notifications", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ preferences: notifPrefs }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          toast.error(data.error || "Failed to save notification preferences");
                          return;
                        }
                        toast.success("Notification preferences updated successfully");
                      } catch (err) {
                        console.error(err);
                        toast.error("Something went wrong");
                      } finally {
                        setSavingNotifPrefs(false);
                      }
                    }}
                    disabled={savingNotifPrefs}
                  >
                    <Save className={`h-4 w-4 mr-2 ${savingNotifPrefs ? "animate-pulse" : ""}`} />
                    {savingNotifPrefs ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Organization Name" value={organization.name} />
                  <InfoRow label="Subdomain" value={`${organization.subdomain}.whistrust.app`} />
                  <InfoRow label="Plan" value={<Badge className="capitalize">{organization.plan}</Badge>} />
                  <InfoRow label="Status" value={
                    <Badge variant={organization.status === 'active' ? 'default' : 'secondary'}>
                      {organization.status}
                    </Badge>
                  } />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow 
                  label="Primary Contact" 
                  value={organization.primary_contact_email}
                  icon={<Mail className="h-4 w-4" />}
                />
                {organization.primary_contact_name && (
                  <InfoRow 
                    label="Contact Name" 
                    value={organization.primary_contact_name}
                  />
                )}
                {organization.billing_email && (
                  <InfoRow 
                    label="Billing Email" 
                    value={organization.billing_email}
                    icon={<Mail className="h-4 w-4" />}
                  />
                )}
                {organization.branding?.support_email && (
                  <InfoRow 
                    label="Support Email" 
                    value={organization.branding.support_email}
                  />
                )}
                {organization.branding?.support_phone && (
                  <InfoRow 
                    label="Support Phone" 
                    value={organization.branding.support_phone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                )}
              </CardContent>
            </Card>

            {/* Usage & Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Usage & Limits</CardTitle>
                <CardDescription>Current usage vs. plan limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <UsageItem
                  icon={<Users className="h-5 w-5" />}
                  label="Users"
                  current={organization.current_admin_users}
                  max={organization.max_admin_users}
                  percentage={usagePercentages.users}
                />
                <UsageItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Reports (This Month)"
                  current={organization.current_reports_count}
                  max={organization.max_reports_per_month}
                  percentage={usagePercentages.reports}
                />
                <UsageItem
                  icon={<HardDrive className="h-5 w-5" />}
                  label="Storage"
                  current={organization.current_storage_mb}
                  max={organization.max_storage_mb}
                  percentage={usagePercentages.storage}
                  unit="MB"
                />
              </CardContent>
            </Card>

            {/* Enabled Features */}
            <Card>
              <CardHeader>
                <CardTitle>Enabled Features</CardTitle>
                <CardDescription>Features available in your plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(organization.features || {}).map(([feature, enabled]) => (
                    <div
                      key={feature}
                      className={`p-3 rounded-lg border ${
                        enabled
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-slate-500/5 border-slate-500/20"
                      }`}
                    >
                      <p className="text-sm font-medium capitalize mb-1">
                        {feature.replace(/_/g, " ")}
                      </p>
                      <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {(organization.trial_ends_at || organization.subscription_ends_at) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Subscription Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {organization.trial_ends_at && organization.status === 'trial' && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm font-medium text-amber-600">
                        Trial ends: {new Date(organization.trial_ends_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-amber-600/80 mt-1">
                        Contact your administrator to upgrade before trial expires
                      </p>
                    </div>
                  )}
                  {organization.subscription_ends_at && organization.status === 'active' && (
                    <InfoRow 
                      label="Subscription Renews" 
                      value={new Date(organization.subscription_ends_at).toLocaleDateString()}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function LiveThemePreview({ primaryColor, themeMode }: { primaryColor: string; themeMode: string }) {
  useEffect(() => {
    // Apply theme class
    if (themeMode === "dark") document.documentElement.classList.add("dark");
    else if (themeMode === "light") document.documentElement.classList.remove("dark");
    // If system, do nothing (respect system preference)
  }, [themeMode]);

  useEffect(() => {
    if (!primaryColor) return;
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
  }, [primaryColor]);

  return null;
}

function ColorContrastWarning({ color }: { color: string }) {
  if (!color || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) return null;

  const hexToRgb = (hex: string) => {
    const c = hex.substring(1);
    const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const num = parseInt(n, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  const contrastRatio = (hex1: string, hex2: string) => {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const l1 = luminance(c1.r, c1.g, c1.b) + 0.05;
    const l2 = luminance(c2.r, c2.g, c2.b) + 0.05;
    const ratio = l1 > l2 ? l1 / l2 : l2 / l1;
    return ratio;
  };
  const ratioOnWhite = contrastRatio(color, "#ffffff");
  const ratioOnBlack = contrastRatio(color, "#000000");
  const good = ratioOnWhite >= 4.5 || ratioOnBlack >= 4.5;

  return (
    <div className={`text-xs ${good ? "text-green-600" : "text-amber-600"}`}>
      Contrast vs white: {ratioOnWhite.toFixed(2)} / black: {ratioOnBlack.toFixed(2)}{" "}
      {good ? "(OK)" : "(Low contrast - consider another color)"}
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function UsageItem({
  icon,
  label,
  current,
  max,
  percentage,
  unit = "",
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  percentage: number;
  unit?: string;
}) {
  // Ensure percentage is a valid number between 0 and 100
  const safePercentage = isNaN(percentage) || !isFinite(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
  const safeCurrent = isNaN(current) || !isFinite(current) ? 0 : current;
  const safeMax = isNaN(max) || !isFinite(max) || max === 0 ? 0 : max;

  const isNearLimit = safePercentage >= 80;
  const isOverLimit = safePercentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-sm font-mono ${isOverLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : ""}`}>
          {safeCurrent.toLocaleString()} / {safeMax > 0 ? safeMax.toLocaleString() : "∞"} {unit}
        </span>
      </div>
      <Progress 
        value={safePercentage} 
        className={isOverLimit ? "bg-red-200" : isNearLimit ? "bg-amber-200" : ""}
      />
    </div>
  );
}

