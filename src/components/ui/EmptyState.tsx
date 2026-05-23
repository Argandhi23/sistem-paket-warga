import { Box, RefreshCcw, HelpCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  onHelp?: () => void;
}

export const EmptyState = ({ 
  title = "Tidak ada data yang cocok dengan filter ini", 
  description = "Kami tidak menemukan data dengan kriteria pencarian Anda saat ini. Coba periksa kembali ejaan atau hapus beberapa filter.",
  onReset,
  onHelp
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl transform scale-150" />
        <div className="relative flex size-32 items-center justify-center rounded-3xl bg-bg-card border border-border-light shadow-card rotate-12">
          <Box className="size-16 text-primary-light" />
          <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-soft">
            <HelpCircle size={20} />
          </div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-text-main">{title} 📦</h3>
      <p className="mt-2 max-w-md text-text-muted">
        {description}
      </p>
      
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <Button onClick={onReset} className="gap-2 px-8">
            <RefreshCcw size={18} />
            Reset Filter
          </Button>
        )}
        <Button variant="outline" onClick={onHelp} className="px-8 border-border-main text-text-muted">
          Bantuan
        </Button>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left">
        <div className="p-4 rounded-xl border border-border-light bg-bg-muted/30">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <RefreshCcw size={14} />
            Cek Riwayat
          </div>
          <p className="text-xs text-text-muted leading-relaxed text-balance">
            Beberapa paket lama mungkin telah diarsipkan secara otomatis.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border-light bg-bg-muted/30">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <HelpCircle size={14} />
            Ejaan Resi
          </div>
          <p className="text-xs text-text-muted leading-relaxed text-balance">
            Pastikan nomor resi menggunakan format yang benar (huruf besar/kecil).
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border-light bg-bg-muted/30">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <HelpCircle size={14} />
            Filter Luas
          </div>
          <p className="text-xs text-text-muted leading-relaxed text-balance">
            Gunakan filter &quot;Semua Status&quot; untuk hasil pencarian yang lebih luas.
          </p>
        </div>
      </div>
    </div>
  );
};
