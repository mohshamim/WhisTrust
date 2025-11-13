/**
 * Storage Service - File Upload/Download
 * Handles file operations with Supabase Storage
 */

import { createServiceClient } from "@/lib/supabase/service-client";

const BUCKET_NAME = "report-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export interface UploadFileParams {
  reportId: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadFileResult {
  success: boolean;
  filePath?: string;
  error?: string;
  attachmentId?: string;
}

export interface DownloadFileResult {
  success: boolean;
  data?: Blob;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile({
  reportId,
  file,
  onProgress,
}: UploadFileParams): Promise<UploadFileResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "File type not allowed. Please upload PDF, Word, Excel, or image files.",
      };
    }

    const supabase = createServiceClient();

    // Generate unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split(".").pop();
    const fileName = `${reportId}_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `${reportId}/${fileName}`;

    // Simulate progress for better UX
    if (onProgress) {
      onProgress(10);
    }

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        error: uploadError.message || "Failed to upload file",
      };
    }

    if (onProgress) {
      onProgress(60);
    }

    // Save attachment metadata to database
    const { data: attachmentData, error: dbError } = await supabase
      .from("report_attachments")
      .insert({
        report_id: reportId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: null, // NULL for reporter uploads
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      
      // Try to delete uploaded file since DB insert failed
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      
      return {
        success: false,
        error: "Failed to save file metadata",
      };
    }

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      filePath: filePath,
      attachmentId: attachmentData.id,
    };
  } catch (error) {
    console.error("Upload file error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  filePath: string
): Promise<DownloadFileResult> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error("Storage download error:", error);
      return {
        success: false,
        error: error.message || "Failed to download file",
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Download file error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get signed URL for file (for temporary access)
 */
export async function getFileUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Get signed URL error:", error);
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
    console.error("Get file URL error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // First, delete from database
    const { error: dbError } = await supabase
      .from("report_attachments")
      .delete()
      .eq("file_path", filePath);

    if (dbError) {
      console.error("Database delete error:", dbError);
      return {
        success: false,
        error: "Failed to delete file metadata",
      };
    }

    // Then, delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      return {
        success: false,
        error: storageError.message || "Failed to delete file from storage",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete file error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all attachments for a report
 */
export async function getReportAttachments(reportId: string): Promise<{
  success: boolean;
  attachments?: Array<{
    id: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
  }>;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("report_attachments")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get attachments error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch attachments",
      };
    }

    return {
      success: true,
      attachments: data || [],
    };
  } catch (error) {
    console.error("Get report attachments error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Upload file by admin (with admin ID tracking)
 */
export async function uploadFileByAdmin({
  reportId,
  file,
  adminId,
  onProgress,
}: UploadFileParams & { adminId: string }): Promise<UploadFileResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "File type not allowed",
      };
    }

    const supabase = createServiceClient();

    // Generate unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split(".").pop();
    const fileName = `${reportId}_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `${reportId}/${fileName}`;

    if (onProgress) {
      onProgress(10);
    }

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "Failed to upload file",
      };
    }

    if (onProgress) {
      onProgress(60);
    }

    // Save attachment with admin ID
    const { data: attachmentData, error: dbError } = await supabase
      .from("report_attachments")
      .insert({
        report_id: reportId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: adminId,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      
      return {
        success: false,
        error: "Failed to save file metadata",
      };
    }

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      filePath: filePath,
      attachmentId: attachmentData.id,
    };
  } catch (error) {
    console.error("Upload file by admin error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
