"use client";

/**
 * Documentation Center Service
 *
 * Org-scoped documentation pages + file library, backed by Supabase.
 * Uses the multi-tenant client so it works in both demo and production environments.
 */

import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";

export interface DocumentationPage {
  id: string;
  organization_id: string | null;
  category: string;
  title: string;
  slug: string;
  content_md: string;
  is_global: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentationFile {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  file_path: string;
  category: string | null;
  uploaded_by: string | null;
  created_at: string;
}

function normalizeSearch(text: string | null | undefined): string {
  return (text || "").toLowerCase();
}

/**
 * Fetch all documentation pages visible to an organization.
 * This returns:
 *  - org-specific pages for the org
 *  - global pages (organization_id NULL, is_global = true)
 * If an org-specific page shares a slug with a global page, the org page wins.
 */
export async function getAllDocsForOrg(
  organizationId: string
): Promise<{ success: boolean; pages?: DocumentationPage[]; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const { data, error } = await supabase
      .from("documentation_pages")
      .select("*")
      .or(
        `organization_id.eq.${organizationId},and(organization_id.is.null,is_global.eq.true)`
      )
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error("Error loading documentation pages:", error);
      return { success: false, error: error.message };
    }

    const pages = (data || []) as DocumentationPage[];

    // De-duplicate by slug, preferring org-specific over global
    const bySlug = new Map<string, DocumentationPage>();
    for (const page of pages) {
      const existing = bySlug.get(page.slug);
      if (!existing) {
        bySlug.set(page.slug, page);
        continue;
      }
      // Prefer org-specific (non-null organization_id) over global
      if (!existing.organization_id && page.organization_id) {
        bySlug.set(page.slug, page);
      }
    }

    return { success: true, pages: Array.from(bySlug.values()) };
  } catch (error: any) {
    console.error("getAllDocsForOrg error:", error);
    return {
      success: false,
      error: error.message || "Failed to load documentation",
    };
  }
}

/**
 * Get a single documentation page for an org by slug.
 * Org-specific overrides global if both exist.
 */
export async function getDocBySlug(
  organizationId: string,
  slug: string
): Promise<{ success: boolean; page?: DocumentationPage | null; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const { data, error } = await supabase
      .from("documentation_pages")
      .select("*")
      .eq("slug", slug)
      .or(
        `organization_id.eq.${organizationId},and(organization_id.is.null,is_global.eq.true)`
      );

    if (error) {
      console.error("Error loading documentation page:", error);
      return { success: false, error: error.message };
    }

    const pages = (data || []) as DocumentationPage[];
    if (!pages.length) {
      return { success: true, page: null };
    }

    // Prefer org-specific over global
    const orgSpecific = pages.find((p) => p.organization_id === organizationId);
    return {
      success: true,
      page: orgSpecific || pages[0],
    };
  } catch (error: any) {
    console.error("getDocBySlug error:", error);
    return {
      success: false,
      error: error.message || "Failed to load documentation page",
    };
  }
}

/**
 * Client-side friendly search over docs.
 * Uses a Supabase query + in-memory filtering for instant results.
 */
export async function searchDocs(
  organizationId: string,
  query: string
): Promise<{ success: boolean; results?: DocumentationPage[]; error?: string }> {
  const q = normalizeSearch(query);
  if (!q) {
    // Empty query: just return all docs
    return getAllDocsForOrg(organizationId);
  }

  const all = await getAllDocsForOrg(organizationId);
  if (!all.success || !all.pages) {
    return all;
  }

  const results = all.pages.filter((page) => {
    const haystack =
      normalizeSearch(page.title) +
      " " +
      normalizeSearch(page.category) +
      " " +
      normalizeSearch(page.content_md);
    return haystack.includes(q);
  });

  return { success: true, results };
}

// ---------------------------------------------------------------------------
// Mutations (Org-scoped documentation pages)
// ---------------------------------------------------------------------------

export async function createOrgDoc(input: {
  organizationId: string;
  category: string;
  title: string;
  slug: string;
  content_md: string;
  sort_order?: number;
}): Promise<{ success: boolean; page?: DocumentationPage; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const { data, error } = await supabase
      .from("documentation_pages")
      .insert({
        organization_id: input.organizationId,
        category: input.category,
        title: input.title,
        slug: input.slug,
        content_md: input.content_md,
        is_global: false,
        sort_order: input.sort_order ?? 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating documentation page:", error);
      return { success: false, error: error.message };
    }

    return { success: true, page: data as DocumentationPage };
  } catch (error: any) {
    console.error("createOrgDoc error:", error);
    return {
      success: false,
      error: error.message || "Failed to create documentation page",
    };
  }
}

export async function updateOrgDoc(
  id: string,
  updates: Partial<Pick<DocumentationPage, "category" | "title" | "slug" | "content_md" | "sort_order">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const { error } = await supabase
      .from("documentation_pages")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating documentation page:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("updateOrgDoc error:", error);
    return {
      success: false,
      error: error.message || "Failed to update documentation page",
    };
  }
}

export async function deleteOrgDoc(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const { error } = await supabase
      .from("documentation_pages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting documentation page:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("deleteOrgDoc error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete documentation page",
    };
  }
}

// ---------------------------------------------------------------------------
// File library
// ---------------------------------------------------------------------------

export async function uploadDocumentationFile(input: {
  organizationId: string;
  file: File;
  name?: string;
  description?: string;
  category?: string;
}): Promise<{ success: boolean; fileRecord?: DocumentationFile; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Supabase getUser error:", userError);
    }

    const safeName = input.name || input.file.name;
    const timestamp = Date.now();
    const path = `${input.organizationId}/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("org-documents")
      .upload(path, input.file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Documentation file upload error:", uploadError);
      return {
        success: false,
        error: uploadError.message || "Failed to upload file",
      };
    }

    const { data, error } = await supabase
      .from("documentation_files")
      .insert({
        organization_id: input.organizationId,
        name: safeName,
        description: input.description || null,
        category: input.category || null,
        file_path: path,
        uploaded_by: user?.id ?? null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting documentation file row:", error);
      return { success: false, error: error.message };
    }

    return { success: true, fileRecord: data as DocumentationFile };
  } catch (error: any) {
    console.error("uploadDocumentationFile error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload documentation file",
    };
  }
}

export async function listDocumentationFiles(
  organizationId: string
): Promise<{ success: boolean; files?: DocumentationFile[]; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    const { data, error } = await supabase
      .from("documentation_files")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading documentation files:", error);
      return { success: false, error: error.message };
    }

    return { success: true, files: (data || []) as DocumentationFile[] };
  } catch (error: any) {
    console.error("listDocumentationFiles error:", error);
    return {
      success: false,
      error: error.message || "Failed to load documentation files",
    };
  }
}

export async function deleteDocumentationFile(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createMultiTenantClient();

    // Fetch row to get file_path
    const { data, error: fetchError } = await supabase
      .from("documentation_files")
      .select("file_path")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error loading documentation file for delete:", fetchError);
      return { success: false, error: fetchError.message };
    }

    const filePath = data?.file_path as string | undefined;

    // Delete DB row first (RLS will enforce permissions)
    const { error: deleteRowError } = await supabase
      .from("documentation_files")
      .delete()
      .eq("id", id);

    if (deleteRowError) {
      console.error("Error deleting documentation file row:", deleteRowError);
      return { success: false, error: deleteRowError.message };
    }

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("org-documents")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting documentation storage object:", storageError);
        // Do not fail hard here; row is already gone.
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("deleteDocumentationFile error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete documentation file",
    };
  }
}


