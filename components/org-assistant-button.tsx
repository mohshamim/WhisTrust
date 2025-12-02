"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, Loader2, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAllDocsForOrg,
  searchDocs,
  type DocumentationPage,
} from "@/lib/services/documentation";

interface OrgAssistantButtonProps {
  organizationId: string;
  subdomain: string;
}

export function OrgAssistantButton({
  organizationId,
  subdomain,
}: OrgAssistantButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<DocumentationPage[]>([]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const base = await getAllDocsForOrg(organizationId);
        if (!base.success || !base.pages || cancelled) return;
        setResults(base.pages);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [open, organizationId]);

  useEffect(() => {
    if (!open) return;
    if (!search) {
      // Already loaded in previous effect
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await searchDocs(organizationId, search);
        if (!res.success || !res.results) return;
        setResults(res.results);
      } catch {
        // ignore
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [search, open, organizationId]);

  const handleOpenDoc = (page: DocumentationPage) => {
    setOpen(false);
    router.push(`/org/${subdomain}/documentation?slug=${page.slug}`);
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 z-40 shadow-lg rounded-full px-4 py-2 h-10 gap-2"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Assistant</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="space-y-2">
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              WhisTrust Assistant
            </SheetTitle>
            <SheetDescription className="text-xs">
              Search your organization documentation. AI answers will be added
              later.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="relative">
              <Input
                placeholder="Search documentation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-8 text-sm"
              />
              <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="text-[11px] text-muted-foreground">
              Results powered by your org docs &amp; global guides. No AI yet —
              content is shown directly from the Documentation Center.
            </div>

            <div className="border rounded-md h-[360px] overflow-hidden">
              {loading ? (
                <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading documentation...
                </div>
              ) : results.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground px-4 text-center">
                  No documentation found yet. Admins can add pages in the
                  Documentation Center.
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <ul className="divide-y text-sm">
                    {results.map((page) => (
                      <li
                        key={page.id}
                        className="flex items-start justify-between gap-2 px-3 py-2 hover:bg-muted/60 cursor-pointer"
                        onClick={() => handleOpenDoc(page)}
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-xs truncate">
                            {page.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {page.category}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}


