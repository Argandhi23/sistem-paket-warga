import { AlertTriangle, RefreshCcw, XCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  title = "Terjadi Kesalahan Koneksi", 
  message = "Sistem tidak dapat terhubung ke database logistik. Mohon periksa koneksi internet Anda atau hubungi dukungan teknis jika masalah berlanjut.",
  onRetry 
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <Card className="w-full max-w-md p-10 flex flex-col items-center shadow-card border-danger/10">
        <div className="size-20 rounded-2xl bg-danger-light flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-danger/5 rounded-full blur-xl animate-pulse" />
          <AlertTriangle className="size-10 text-danger relative z-10" />
        </div>
        
        <h2 className="text-2xl font-black text-text-main mb-4">{title}</h2>
        <p className="text-text-muted text-sm leading-relaxed mb-8">
          {message}
        </p>
        
        <Button onClick={onRetry} className="w-full py-4 gap-3 text-base shadow-lg bg-danger hover:bg-danger/90">
          <RefreshCcw size={20} />
          Muat Ulang Halaman
        </Button>
      </Card>
    </div>
  );
};

export const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-danger rounded-xl text-white mb-6 animate-in slide-in-from-top-4 duration-300 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
          <XCircle size={18} />
        </div>
        <p className="font-bold text-sm">{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-1.5 bg-white text-danger text-xs font-black rounded-lg hover:bg-opacity-90 transition-all active:scale-95 shadow-sm"
        >
          Muat Ulang
        </button>
      )}
    </div>
  );
};
