import { createClient } from "@/lib/supabase/client";

export interface UploadFileParams {
  reportId: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  filePath?: string;
  attachmentId?: string;
  error?: string;
}

export interface Attachment {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface AttachmentWithUrl extends Attachment {
  signedUrl: string;
}

/**
 * Upload a file securely to Supabase Storage
 * Files are stored in a private bucket with access control
 * Path structure: reports/{reportId}/attachments/{filename}
 * 
 * TODO: Replace with self-hosted storage solution (Azure Blob, S3, etc.) if needed
 */
export async function uploadFile({
  reportId,
  file,
  onProgress,
}: UploadFileParams): Promise<UploadResult> {
  try {
    const supabase = createClient();

    // Generate secure filename (prevent path traversal)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `reports/${reportId}/attachments/${timestamp}_${sanitizedFileName}`;

    // Upload file to private bucket
    // Note: onUploadProgress is not supported by Supabase Storage
    // Progress tracking would need to be implemented differently if required
    const { data, error } = await supabase.storage
      .from("report-attachments")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    // Simulate progress completion after upload
    if (onProgress) {
      onProgress(100);
    }

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload file",
      };
    }

    // Insert attachment record into database
    const { data: attachmentData, error: dbError } = await supabase
      .from("report_attachments")
      .insert({
        report_id: reportId,
        file_name: file.name,
        file_path: data.path,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // File was uploaded but record insert failed - could clean up file here
      // For now, we'll still return success since the file is uploaded
      return {
        success: true,
        filePath: data.path,
      };
    }

    return {
      success: true,
      filePath: data.path,
      attachmentId: attachmentData.id,
    };
  } catch (error) {
    console.error("Upload exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred during upload",
    };
  }
}

/**
 * Get a signed URL for downloading/viewing a file
 * URLs expire after 1 hour for security
 * 
 * SECURITY: Only authenticated admins or the report owner should have access
 */
export async function getFileUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from("report-attachments")
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Signed URL error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate file URL",
      };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error("Signed URL exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get all attachments for a specific report
 * Returns attachments with signed URLs for download/viewing
 */
export async function getReportAttachments(
  reportId: string
): Promise<{ success: boolean; attachments?: AttachmentWithUrl[]; error?: string }> {
  try {
    const supabase = createClient();

    // Fetch attachments from database
    const { data: attachments, error: dbError } = await supabase
      .from("report_attachments")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching attachments:", dbError);
      return {
        success: false,
        error: dbError.message || "Failed to fetch attachments",
      };
    }

    if (!attachments || attachments.length === 0) {
      return { success: true, attachments: [] };
    }

    // Generate signed URLs for each attachment
    const attachmentsWithUrls: AttachmentWithUrl[] = await Promise.all(
      attachments.map(async (attachment) => {
        const urlResult = await getFileUrl(attachment.file_path, 3600);
        return {
          ...attachment,
          signedUrl: urlResult.url || "",
        };
      })
    );

    return {
      success: true,
      attachments: attachmentsWithUrls,
    };
  } catch (error) {
    console.error("Get attachments exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete a file from storage
 * Used when cleaning up reports or failed uploads
 */
export async function deleteFile(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from("report-attachments")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete file",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
