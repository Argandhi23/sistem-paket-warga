import { NextResponse } from 'next/server';
import { PackageService } from '@/services/package.service';

export async function GET(request: Request) {
  try {
    // Jalankan service untuk sync data package ter-expired
    const result = await PackageService.processExpiredPackages();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Background task cron executed successfully',
      updatedCount: result.count
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) }, 
      { status: 500 }
    );
  }
}
