"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Search, Send, User, Radio } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import type { Message } from "@/lib/types/database";

interface CaseMessage {
  id: string;
  type: "reporter" | "admin";
  text: string;
  timestamp: string;
}

interface CaseData {
  id: string;
  reportId: string | null;
  status: string;
  category: string;
  createdAt: string;
  messages: CaseMessage[];
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [trackingCode, setTrackingCode] = useState(codeParam || "");
  const [isLoading, setIsLoading] = useState(false);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Realtime message handler
  const handleNewMessage = useCallback((message: Message) => {
    setCaseData((prev) => {
      if (!prev) return prev;

      // Check if message already exists (prevent duplicates)
      const messageExists = prev.messages.some((m) => m.id === message.id);
      if (messageExists) return prev;

      const newMessages = [
        ...prev.messages,
        {
          id: message.id,
          type: message.sender_type,
          text: message.content,
          timestamp: new Date(message.created_at).toLocaleString(),
        },
      ];

      // Scroll to bottom after state update
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);

      return {
        ...prev,
        messages: newMessages,
      };
    });
  }, []);

  // Enable realtime updates when we have a case loaded
  const { isConnected } = useRealtimeMessages({
    reportId: caseData?.reportId || null,
    onNewMessage: handleNewMessage,
    enabled: !!caseData?.reportId,
  });

  // Only scroll on initial load
  useEffect(() => {
    if (caseData?.messages && caseData.messages.length > 0) {
      scrollToBottom();
    }
  }, [caseData?.reportId]); // Only when switching reports

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode) return;

    setIsLoading(true);

    try {
      // Use server-side API to bypass RLS issues
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode }),
      });

      const result = await response.json();

      if (result.success && result.report) {
        // Transform data to match UI expectations
        setCaseData({
          id: result.report.tracking_code,
          reportId: result.report.id,
          status: result.report.status,
          category: result.report.category,
          createdAt: new Date(result.report.created_at).toLocaleDateString(),
          messages:
            result.messages?.map((msg: any) => ({
              id: msg.id,
              type: msg.sender_type,
              text: msg.content,
              timestamp: new Date(msg.created_at).toLocaleString(),
            })) || [],
        });
      } else {
        toast.error(result.error || "Report not found");
      }
    } catch (error) {
      console.error("Error loading case:", error);
      toast.error("An error occurred while loading the case");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !caseData?.reportId) return;

    setIsSending(true);

    try {
      const { sendReporterMessage } = await import("@/lib/services/messages");
      const messageText = newMessageText.trim();

      if (!caseData.reportId) {
        toast.error("Report ID not found");
        setIsSending(false);
        return;
      }

      const result = await sendReporterMessage(
        caseData.reportId,
        messageText
      );

      if (result.success) {
        // Immediately add the message to the UI for instant feedback
        const newMessage: CaseMessage = {
          id: result.message?.id || Date.now().toString(),
          type: "reporter",
          text: messageText,
          timestamp: new Date().toLocaleString(),
        };

        setCaseData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          };
        });

        setNewMessageText("");

        // Scroll to bottom after adding message
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "under review":
        return "bg-blue-500/15 text-blue-700 border-blue-500/30 border-2";
      case "in progress":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30 border-2";
      case "resolved":
        return "bg-green-500/15 text-green-700 border-green-500/30 border-2";
      case "pending":
        return "bg-yellow-500/15 text-yellow-700 border-yellow-500/50 border-2";
      case "closed":
        return "bg-gray-500/15 text-gray-700 border-gray-500/50 border-2";
      default:
        return "bg-slate-500/15 text-slate-700 border-slate-500/50 border-2";
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="h-6 w-6" />
              Track Your Case
            </CardTitle>
            <CardDescription>
              Enter your tracking code to view case status and messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Enter tracking code (e.g., ABC1234)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                className="font-mono"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "View Case"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {caseData && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">Case Details</CardTitle>
                    <CardDescription>
                      Tracking Code: {caseData.id}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(caseData.status)}>
                    {caseData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1">{caseData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Submitted
                    </p>
                    <p className="mt-1">{caseData.createdAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </CardTitle>
                  {isConnected && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Radio className="h-3 w-3 animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={scrollContainerRef}
                  className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                >
                  {caseData.messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    caseData.messages.map((message) => {
                      const isReporter = message.type === "reporter";
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 transition-all duration-200 ${
                            isReporter ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-4 ${
                              isReporter
                                ? "bg-muted border border-border hover:shadow-sm"
                                : "bg-primary/10 border border-primary/20 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <span className="text-xs font-medium">
                                {isReporter ? "You" : "Compliance Team"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap wrap-break-word">
                              {message.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <Separator className="my-4" />

                {/* Closed case banner */}
                {caseData?.status === "Closed" && (
                  <div className="mb-3 rounded-lg border bg-amber-50 text-amber-700 px-3 py-2 text-xs">
                    This case is closed. No further messages can be sent.
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    placeholder="Write a message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1"
                    rows={2}
                    disabled={isSending || caseData?.status === "Closed"}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isSending && newMessageText.trim()) {
                          handleSendMessage(e as any);
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={
                      isSending ||
                      !newMessageText.trim() ||
                      caseData?.status === "Closed"
                    }
                  >
                    {isSending ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                {isConnected && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Messages sync in real-time
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
