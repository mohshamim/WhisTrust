import { NextRequest, NextResponse } from "next/server";
import { getOrganizationById, updateOrganization, deleteOrganization } from "@/lib/services/organizations";
import { isSuperAdmin } from "@/lib/services/super-admin-auth";

// GET /api/superadmin/organizations/[id] - Get organization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await getOrganizationById(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get organization API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PATCH /api/superadmin/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = await updateOrganization(id, body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Update organization API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await deleteOrganization(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Delete organization API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}

