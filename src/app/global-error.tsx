"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sistem Mengalami Kendala
          </h2>
          
          <p className="text-gray-600 mb-8 text-sm">
            Maaf, telah terjadi kesalahan fatal pada sistem kami. Tim teknis telah dinotifikasi dan sedang memperbaikinya.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Coba Lagi
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors gap-2"
            >
              <Home className="w-4 h-4" />
              Ke Beranda
            </a>
          </div>
          
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-gray-900 rounded-lg overflow-auto text-left">
              <p className="text-red-400 font-mono text-xs mb-2">Development Info:</p>
              <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap">
                {error.message || "Unknown error"}
                {"\n"}
                {error.digest && `Digest: ${error.digest}`}
              </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
