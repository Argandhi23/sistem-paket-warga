'use client';

import { useState } from 'react';
import { FilterButton } from '@/components/shell/FilterButton';
import { FilterPanel } from '@/components/shell/FilterPanel';
import { Package, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type PackageRowProps = {
  packages: any[];
  totalCount: number;
  baseUrl: string;
};

export function PackageHistorySection({ packages, totalCount, baseUrl }: PackageRowProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="table-container mt-4">
      <div className="p-6 border-b border-border-light bg-bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-text-main">Riwayat Pengambilan</h2>
          <div className="flex items-center gap-2">
            <FilterButton isOpen={isFilterOpen} onToggle={() => setIsFilterOpen(!isFilterOpen)} />
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={16} /> Export
            </Button>
          </div>
        </div>
      </div>

      <FilterPanel baseUrl={baseUrl} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full text-left">
          <thead className="table-head">
            <tr className="border-b border-border-light">
              <th className="px-6 py-4 font-semibold text-center">No Resi</th>
              <th className="px-6 py-4 font-semibold text-center">Kurir</th>
              <th className="px-6 py-4 font-semibold text-center">Tanggal Masuk</th>
              <th className="px-6 py-4 font-semibold text-center">Tanggal Ambil</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-bg-header text-primary-light">
                      <Package className="h-10 w-10" />
                    </div>
                    <p className="text-xl font-bold text-text-main">Log Paket Kosong</p>
                    <p className="mt-1 text-text-muted">Belum ada riwayat pengambilan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              packages.map((pkg: any) => (
                <tr key={pkg.id} className="border-b border-border-light text-text-body last:border-b-0 transition-colors hover:bg-bg-header/30">
                  <td className="px-6 py-4 font-bold text-text-main text-center">{pkg.trackingNumber || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium">{pkg.courierName}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {new Date(pkg.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {pkg.pickedUpAt ? new Date(pkg.pickedUpAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="success" className="gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sudah Diambil
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-primary font-bold text-sm hover:underline">Detail</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-border-light bg-bg-card flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-muted font-medium">
          Menampilkan {packages.length} dari {totalCount} riwayat
        </p>
        <div className="flex items-center gap-1">
          <button className="size-8 flex items-center justify-center rounded-lg border border-border-light text-text-muted hover:bg-bg-header transition-all">&lt;</button>
          <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
          <button className="size-8 flex items-center justify-center rounded-lg border border-border-light text-text-muted text-xs font-bold hover:bg-bg-header">2</button>
          <button className="size-8 flex items-center justify-center rounded-lg border border-border-light text-text-muted text-xs font-bold hover:bg-bg-header">3</button>
          <span className="px-2 text-text-muted">...</span>
          <button className="size-8 flex items-center justify-center rounded-lg border border-border-light text-text-muted text-xs font-bold hover:bg-bg-header">8</button>
          <button className="size-8 flex items-center justify-center rounded-lg border border-border-light text-text-muted hover:bg-bg-header transition-all">&gt;</button>
        </div>
      </div>
    </div>
  );
}
