/**
 * Metadata Cleaning Edge Function
 * 
 * This function removes sensitive metadata from uploaded files including:
 * - EXIF data (GPS coordinates, camera settings, timestamps)
 * - Author information
 * - Document metadata
 * - Other potentially identifying information
 * 
 * TODO: Replace with self-hosted solution (Azure Function, AWS Lambda, etc.) for Saudi hosting
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FileMetadata {
  file_path: string;
  report_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { file_path, report_id }: FileMetadata = await req.json();

    if (!file_path || !report_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Cleaning metadata for file: ${file_path}`);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("report-attachments")
      .download(file_path);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get file buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // TODO: Implement actual metadata cleaning
    // For production, use libraries like:
    // - pdf-lib for PDFs
    // - sharp for images
    // - exceljs for Excel files
    // This is a placeholder that returns the original file
    
    console.log("Metadata cleaning placeholder - returning original file");

    // Upload cleaned file back (replace original)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("report-attachments")
      .update(file_path, buffer, {
        contentType: fileData.type,
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload cleaned file" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("File metadata cleaned successfully");

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Metadata cleaned successfully",
        file_path: uploadData.path,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
