"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin-sidebar";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  FileSearch,
  Filter,
  Search,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";

export default function CasesPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam || "all");

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const { getAllReports } = await import("@/lib/services/reports");

      const result = await getAllReports();
      if (result.success && result.reports) {
        let filteredCases = result.reports;

        // Apply status filter
        if (statusFilter !== "all") {
          const statusMap: { [key: string]: string } = {
            open: "pending",
            progress: "in_progress",
            resolved: "resolved",
          };
          filteredCases = filteredCases.filter(
            (c: any) => c.status === statusMap[statusFilter]
          );
        }

        setCases(filteredCases);
      }
    } catch (error) {
      console.error("Error loading cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      },
      in_review: {
        label: "In Review",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      },
      in_progress: {
        label: "In Progress",
        className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      },
      resolved: {
        label: "Resolved",
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      },
      closed: {
        label: "Closed",
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
    );
  };

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const openCaseDetails = (case_: any) => {
    setSelectedCase(case_);
    setIsDrawerOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedCase) return;

    try {
      const { updateReport } = await import("@/lib/services/reports");
      
      const result = await updateReport(selectedCase.tracking_code, {
        status: newStatus,
      });

      if (result.success) {
        // Update local state
        setCases((prev) =>
          prev.map((c) =>
            c.id === selectedCase.id ? { ...c, status: newStatus } : c
          )
        );
        // Update selected case
        setSelectedCase({ ...selectedCase, status: newStatus });
        alert("Status updated successfully!");
      } else {
        alert(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status");
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div>
              <h1 className="text-lg font-semibold">All Cases</h1>
              <p className="text-sm text-muted-foreground">
                Manage and review reports
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="w-[200px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cases</CardTitle>
                  <CardDescription>
                    {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cases found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No cases have been submitted yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((case_) => (
                      <TableRow
                        key={case_.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openCaseDetails(case_)}
                      >
                        <TableCell className="font-mono font-medium">
                          {case_.tracking_code}
                        </TableCell>
                        <TableCell>{case_.category}</TableCell>
                        <TableCell>{getStatusBadge(case_.status)}</TableCell>
                        <TableCell>
                          {new Date(case_.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCaseDetails(case_);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Case Details Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b">
              <DrawerTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                Case Details
              </DrawerTitle>
              <DrawerDescription>
                Tracking Code: {selectedCase?.tracking_code}
              </DrawerDescription>
            </DrawerHeader>

            {selectedCase && (
              <div className="overflow-y-auto flex-1 p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Case Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Case Information</CardTitle>
                        {getStatusBadge(selectedCase.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Category
                          </p>
                          <p className="mt-1">{selectedCase.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Created At
                          </p>
                          <p className="mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(selectedCase.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Description
                        </p>
                        <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                          {selectedCase.description}
                        </p>
                      </div>

                      {(selectedCase.reporter_name || selectedCase.reporter_email) && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Reporter Information
                          </p>
                          <div className="space-y-2">
                            {selectedCase.reporter_name && (
                              <p className="text-sm flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {selectedCase.reporter_name}
                              </p>
                            )}
                            {selectedCase.reporter_email && (
                              <p className="text-sm">{selectedCase.reporter_email}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Messages Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Messages
                      </CardTitle>
                      <CardDescription>
                        Communication history for this case
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <DrawerFooter className="border-t">
              <div className="flex gap-3">
                <Select 
                  defaultValue={selectedCase?.status}
                  onValueChange={(value) => {
                    // Store selected value for update
                    if (selectedCase) {
                      setSelectedCase({ ...selectedCase, status: value });
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => selectedCase && handleStatusUpdate(selectedCase.status)}
                >
                  Update Status
                </Button>
              </div>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SidebarInset>
    </SidebarProvider>
  );
}
