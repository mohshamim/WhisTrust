"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X, Loader2, Bot, Filter } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FloatingSmartSearchProps {
  subdomain: string;
  organizationId: string;
  position?: "bottom-right" | "bottom-center";
  showOn?: string[];
}

export function FloatingSmartSearch({
  subdomain,
  organizationId,
  position = "bottom-right",
}: FloatingSmartSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Example queries
  const exampleQueries = [
    "Find harassment cases from last month",
    "Show critical risk cases",
    "Cases reported in Q4",
    "Open fraud investigations",
    "High priority safety concerns",
  ];

  // Keyboard shortcut handler (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      // ESC to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      // Navigate to Smart Search page with query
      const searchUrl = `/org/${subdomain}/ai-powered-section/smart-search?q=${encodeURIComponent(query)}`;
      router.push(searchUrl);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6 md:bottom-8 md:right-8",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed ${positionClasses[position]}
          w-16 h-16 md:w-18 md:h-18
          rounded-full
          bg-primary hover:bg-primary/90
          text-primary-foreground
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)]
          transition-all duration-300
          hover:scale-110 active:scale-95
          z-50
          flex items-center justify-center
          group
          border-2 border-primary/20
          backdrop-blur-sm
          ${isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}
        `}
        aria-label="Open AI Smart Search"
        style={{
          boxShadow: isVisible 
            ? "0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(0, 0, 0, 0.08)" 
            : "none"
        }}
      >
        {/* Floating Label - Appears on Hover */}
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 
                        opacity-0 group-hover:opacity-100
                        translate-y-2 group-hover:translate-y-0
                        scale-95 group-hover:scale-100
                        transition-all duration-300 ease-out
                        pointer-events-none">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md 
                          shadow-xl rounded-lg px-4 py-3 
                          border border-primary/20">
            <p className="font-semibold text-sm whitespace-nowrap text-foreground">
              Smart AI Search
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">K</kbd>
            </p>
          </div>
          {/* Arrow pointing down to button */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 
                          w-3 h-3 bg-white/95 dark:bg-gray-900/95 
                          rotate-45 border-r border-b border-primary/20"></div>
        </div>

        {/* Robot Icon */}
        <div className="relative z-10">
          <Bot className="h-7 w-7 md:h-8 md:w-8" />
          <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-300 animate-pulse" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg -z-10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
        
        {/* Subtle Pulse Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-75"></div>
      </button>

      {/* Search Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0 gap-0">
          {/* Search Header */}
          <div className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-lg relative">
                <Bot className="h-6 w-6 text-primary" />
                <Sparkles className="absolute -top-0.5 -right-0.5 h-3 w-3 text-yellow-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Smart AI Search</h2>
                <p className="text-sm text-muted-foreground">
                  Search cases using natural language
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder='Try: "Find harassment cases from last month"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 pr-4 h-12 text-base border-2 focus:border-primary"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="h-12 px-6 min-w-[120px]"
              >
                <Search className="h-4 w-4" />
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>

            {/* Search Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-200px)]">
              {/* Keyboard Shortcut Hint */}
              <div className="flex items-center justify-center gap-2 text-sm bg-primary/5 py-2.5 px-4 rounded-lg border border-primary/10">
                <span className="text-muted-foreground">Press</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono font-semibold">
                  Ctrl
                </kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono font-semibold">
                  K
                </kbd>
                <span className="text-muted-foreground">to open this search anytime</span>
              </div>

              {/* Example Queries */}
              <div>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Try these examples:
                </p>
                <div className="space-y-2">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-primary/5 hover:border-primary transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm group-hover:text-primary transition-colors">{example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* What you can search */}
              <div className="pt-4 border-t bg-muted/30 -mx-6 px-6 py-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  What you can search:
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Category (Harassment, Fraud, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Status (Pending, Resolved, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Date ranges (Last month, Q4, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Risk level (Critical, High, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Keywords in title/description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Priority (Urgent, High, etc.)</span>
                  </div>
                </div>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

