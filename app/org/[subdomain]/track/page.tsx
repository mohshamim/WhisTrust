"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Radio,
  User,
  UserCircle2,
} from "lucide-react";
import { getOrganizationBySubdomain } from "@/lib/services/client-auth";
import type { ClientOrganization } from "@/lib/services/client-auth";
import {
  getReportMessages,
  sendReporterMessage,
  type Message,
} from "@/lib/services/messages";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";

interface Report {
  id: string;
  case_number: string;
  tracking_code: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function TrackReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;

  const [organization, setOrganization] = useState<ClientOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  // Messaging state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Real-time message handler
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Check if message already exists (prevent duplicates)
      if (prev.some((m) => m.id === message.id)) return prev;

      const newMessages = [...prev, message];
      
      // Scroll after state update
      setTimeout(scrollToBottom, 100);
      
      return newMessages;
    });
  }, []);

  // Real-time subscription
  const { isConnected } = useRealtimeMessages({
    reportId: report?.id || null,
    onNewMessage: handleNewMessage,
    enabled: !!report?.id,
  });

  // Load organization
  useEffect(() => {
    loadOrganization();
  }, [subdomain]);

  // Auto-fill tracking code from URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setTrackingCode(codeFromUrl);
      // Auto-search if code is provided
      handleSearch(new Event("submit") as any, codeFromUrl);
    }
  }, [searchParams]);

  // Scroll to bottom when messages load or report changes
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [report?.id]); // Only on initial load

  const loadOrganization = async () => {
    try {
      const result = await getOrganizationBySubdomain(subdomain);

      if (!result.success || !result.organization) {
        setError("Organization not found. Please check the URL.");
        setLoading(false);
        return;
      }

      setOrganization(result.organization);
    } catch (err) {
      console.error("Failed to load organization:", err);
      setError("Failed to load organization details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent, codeOverride?: string) => {
    e.preventDefault();
    setError("");
    setReport(null);
    setMessages([]);
    setSearching(true);

    const code = codeOverride || trackingCode.trim().toUpperCase();

    try {
      const response = await fetch("/api/reports/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain,
          trackingCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Report not found");
        setSearching(false);
        return;
      }

      setReport(data.report);
      
      // Load messages
      await loadMessages(data.report.id);
    } catch (err: any) {
      console.error("Track error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const loadMessages = async (reportId: string) => {
    setLoadingMessages(true);
    try {
      const result = await getReportMessages(reportId);

      if (result.success && result.messages) {
        setMessages(result.messages);
        setTimeout(scrollToBottom, 100);
      } else {
        console.error("Failed to load messages:", result.error);
      }
    } catch (err) {
      console.error("Load messages error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!report || !newMessage.trim()) return;

    setSendingMessage(true);

    try {
      const result = await sendReporterMessage(report.id, newMessage.trim());

      if (result.success && result.message) {
        // Add message to list (real-time will also update, but this is faster UX)
        setMessages((prev) => [...prev, result.message!]);
        setNewMessage("");
        setTimeout(scrollToBottom, 100);
      } else {
        const { toast } = await import("sonner");
        toast.error(result.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Send message error:", err);
      const { toast } = await import("sonner");
      toast.error("An error occurred while sending the message");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500/15 text-blue-700 border-blue-500/30 border-2";
      case "under_review":
        return "bg-purple-500/15 text-purple-700 border-purple-500/30 border-2";
      case "investigating":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30 border-2";
      case "resolved":
        return "bg-green-500/15 text-green-700 border-green-500/30 border-2";
      case "closed":
        return "bg-gray-500/15 text-gray-700 border-gray-500/30 border-2";
      case "dismissed":
        return "bg-red-500/15 text-red-700 border-red-500/30 border-2";
      default:
        return "bg-gray-500/15 text-gray-700 border-gray-500/30 border-2";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "investigating":
      case "under_review":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !organization) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Track Your Case</CardTitle>
            <CardDescription className="text-base">
              Enter your tracking code to view case status and messages
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracking-code">Tracking Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-code"
                    placeholder="e.g., ABC12345-WXYZ"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    className="flex-1 font-mono text-lg"
                    required
                  />
                  <Button type="submit" disabled={searching} size="lg">
                    {searching ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && !report && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Case Details */}
        {report && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Case Info */}
            <div className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Case Information</span>
                    {isConnected && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-normal">
                        <Radio className="h-4 w-4" />
                        Connected
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Case Number</p>
                      <p className="font-semibold">{report.case_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">
                          {report.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold capitalize">
                      {report.category.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{report.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-sm">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="text-sm">
                        {new Date(report.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Info */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  Our team will update you on progress. You can send messages to the
                  compliance team using the messaging section.
                </AlertDescription>
              </Alert>
            </div>

            {/* Right Column: Messages */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages ({messages.length})
                </CardTitle>
                <CardDescription>
                  Communicate with the compliance team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Messages List */}
                <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {loadingMessages ? (
                    <p className="text-center text-muted-foreground py-8">
                      Loading messages...
                    </p>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        No messages yet. Send a message to start the conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.sender_type === "reporter" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.sender_type === "admin" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCircle2 className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            msg.sender_type === "reporter"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_type === "reporter"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>

                        {msg.sender_type === "reporter" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <Textarea
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={sendingMessage}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
