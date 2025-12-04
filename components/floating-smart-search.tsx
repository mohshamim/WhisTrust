"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X, Loader2, Bot } from "lucide-react";
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
          px-4 py-3 md:px-5 md:py-3.5
          rounded-xl
          bg-primary hover:bg-primary/90
          text-primary-foreground
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)]
          transition-all duration-300
          hover:scale-105 hover:-translate-y-1 active:scale-95
          z-50
          flex items-center gap-2 md:gap-3
          group
          border border-primary/20
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
        {/* Robot Icon */}
        <div className="relative">
          <Bot className="h-5 w-5 md:h-6 md:w-6" />
          <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 md:h-3 md:w-3 text-yellow-300 animate-pulse" />
        </div>
        
        {/* Text */}
        <span className="font-semibold text-sm md:text-base whitespace-nowrap">
          Smart AI Search
        </span>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <div className="font-semibold">AI Smart Search</div>
            <div className="text-gray-300 mt-0.5">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-800 rounded">Ctrl</kbd>
              {" + "}
              <kbd className="px-1 py-0.5 bg-gray-800 rounded">K</kbd>
            </div>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md -z-10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
        
        {/* Subtle Pulse Ring */}
        <div className="absolute inset-0 rounded-xl border-2 border-primary/20 animate-ping"></div>
      </button>

      {/* Search Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0 bg-transparent border-none shadow-none">
          <div className="bg-background rounded-lg shadow-2xl overflow-hidden">
            {/* Search Header */}
            <div className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg relative">
                  <Bot className="h-6 w-6 text-primary" />
                  <Sparkles className="absolute -top-0.5 -right-0.5 h-3 w-3 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Smart AI Search</h2>
                  <p className="text-sm text-muted-foreground">
                    Search cases using natural language
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder='Try: "Find harassment cases from last month"'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 h-12 text-base"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="h-12 px-6"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Search Content */}
            <div className="p-6 space-y-4">
              {/* Keyboard Shortcut Hint */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="font-mono">
                  Ctrl + K
                </Badge>
                <span>to open this search anytime</span>
              </div>

              {/* Example Queries */}
              <div>
                <p className="text-sm font-semibold mb-3">Try these examples:</p>
                <div className="space-y-2">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Bot className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm">{example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* What you can search */}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-2">What you can search:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>• Category (Harassment, Fraud, etc.)</div>
                  <div>• Status (Pending, Resolved, etc.)</div>
                  <div>• Date ranges (Last month, Q4, etc.)</div>
                  <div>• Risk level (Critical, High, etc.)</div>
                  <div>• Keywords in title/description</div>
                  <div>• Priority (Urgent, High, etc.)</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

