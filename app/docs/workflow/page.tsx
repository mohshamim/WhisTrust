"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  FileText,
  Search,
  UserCheck,
  ShieldQuestion,
  CheckCircle,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Play,
  Flag,
  ChevronUp,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Icon color mapping for rings
const iconColors: Record<string, string> = {
  FileText: "bg-blue-500/20 ring-blue-500/30",
  Search: "bg-purple-500/20 ring-purple-500/30",
  UserCheck: "bg-green-500/20 ring-green-500/30",
  ShieldQuestion: "bg-orange-500/20 ring-orange-500/30",
  CheckCircle: "bg-teal-500/20 ring-teal-500/30",
  ClipboardList: "bg-pink-500/20 ring-pink-500/30",
};

// Custom Node Component with Enhanced Visuals
const WorkflowNode = ({
  data,
  selected,
}: {
  data: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip: string;
    stepId: string;
    iconName: string;
  };
  selected?: boolean;
}) => {
  const Icon = data.icon;
  const colorClass =
    iconColors[data.iconName] || "bg-primary/20 ring-primary/30";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "px-4 py-3 bg-card border-2 border-border rounded-lg shadow-md cursor-pointer group relative",
              "transition-all duration-300",
              selected && "border-primary shadow-lg",
              "hover:shadow-xl hover:shadow-primary/20"
            )}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/5 blur-xl -z-10" />

            {/* Source Handle (right) */}
            <Handle
              type="source"
              position={Position.Right}
              id="source"
              className="!w-3 !h-3 !bg-primary !border-2 !border-background"
              style={{ right: -6 }}
            />
            {/* Target Handle (left) */}
            <Handle
              type="target"
              position={Position.Left}
              id="target"
              className="!w-3 !h-3 !bg-primary !border-2 !border-background"
              style={{ left: -6 }}
            />

            <div className="flex items-center gap-3">
              {/* Icon with colored ring */}
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                    colorClass,
                    "group-hover:ring-4 group-hover:ring-offset-2 ring-offset-background"
                  )}
                >
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {data.label}
                </p>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          className="backdrop-blur-sm bg-foreground/90 text-background"
          sideOffset={8}
        >
          <p className="text-xs">{data.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Responsive node positions
const getNodePositions = (isMobile: boolean) => {
  if (isMobile) {
    // Vertical stacking for mobile
    const startY = 50;
    const x = 150;
    const nodeSpacing = 180;
    return [
      { x, y: startY },
      { x, y: startY + nodeSpacing * 1 },
      { x, y: startY + nodeSpacing * 2 },
      { x, y: startY + nodeSpacing * 3 },
      { x, y: startY + nodeSpacing * 4 },
      { x, y: startY + nodeSpacing * 5 },
    ];
  }
  // Horizontal layout for desktop
  const nodeWidth = 300;
  const startX = 50;
  const y = 200;
  return [
    { x: startX, y },
    { x: startX + nodeWidth * 1, y },
    { x: startX + nodeWidth * 2, y },
    { x: startX + nodeWidth * 3, y },
    { x: startX + nodeWidth * 4, y },
    { x: startX + nodeWidth * 5, y },
  ];
};

// Determine if mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

export default function WorkflowPage() {
  const isMobile = useIsMobile();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const stepCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const nodePositions = getNodePositions(isMobile);

  const initialNodes: Node[] = [
    {
      id: "1",
      type: "workflow",
      position: nodePositions[0],
      data: {
        label: "Report Submission",
        icon: FileText,
        tooltip: "Anonymous reporter submits a secure case.",
        stepId: "step-1",
        iconName: "FileText",
      },
    },
    {
      id: "2",
      type: "workflow",
      position: nodePositions[1],
      data: {
        label: "Case Review",
        icon: Search,
        tooltip: "Compliance team reviews details and categorizes the report.",
        stepId: "step-2",
        iconName: "Search",
      },
    },
    {
      id: "3",
      type: "workflow",
      position: nodePositions[2],
      data: {
        label: "Manager Assignment",
        icon: UserCheck,
        tooltip: "Case is assigned to a responsible manager for follow-up.",
        stepId: "step-3",
        iconName: "UserCheck",
      },
    },
    {
      id: "4",
      type: "workflow",
      position: nodePositions[3],
      data: {
        label: "Investigation",
        icon: ShieldQuestion,
        tooltip: "Investigator collects evidence and feedback.",
        stepId: "step-4",
        iconName: "ShieldQuestion",
      },
    },
    {
      id: "5",
      type: "workflow",
      position: nodePositions[4],
      data: {
        label: "Resolution",
        icon: CheckCircle,
        tooltip: "Findings concluded and corrective actions initiated.",
        stepId: "step-5",
        iconName: "CheckCircle",
      },
    },
    {
      id: "6",
      type: "workflow",
      position: nodePositions[5],
      data: {
        label: "Closure & Audit Log",
        icon: ClipboardList,
        tooltip: "Case closed; audit trail preserved for compliance.",
        stepId: "step-6",
        iconName: "ClipboardList",
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      sourceHandle: "source",
      target: "2",
      targetHandle: "target",
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        strokeWidth: 3,
        stroke: "hsl(var(--primary))",
        strokeDasharray: "8 4",
      },
      className: "animate-edge-fade-in",
    },
    {
      id: "e2-3",
      source: "2",
      sourceHandle: "source",
      target: "3",
      targetHandle: "target",
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        strokeWidth: 3,
        stroke: "hsl(var(--primary))",
        strokeDasharray: "8 4",
      },
      className: "animate-edge-fade-in",
    },
    {
      id: "e3-4",
      source: "3",
      sourceHandle: "source",
      target: "4",
      targetHandle: "target",
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        strokeWidth: 3,
        stroke: "hsl(var(--primary))",
        strokeDasharray: "8 4",
      },
      className: "animate-edge-fade-in",
    },
    {
      id: "e4-5",
      source: "4",
      sourceHandle: "source",
      target: "5",
      targetHandle: "target",
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        strokeWidth: 3,
        stroke: "hsl(var(--primary))",
        strokeDasharray: "8 4",
      },
      className: "animate-edge-fade-in",
    },
    {
      id: "e5-6",
      source: "5",
      sourceHandle: "source",
      target: "6",
      targetHandle: "target",
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        strokeWidth: 3,
        stroke: "hsl(var(--primary))",
        strokeDasharray: "8 4",
      },
      className: "animate-edge-fade-in",
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Add edge animation delays
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge, index) => ({
        ...edge,
        style: {
          ...edge.style,
          animationDelay: `${index * 0.15}s`,
        },
      }))
    );
  }, [setEdges]);

  // Handle node click to scroll to step card
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const stepId = node.data.stepId;
    const cardElement = document.getElementById(stepId);
    if (cardElement) {
      setSelectedNodeId(node.id);
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Remove highlight after animation
      setTimeout(() => setSelectedNodeId(null), 2000);
    }
  }, []);

  // Update node positions on resize
  useEffect(() => {
    const newPositions = getNodePositions(isMobile);
    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: newPositions[index],
      }))
    );
  }, [isMobile, setNodes]);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoize nodeTypes
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      workflow: (props: any) => (
        <WorkflowNode {...props} selected={selectedNodeId === props.id} />
      ),
    }),
    [selectedNodeId]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const flowStyles = useMemo(
    () => ({
      background: "transparent",
    }),
    []
  );

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Download placeholder
  const handleDownload = () => {
    alert("Workflow export feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <Shield className="h-6 w-6" />
            WhisTrust
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/documentation"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              View Docs
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/documentation">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Docs
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">WhisTrust Workflow Overview</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            This interactive diagram illustrates the secure and transparent
            lifecycle of a whistleblowing case handled through WhisTrust — from
            anonymous submission to resolution and audit logging.
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-lg overflow-hidden relative">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/30 pointer-events-none" />

            <CardContent className="p-0 relative">
              <div className="w-full h-[700px] relative overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: 0.3,
                    maxZoom: 1.2,
                  }}
                  defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.6 : 0.8 }}
                  style={flowStyles}
                  className="bg-transparent"
                  minZoom={0.2}
                  maxZoom={2}
                  attributionPosition="bottom-left"
                  nodesDraggable={!isMobile}
                  panOnScroll={true}
                  zoomOnScroll={!isMobile}
                  zoomOnPinch={true}
                >
                  <Background
                    gap={20}
                    size={1}
                    color="var(--muted-foreground)"
                    className="opacity-10"
                  />

                  {/* Start Label */}
                  {!isMobile && (
                    <div className="absolute left-4 top-[220px] z-10 flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/20">
                      <Play className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary">
                        Start
                      </span>
                    </div>
                  )}

                  {/* End Label */}
                  {!isMobile && (
                    <div className="absolute right-4 top-[220px] z-10 flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/20">
                      <Flag className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary">
                        End
                      </span>
                    </div>
                  )}

                  <Controls
                    className={cn(
                      "bg-background border border-border rounded-lg shadow-md",
                      isMobile && "hidden"
                    )}
                    showInteractive={false}
                  />
                  <MiniMap
                    nodeColor={(node) => {
                      if (node.type === "workflow") {
                        return "#8B4513";
                      }
                      return "#999";
                    }}
                    nodeStrokeWidth={2}
                    className={cn(
                      "bg-card border border-border rounded-lg shadow-md",
                      isMobile && "bottom-2 right-2 scale-75"
                    )}
                    maskColor="rgba(0, 0, 0, 0.1)"
                    pannable
                    zoomable
                    position="bottom-right"
                  />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workflow Steps Description */}
        <div className="mt-16">
          {/* Progress Bar */}
          <div className="hidden md:flex items-center justify-between mb-8 px-2">
            {initialNodes.map((_, index) => (
              <div key={index} className="flex-1 flex items-center">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 border-2 border-primary/20">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  {index < initialNodes.length - 1 && (
                    <div className="h-1 w-full bg-gradient-to-r from-primary/50 via-primary/30 to-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Accordion */}
          {isMobile ? (
            <Accordion type="single" collapsible className="space-y-4">
              {initialNodes.map((node, index) => {
                const Icon = node.data.icon;
                const ref = useRef<HTMLDivElement>(null);
                const isInView = useInView(ref, {
                  once: true,
                  margin: "-100px",
                });

                return (
                  <AccordionItem
                    key={node.id}
                    value={node.id}
                    className="border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                              Step {index + 1}
                            </span>
                            <h3 className="font-semibold">{node.data.label}</h3>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground pl-13">
                        {node.data.tooltip}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            // Desktop Grid
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialNodes.map((node, index) => {
                const Icon = node.data.icon;
                const ref = useRef<HTMLDivElement>(null);
                const isInView = useInView(ref, {
                  once: true,
                  margin: "-100px",
                });
                const isHighlighted = selectedNodeId === node.id;

                return (
                  <motion.div
                    key={node.id}
                    id={node.data.stepId}
                    ref={(el) => {
                      stepCardRefs.current[index] = el;
                    }}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, delay: index * 0.1 },
                      },
                    }}
                  >
                    <Card
                      className={cn(
                        "hover:shadow-lg transition-all duration-300 cursor-pointer",
                        index % 2 === 0 ? "bg-card" : "bg-muted/30",
                        isHighlighted &&
                          "border-primary border-2 shadow-lg shadow-primary/20 animate-pulse"
                      )}
                      onClick={() => {
                        // Scroll back to diagram
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                Step {index + 1}
                              </span>
                              <h3 className="font-semibold text-lg">
                                {node.data.label}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {node.data.tooltip}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Use the controls above to zoom, pan, and navigate the workflow
                diagram. The minimap in the bottom-right provides a quick
                overview of the entire process. Click on any node to jump to its
                detailed description below.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button asChild variant="outline">
                  <Link href="/documentation">View Full Documentation</Link>
                </Button>
                <Button asChild variant="default">
                  <Link href="/report">Submit a Report</Link>
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </div>
  );
}
