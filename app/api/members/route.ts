import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Organization from "@/models/Organization";
import { handleApiError, validateRequest } from "@/lib/error-handler";
import { memberSchema } from "@/lib/validation-schemas";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId || !['admin', 'co-admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Validate request data
    const validatedData = validateRequest(data, memberSchema);

    // Check if member already exists in the organization
    const existingMember = await Member.findOne({
      organizationId: session.user.organizationId,
      $or: [
        { enrollmentId: validatedData.enrollmentId },
        { email: validatedData.email }
      ]
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Member with this ID or email already exists in your organization" },
        { status: 400 }
      );
    }

    // Get organization type to determine member type
    const organization = await Organization.findById(session.user.organizationId);
    const memberType = organization?.type === 'education' ? 'student' : 'employee';

    const member = await Member.create({
      ...validatedData,
      type: memberType,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const query = {
      organizationId: session.user.organizationId,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { enrollmentId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      })
    };

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      members,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}