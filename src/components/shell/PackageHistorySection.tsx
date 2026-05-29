'use client';

import { useState } from 'react';
import { FilterButton } from '@/components/shell/FilterButton';
import { FilterPanel } from '@/components/shell/FilterPanel';
import { Package, CheckCircle2, History, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorState';

type PackageRowProps = {
  packages: any[];
  totalCount: number;
  baseUrl: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onResetFilter?: () => void;
};

export function PackageHistorySection({ 
  packages = [], 
  totalCount, 
  baseUrl,
  isLoading = false,
  error = null,
  onRetry,
  onResetFilter
}: PackageRowProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 mt-4">
      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      <div className={`bg-bg-card rounded-2xl border border-border-main shadow-card overflow-hidden ${isLoading ? 'opacity-60' : ''}`}>
        <div className="p-6 border-b border-border-light bg-bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <History size={20} className="text-primary" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Riwayat Pengambilan</h2>
                  <p className="text-xs text-text-muted">Daftar paket yang telah Anda terima sebelumnya.</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <FilterButton isOpen={isFilterOpen} onToggle={() => setIsFilterOpen(!isFilterOpen)} />
            </div>
          </div>
        </div>

        <FilterPanel baseUrl={baseUrl} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead className="table-head">
              <tr className="border-b border-border-light">
                <th className="px-6 py-4 font-semibold text-center w-16 text-[10px] uppercase tracking-widest text-text-muted">No</th>
                <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-widest text-text-muted">Nomor Resi</th>
                <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-widest text-text-muted">Kurir</th>
                <th className="px-6 py-4 font-semibold text-center text-[10px] uppercase tracking-widest text-text-muted">Tgl Masuk</th>
                <th className="px-6 py-4 font-semibold text-center text-[10px] uppercase tracking-widest text-text-muted">Tgl Ambil</th>
                <th className="px-6 py-4 font-semibold text-center text-[10px] uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-6 py-4 font-semibold text-center text-[10px] uppercase tracking-widest text-text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton rows={5} />
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState 
                      title="Riwayat paket belum tersedia"
                      description="Anda belum memiliki riwayat pengambilan paket di sistem ini."
                      onReset={onResetFilter} 
                    />
                  </td>
                </tr>
              ) : (
                packages.map((pkg: any, index: number) => (
                  <tr key={pkg.id} className="border-b border-border-light text-text-body last:border-b-0 transition-colors hover:bg-bg-header/30">
                    <td className="px-6 py-4 text-center font-medium text-text-muted text-sm">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-text-muted/60 tracking-tight text-sm">{pkg.trackingNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-text-main">
                      {pkg.courierName}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-text-body">
                      {new Date(pkg.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-text-body">
                      {pkg.pickedUpAt ? new Date(pkg.pickedUpAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="success" className="gap-1.5 shadow-sm border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3" /> Diambil
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 mx-auto group">
                        Detail <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border-light bg-bg-card flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted font-medium">
            Menampilkan <span className="font-bold text-text-main">{packages.length}</span> dari <span className="font-bold text-text-main">{totalCount}</span> riwayat
          </p>
          <div className="flex items-center gap-1">
            <button className="size-9 flex items-center justify-center rounded-xl border border-border-light text-text-muted hover:bg-bg-header transition-all">&lt;</button>
            <button className="size-9 flex items-center justify-center rounded-xl bg-primary text-white text-xs font-black shadow-md">1</button>
            <button className="size-9 flex items-center justify-center rounded-xl border border-border-light text-text-muted text-xs font-bold hover:bg-bg-header">2</button>
            <button className="size-9 flex items-center justify-center rounded-xl border border-border-light text-text-muted text-xs font-bold hover:bg-bg-header">3</button>
            <span className="px-2 text-text-muted">...</span>
            <button className="size-9 flex items-center justify-center rounded-xl border border-border-light text-text-muted text-xs font-bold hover:bg-bg-header">8</button>
            <button className="size-9 flex items-center justify-center rounded-xl border border-border-light text-text-muted hover:bg-bg-header transition-all">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
