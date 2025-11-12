import { NextRequest, NextResponse } from "next/server";
import { getAllOrganizations, createOrganization, getOrganizationStats } from "@/lib/services/organizations";
import { isSuperAdmin } from "@/lib/services/super-admin-auth";

// GET /api/superadmin/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    // Verify super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const result = await getOrganizationStats();
      return NextResponse.json(result);
    }

    const result = await getAllOrganizations();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get organizations API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    // Verify super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.subdomain || !body.primary_contact_email || !body.plan) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createOrganization(body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Create organization API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

