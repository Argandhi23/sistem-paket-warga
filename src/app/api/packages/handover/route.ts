import { NextResponse } from 'next/server';
import { PackageService } from '@/services/package.service';
import { handleError } from '@/lib/error-handler';
import { ApiError } from '@/lib/custom-error';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SECURITY" && session.user.role !== "ADMIN")) {
      throw new ApiError(403, "Hanya Security atau Admin yang dapat memproses penyerahan paket.");
    }

    const body = await request.json();
    const { id, pickedUpBy, penaltyAmount, penaltyPaid } = body;
    
    if (!id) throw new ApiError(400, "ID paket wajib diisi.");

    const updatedPackage = await PackageService.handoverPackage(id, {
      pickedUpBy,
      penaltyAmount,
      penaltyPaid: !!penaltyPaid,
    });
    
    return NextResponse.json({ success: true, data: updatedPackage });
  } catch (error) {
    return handleError(error);
  }
}
