"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Route Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h2>
        
        <p className="text-gray-600 mb-8">
          Kami mengalami masalah saat memuat halaman ini. Silakan coba lagi dalam beberapa saat.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left overflow-auto">
            <p className="text-gray-500 font-mono text-xs mb-1 font-semibold">Error Message:</p>
            <p className="text-red-600 font-mono text-xs mb-2">{error.message}</p>
            {error.digest && (
              <p className="text-gray-400 font-mono text-xs">Digest: {error.digest}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
