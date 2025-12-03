import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, fileName } = body;

    if (!filePath || !fileName) {
      return NextResponse.json(
        { error: "Missing file path or name" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Download file from storage
    const { data, error } = await supabase.storage
      .from("report-attachments")
      .download(filePath);

    if (error) {
      console.error("Storage download error:", error);
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return file with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Download attachment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download attachment" },
      { status: 500 }
    );
  }
}

