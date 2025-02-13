import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real implementation, you would check the actual hardware status
    // This is a mock response for demonstration
    return NextResponse.json({
      status: "online",
      lastSeen: new Date().toISOString(),
      camera: "active",
      wifi: "connected",
      ledStatus: "ready"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get hardware status" },
      { status: 500 }
    );
  }
}