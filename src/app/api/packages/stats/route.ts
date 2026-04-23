import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/error-handler";
import { ApiError } from "@/lib/custom-error";
import { PackageService } from "@/services/package.service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const stats = await PackageService.getPackageStats({
      wargaId: session.user.id,
      role: session.user.role
    });

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return handleError(error);
  }
}
