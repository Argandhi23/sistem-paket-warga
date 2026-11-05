import { headers } from 'next/headers';

/**
 * Utility untuk memanggil internal API di Server Components.
 */
export async function serverApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; success: boolean; message?: string }> {
  const reqHeaders = await headers();
  const host = reqHeaders.get('x-forwarded-host') || reqHeaders.get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const url = `${baseUrl}${path}`;

  const cookieHeader = reqHeaders.get('cookie') ?? '';

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        ...options.headers,
        cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    let parsed: { data?: T; success?: boolean; error?: string; message?: string } | null = null;

    if (contentType && contentType.includes('application/json')) {
      parsed = await response.json();
    } else {
      const text = await response.text();
      parsed = { message: text || response.statusText };
    }

    if (!response.ok) {
      const errorMsg = parsed?.error || parsed?.message || `Error ${response.status}`;
      console.error(`❌ [API Error] ${path} [${response.status}]:`, errorMsg);
      return {
        data: null,
        success: false,
        message: errorMsg,
      };
    }

    return {
      data: (parsed?.data ?? null) as T | null,
      success: parsed?.success ?? true,
      message: parsed?.message,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`🔥 [Network Error] ${path}:`, msg);
    return {
      data: null,
      success: false,
      message: 'Gagal terhubung ke server internal',
    };
  }
}
