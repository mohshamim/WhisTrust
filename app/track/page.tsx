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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Search, Send, User, Radio } from "lucide-react";
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
      // Import services
      const { getReportByTrackingCode } = await import(
        "@/lib/services/reports"
      );
      const { getReportMessages } = await import("@/lib/services/messages");

      // Get report data
      const reportResult = await getReportByTrackingCode(trackingCode);

      if (reportResult.success && reportResult.report) {
        // Get messages for this report
        const messagesResult = await getReportMessages(reportResult.report.id);

        if (messagesResult.success) {
          // Transform data to match UI expectations
          setCaseData({
            id: reportResult.report.tracking_code,
            reportId: reportResult.report.id,
            status: reportResult.report.status,
            category: reportResult.report.category,
            createdAt: new Date(
              reportResult.report.created_at
            ).toLocaleDateString(),
            messages:
              messagesResult.messages?.map((msg) => ({
                id: msg.id,
                type: msg.sender_type,
                text: msg.content,
                timestamp: new Date(msg.created_at).toLocaleString(),
              })) || [],
          });
        } else {
          alert(messagesResult.error || "Failed to load messages");
        }
      } else {
        alert(reportResult.error || "Report not found");
      }
    } catch (error) {
      console.error("Error loading case:", error);
      alert("An error occurred while loading the case");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !caseData?.reportId) return;

    setIsSending(true);

    try {
      const { sendMessage } = await import("@/lib/services/messages");

      const result = await sendMessage({
        report_id: caseData.reportId,
        sender_type: "reporter",
        content: newMessageText.trim(),
      });

      if (result.success) {
        setNewMessageText("");
        // Message will appear automatically via realtime subscription
      } else {
        alert(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "In Progress":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Resolved":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-muted";
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
                  {caseData.messages.map((message) => {
                    const isReporter = message.type === "reporter";
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          isReporter ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            isReporter
                              ? "bg-muted border border-border"
                              : "bg-primary/10 border border-primary/20"
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
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <Separator className="my-4" />

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Write a message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
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
