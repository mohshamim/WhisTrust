import { createClient } from "@/lib/supabase/client";

export interface UploadFileParams {
  reportId: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
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
    const { data, error } = await supabase.storage
      .from("report-attachments")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const percentComplete =
              (progress.loaded / progress.total) * 100;
            onProgress(percentComplete);
          }
        },
      });

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload file",
      };
    }

    return {
      success: true,
      filePath: data.path,
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
