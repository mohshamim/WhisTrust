"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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

// Custom Node Component with Handles
const WorkflowNode = ({
  data,
}: {
  data: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip: string;
  };
}) => {
  const Icon = data.icon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-3 bg-card border-2 border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group relative">
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
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {data.label}
                </p>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{data.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Responsive node positions - horizontal layout
const getNodePositions = () => {
  // Use horizontal layout with spacing
  const nodeWidth = 280;
  const startX = 50;
  const y = 150;

  return [
    { x: startX, y },
    { x: startX + nodeWidth * 1, y },
    { x: startX + nodeWidth * 2, y },
    { x: startX + nodeWidth * 3, y },
    { x: startX + nodeWidth * 4, y },
    { x: startX + nodeWidth * 5, y },
  ];
};

const nodePositions = getNodePositions();

const initialNodes: Node[] = [
  {
    id: "1",
    type: "workflow",
    position: nodePositions[0],
    data: {
      label: "Report Submission",
      icon: FileText,
      tooltip: "Anonymous reporter submits a secure case.",
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
      strokeWidth: 2,
      stroke: "hsl(var(--primary))",
    },
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
      strokeWidth: 2,
      stroke: "hsl(var(--primary))",
    },
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
      strokeWidth: 2,
      stroke: "hsl(var(--primary))",
    },
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
      strokeWidth: 2,
      stroke: "hsl(var(--primary))",
    },
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
      strokeWidth: 2,
      stroke: "hsl(var(--primary))",
    },
  },
];

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Memoize nodeTypes to avoid React Flow warnings
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      workflow: WorkflowNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Custom styles for ReactFlow
  const flowStyles = useMemo(
    () => ({
      background: "transparent",
      width: "100%",
      height: "100%",
    }),
    []
  );

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
          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div
                className="w-full bg-muted/30"
                style={{ width: "100%", height: "600px", minHeight: "600px" }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: 0.2,
                    maxZoom: 1.5,
                  }}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
                  style={flowStyles}
                  className="bg-transparent w-full h-full"
                  minZoom={0.3}
                  maxZoom={2}
                  attributionPosition="bottom-left"
                  proOptions={{ hideAttribution: false }}
                >
                  <Background
                    gap={20}
                    size={1}
                    color="var(--muted-foreground)"
                    opacity={0.2}
                  />
                  <Controls
                    className="bg-background border border-border rounded-lg shadow-md"
                    showInteractive={false}
                  />
                  <MiniMap
                    nodeColor={(node) => {
                      // Use theme-aware colors - ReactFlow expects rgb/hex
                      if (node.type === "workflow") {
                        // Primary color fallback - will be styled via CSS
                        return "#8B4513";
                      }
                      return "#999";
                    }}
                    nodeStrokeWidth={2}
                    className="bg-card border border-border rounded-lg shadow-md"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {initialNodes.map((node, index) => {
            const Icon = node.data.icon;
            return (
              <Card key={node.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
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
            );
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Use the controls above to zoom, pan, and navigate the workflow
                diagram. The minimap in the bottom-right provides a quick
                overview of the entire process.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button asChild variant="outline">
                  <Link href="/documentation">View Full Documentation</Link>
                </Button>
                <Button asChild variant="default">
                  <Link href="/report">Submit a Report</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
