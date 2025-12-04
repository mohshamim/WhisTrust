"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  message: string;
  details?: any;
}

export default function DiagnosticPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "1. Supabase Client Connection", status: "pending", message: "Not run yet" },
    { name: "2. User Authentication", status: "pending", message: "Not run yet" },
    { name: "3. Organization Data", status: "pending", message: "Not run yet" },
    { name: "4. Reports Table Access", status: "pending", message: "Not run yet" },
    { name: "5. Risk Predictions Table", status: "pending", message: "Not run yet" },
    { name: "6. AI Analysis Table", status: "pending", message: "Not run yet" },
  ]);
  const [running, setRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => {
      const newTests = [...prev];
      newTests[index] = { ...newTests[index], ...updates };
      return newTests;
    });
  };

  const runDiagnostics = async () => {
    setRunning(true);
    
    // Test 1: Supabase Client
    updateTest(0, { status: "running", message: "Testing connection..." });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("organizations").select("id").limit(1);
      
      if (error) {
        updateTest(0, { 
          status: "error", 
          message: `Connection failed: ${error.message}`,
          details: error
        });
        setRunning(false);
        return;
      }
      
      updateTest(0, { 
        status: "success", 
        message: "Supabase client connected successfully" 
      });
    } catch (error: any) {
      updateTest(0, { 
        status: "error", 
        message: `Failed to create client: ${error.message}`,
        details: error
      });
      setRunning(false);
      return;
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: User Authentication
    updateTest(1, { status: "running", message: "Checking authentication..." });
    try {
      const result = await getCurrentClientAdmin();
      
      if (!result) {
        updateTest(1, { 
          status: "error", 
          message: "getCurrentClientAdmin returned null",
          details: result
        });
        setRunning(false);
        return;
      }

      if (!result.user) {
        updateTest(1, { 
          status: "error", 
          message: "No user found in session",
          details: result
        });
        setRunning(false);
        return;
      }

      updateTest(1, { 
        status: "success", 
        message: `Logged in as: ${result.user.email}`,
        details: { 
          userId: result.user.id, 
          role: result.user.role,
          email: result.user.email 
        }
      });

      // Test 3: Organization Data
      await new Promise(resolve => setTimeout(resolve, 500));
      updateTest(2, { status: "running", message: "Loading organization..." });
      
      if (!result.organization) {
        updateTest(2, { 
          status: "error", 
          message: "No organization found for user",
          details: result
        });
        setRunning(false);
        return;
      }

      updateTest(2, { 
        status: "success", 
        message: `Organization: ${result.organization.name}`,
        details: { 
          orgId: result.organization.id,
          subdomain: result.organization.subdomain,
          status: result.organization.status
        }
      });

      // Test 4: Reports Table
      await new Promise(resolve => setTimeout(resolve, 500));
      updateTest(3, { status: "running", message: "Querying reports table..." });
      
      const supabase = createClient();
      const { data: reports, error: reportsError } = await supabase
        .from("reports")
        .select("id, case_number, title")
        .eq("organization_id", result.organization.id)
        .limit(5);

      if (reportsError) {
        updateTest(3, { 
          status: "error", 
          message: `Reports query failed: ${reportsError.message}`,
          details: reportsError
        });
      } else {
        updateTest(3, { 
          status: "success", 
          message: `Found ${reports?.length || 0} reports`,
          details: reports
        });
      }

      // Test 5: Risk Predictions Table
      await new Promise(resolve => setTimeout(resolve, 500));
      updateTest(4, { status: "running", message: "Checking risk_predictions table..." });
      
      const { data: riskData, error: riskError } = await supabase
        .from("case_risk_predictions")
        .select("id")
        .limit(1);

      if (riskError) {
        if (riskError.message?.includes("does not exist")) {
          updateTest(4, { 
            status: "error", 
            message: "❌ TABLE MISSING: case_risk_predictions table does not exist",
            details: { solution: "Run CREATE_RISK_PREDICTIONS_TABLE.sql in Supabase" }
          });
        } else {
          updateTest(4, { 
            status: "error", 
            message: `Query failed: ${riskError.message}`,
            details: riskError
          });
        }
      } else {
        updateTest(4, { 
          status: "success", 
          message: `Table exists. Found ${riskData?.length || 0} predictions`,
          details: riskData
        });
      }

      // Test 6: AI Analysis Table
      await new Promise(resolve => setTimeout(resolve, 500));
      updateTest(5, { status: "running", message: "Checking attachment_ai_analysis table..." });
      
      const { data: aiData, error: aiError } = await supabase
        .from("attachment_ai_analysis")
        .select("id")
        .limit(1);

      if (aiError) {
        if (aiError.message?.includes("does not exist")) {
          updateTest(5, { 
            status: "error", 
            message: "❌ TABLE MISSING: attachment_ai_analysis table does not exist",
            details: { solution: "Check if AI analysis table was created" }
          });
        } else {
          updateTest(5, { 
            status: "error", 
            message: `Query failed: ${aiError.message}`,
            details: aiError
          });
        }
      } else {
        updateTest(5, { 
          status: "success", 
          message: `Table exists. Found ${aiData?.length || 0} analyses`,
          details: aiData
        });
      }

    } catch (error: any) {
      updateTest(1, { 
        status: "error", 
        message: `Authentication failed: ${error.message}`,
        details: error
      });
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">AI Section Diagnostics</CardTitle>
            <CardDescription>
              Run diagnostic tests to identify issues with AI-powered features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={runDiagnostics} 
              disabled={running}
              className="w-full"
              size="lg"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                "Run All Diagnostic Tests"
              )}
            </Button>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <Card key={index} className={`
                  ${test.status === "success" ? "border-green-200 bg-green-50/50" : ""}
                  ${test.status === "error" ? "border-red-200 bg-red-50/50" : ""}
                  ${test.status === "running" ? "border-blue-200 bg-blue-50/50" : ""}
                `}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(test.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{test.name}</h3>
                          {getStatusBadge(test.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                        {test.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              View details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {!running && tests.some(t => t.status !== "pending") && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p>✅ Passed: {tests.filter(t => t.status === "success").length}</p>
                    <p>❌ Failed: {tests.filter(t => t.status === "error").length}</p>
                    <p>⏳ Pending: {tests.filter(t => t.status === "pending").length}</p>
                  </div>
                  
                  {tests.filter(t => t.status === "error").length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">⚠️ Issues Found</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {tests
                          .filter(t => t.status === "error" && t.message.includes("TABLE MISSING"))
                          .map((t, i) => (
                            <li key={i}>• {t.message}</li>
                          ))}
                      </ul>
                      {tests.some(t => t.message.includes("TABLE MISSING: case_risk_predictions")) && (
                        <div className="mt-3 p-3 bg-white rounded border border-red-300">
                          <p className="font-semibold text-sm mb-1">🔧 Solution:</p>
                          <p className="text-xs">
                            Run <code className="bg-red-100 px-1 py-0.5 rounded">CREATE_RISK_PREDICTIONS_TABLE.sql</code> in Supabase SQL Editor
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

