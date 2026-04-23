import { headers } from 'next/headers';

/**
 * Utility untuk memanggil internal API di Server Components.
 */
export async function serverApiFetch<T = any>(
  path: string, 
  options: RequestInit = {}
): Promise<{ data: T; success: boolean; message?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}${path}`;
  
  const cookieHeader = (await headers()).get('cookie') ?? '';

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store', // Pastikan tidak ambil dari cache lama
      headers: {
        ...options.headers,
        'cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    let data: any = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || response.statusText };
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Error ${response.status}`;
      console.error(`❌ [API Error] ${path} [${response.status}]:`, errorMsg);
      return { 
        data: null as any, 
        success: false, 
        message: errorMsg
      };
    }

    return data;
  } catch (error: any) {
    console.error(`🔥 [Network Error] ${path}:`, error.message);
    return {
      data: null as any,
      success: false,
      message: 'Gagal terhubung ke server internal'
    };
  }
}
