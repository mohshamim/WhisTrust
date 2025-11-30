import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { createServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

const BUCKET_NAME = "report-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const reportId = formData.get("reportId");
    const file = formData.get("file");

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing reportId" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File type not allowed. Please upload PDF, Word, or image files.",
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split(".").pop();
    const fileName = `${reportId}_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `${reportId}/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: attachment, error: dbError } = await supabase
      .from("report_attachments")
      .insert({
        report_id: reportId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: null,
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attachmentId: attachment.id,
      filePath,
    });
  } catch (error: any) {
    console.error("Upload attachment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unexpected error during upload",
      },
      { status: 500 }
    );
  }
}

