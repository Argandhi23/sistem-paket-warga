import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleError } from "@/lib/error-handler";
import { ApiError } from "@/lib/custom-error";
import { PackageService } from "@/services/package.service";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Hanya Admin yang dapat mengakses data analitik.");
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const analytics = await PackageService.getAnalytics(days);

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    return handleError(error);
  }
}
