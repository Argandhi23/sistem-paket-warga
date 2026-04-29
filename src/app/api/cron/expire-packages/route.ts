import { NextResponse } from 'next/server';
import { PackageService } from '@/services/package.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Validate authorization if CRON_SECRET is set (Vercel standard)
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.warn('Unauthorized cron execution attempt');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Starting daily expired packages cron job...');
    
    // Jalankan service untuk sync data package ter-expired
    const result = await PackageService.processExpiredPackages();
    
    console.log(`Successfully processed expired packages. Count: ${result.count}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Background task cron executed successfully',
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error during expired packages cron execution:', error);
    return NextResponse.json(
      { success: false, error: String(error) }, 
      { status: 500 }
    );
  }
}
