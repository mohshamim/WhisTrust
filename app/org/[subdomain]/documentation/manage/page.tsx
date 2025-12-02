"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin, hasPermission } from "@/lib/services/client-auth";
import {
  getAllDocsForOrg,
  createOrgDoc,
  updateOrgDoc,
  deleteOrgDoc,
  type DocumentationPage,
} from "@/lib/services/documentation";
import { ClientSidebar } from "@/components/client-sidebar";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpTooltip } from "@/components/help-tooltip";
import { toast } from "sonner";
import {
  FilePlus2,
  Loader2,
  FileText,
  ArrowUpDown,
  Trash2,
  Save,
} from "lucide-react";

const DOC_CATEGORIES = [
  "Introduction",
  "Getting Started",
  "Reporting",
  "Case Management",
  "User Management",
  "Security & Compliance",
  "FAQs",
  "Troubleshooting",
  "Downloads & Templates",
  "Organization Policies (Uploads)",
] as const;

type DocCategory = (typeof DOC_CATEGORIES)[number];

export default function ManageDocumentationPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pages, setPages] = useState<DocumentationPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | "all">(
    "all"
  );

  const [form, setForm] = useState<{
    id?: string;
    category: DocCategory | "";
    title: string;
    slug: string;
    content_md: string;
  }>({
    category: "",
    title: "",
    slug: "",
    content_md: "",
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { user: clientUser, organization: org } =
        await getCurrentClientAdmin();

      if (!clientUser || !org || org.subdomain !== subdomain) {
        router.push(`/org/${subdomain}/login`);
        return;
      }

      if (!hasPermission(clientUser.role, "manage_docs")) {
        router.push(`/org/${subdomain}/documentation`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);

      await loadDocs(org.id);
    } catch (error) {
      console.error("Manage docs auth/load error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const loadDocs = async (organizationId: string) => {
    const res = await getAllDocsForOrg(organizationId);
    if (!res.success || !res.pages) {
      if (res.error) console.error(res.error);
      return;
    }
    // Only show org-scoped + global; editing limited to org-scoped in UI
    setPages(res.pages);
  };

  const orgScopedPages = useMemo(
    () => pages.filter((p) => p.organization_id === organization?.id),
    [pages, organization?.id]
  );

  const filtered = useMemo(() => {
    let list = orgScopedPages;
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    return list.sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        a.sort_order - b.sort_order ||
        a.title.localeCompare(b.title)
    );
  }, [orgScopedPages, categoryFilter]);

  const resetForm = () => {
    setForm({
      category: "",
      title: "",
      slug: "",
      content_md: "",
    });
    setSelectedId(null);
  };

  const handleSelect = (page: DocumentationPage) => {
    setSelectedId(page.id);
    setForm({
      id: page.id,
      category: page.category as DocCategory,
      title: page.title,
      slug: page.slug,
      content_md: page.content_md,
    });
  };

  const handleSlugFromTitle = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({ ...prev, title, slug: prev.slug || slug }));
  };

  const handleSave = async () => {
    if (!organization?.id || !form.category || !form.title || !form.slug) {
      toast.error("Category, title, and slug are required");
      return;
    }

    setSaving(true);
    try {
      if (!form.id) {
        const res = await createOrgDoc({
          organizationId: organization.id,
          category: form.category,
          title: form.title,
          slug: form.slug,
          content_md: form.content_md,
        });
        if (!res.success || !res.page) {
          toast.error(res.error || "Failed to create page");
          return;
        }
        toast.success("Documentation page created");
      } else {
        const res = await updateOrgDoc(form.id, {
          category: form.category,
          title: form.title,
          slug: form.slug,
          content_md: form.content_md,
        });
        if (!res.success) {
          toast.error(res.error || "Failed to update page");
          return;
        }
        toast.success("Documentation page updated");
      }

      await loadDocs(organization.id);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: DocumentationPage) => {
    if (!confirm("Delete this documentation page? This cannot be undone.")) {
      return;
    }
    const res = await deleteOrgDoc(page.id);
    if (!res.success) {
      toast.error(res.error || "Failed to delete page");
      return;
    }
    toast.success("Documentation page deleted");
    if (form.id === page.id) {
      resetForm();
    }
    if (organization?.id) {
      await loadDocs(organization.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization || !user) return null;

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || "User",
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
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base sm:text-lg">
                  Manage Documentation
                </h1>
                <Badge variant="outline" className="text-[10px]">
                  Admin / Manager
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Create and maintain organization-specific help pages. Global
                defaults remain available unless overridden.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(`/org/${subdomain}/documentation`)
              }
            >
              View as reader
            </Button>
          </div>
        </header>

        <main className="flex-1 bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 p-3 sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              {/* Existing pages list */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      Existing Pages
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Only organization-scoped pages are editable here. Global
                      defaults are read-only.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetForm}
                  >
                    <FilePlus2 className="mr-1.5 h-3.5 w-3.5" />
                    New page
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Select
                      value={categoryFilter}
                      onValueChange={(v) =>
                        setCategoryFilter(v as DocCategory | "all")
                      }
                    >
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <SelectValue placeholder="Filter category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {DOC_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <HelpTooltip text="Use categories to group pages; lower sort order appears earlier in each section." />
                  </div>
                  <div className="border rounded-md h-72 overflow-hidden">
                    <ScrollArea className="h-full">
                      {filtered.length === 0 ? (
                        <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                          No organization-specific pages yet. Start by creating
                          a new page on the right.
                        </div>
                      ) : (
                        <ul className="divide-y text-sm">
                          {filtered.map((page) => (
                            <li
                              key={page.id}
                              className={`flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer ${
                                selectedId === page.id
                                  ? "bg-primary/5"
                                  : "hover:bg-muted/80"
                              }`}
                              onClick={() => handleSelect(page)}
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {page.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {page.category}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0"
                                >
                                  {page.sort_order}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(page);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>

              {/* Editor */}
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Save className="h-4 w-4" />
                      {form.id ? "Edit Page" : "New Page"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Content is written in Markdown and rendered in the
                      Documentation Center.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    Save
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-[0.6fr_1.4fr]">
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-xs font-medium">
                        Category
                        <HelpTooltip text="Choose where this page appears in the Documentation Center navigation." />
                      </label>
                      <Select
                        value={form.category || ""}
                        onValueChange={(v) =>
                          setForm((prev) => ({
                            ...prev,
                            category: v as DocCategory,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOC_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-xs font-medium">
                        Title
                      </label>
                      <Input
                        value={form.title}
                        onChange={(e) => handleSlugFromTitle(e.target.value)}
                        placeholder="e.g. Handling Critical Reports"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-xs font-medium">
                        Slug
                        <HelpTooltip text="Used in deep links and future AI embeddings. Lowercase, hyphen-separated." />
                      </label>
                      <Input
                        value={form.slug}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-xs font-medium">
                        Sort order
                        <HelpTooltip text="Lower numbers appear earlier within the same category." />
                      </label>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="px-2 py-1 text-[11px]"
                        >
                          Adjust from the list using your preferred ordering.
                        </Badge>
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-xs font-medium">
                      Content (Markdown)
                      <HelpTooltip text="Supports headings, lists, bold/italic, and links. This content powers both the Documentation Center and Assistant search." />
                    </label>
                    <Textarea
                      value={form.content_md}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          content_md: e.target.value,
                        }))
                      }
                      rows={14}
                      className="text-xs font-mono"
                      placeholder="# Heading\n\nUse Markdown to describe workflows, policies, and guidance for your team."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


