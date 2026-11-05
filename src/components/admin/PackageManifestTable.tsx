'use client';

import { useMemo, useState } from 'react';
import { usePackageRealtime } from '@/hooks/use-package-realtime';
import { CheckCircle2, Clock, Filter, Package as PackageIcon, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';
import { PackageDetailModal } from '@/components/modal/PackageDetailModal';

interface Package {
  id: string;
  trackingNumber: string | null;
  courierName: string;
  recipientName: string;
  status: string;
  unitNumber: string;
  receivedAt: string | Date;
  pickedUpAt?: string | Date | null;
  pickedUpBy?: string | null;
  penaltyAmount?: number;
  penaltyPaid?: boolean;
  security?: { name: string | null } | null;
}

export default function PackageManifestTable({ initialData }: { initialData: Package[] }) {
  const { data: session } = useSession();
  const [packages, setPackages] = useState<Package[]>(initialData);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECEIVED_BY_SECURITY' | 'DELIVERED_TO_WARGA' | 'EXPIRED'>('ALL');

  usePackageRealtime((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' && newRecord) {
      setPackages((prev) => [newRecord as unknown as Package, ...prev]);
    } else if (eventType === 'UPDATE' && newRecord) {
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === newRecord.id ? (newRecord as unknown as Package) : pkg))
      );
    } else if (eventType === 'DELETE' && oldRecord) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== oldRecord.id));
    }
  });

  const filteredPackages = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (statusFilter !== 'ALL' && pkg.status !== statusFilter) {
        return false;
      }
      if (!keyword) return true;
      return (
        (pkg.trackingNumber ?? '').toLowerCase().includes(keyword) ||
        pkg.courierName.toLowerCase().includes(keyword) ||
        pkg.recipientName.toLowerCase().includes(keyword) ||
        pkg.unitNumber.toLowerCase().includes(keyword)
      );
    });
  }, [packages, searchTerm, statusFilter]);

  const renderStatusBadge = (status: string) => {
    if (status === 'RECEIVED_BY_SECURITY') {
      return (
        <Badge variant="primary" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Di Pos Satpam
        </Badge>
      );
    }
    if (status === 'EXPIRED') {
      return (
        <Badge variant="danger" className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Kedaluwarsa
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Diambil Warga
      </Badge>
    );
  };

  return (
    <div>
      <div className="p-4 border-b border-border-light bg-bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 group max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan No. Resi, Rumah, Penerima, atau Kurir..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-border-light outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-bold text-text-main outline-none focus:border-primary"
          >
            <option value="ALL">Semua Status</option>
            <option value="RECEIVED_BY_SECURITY">Di Pos Satpam</option>
            <option value="DELIVERED_TO_WARGA">Diambil Warga</option>
            <option value="EXPIRED">Kedaluwarsa</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full text-left">
          <thead className="table-head">
            <tr className="border-b border-border-light">
              <th className="px-6 py-4 font-semibold">Resi & Kurir</th>
              <th className="px-6 py-4 font-semibold">Penerima</th>
              <th className="px-6 py-4 font-semibold">Blok / No</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageIcon className="h-8 w-8 text-primary-light" />
                    <p className="text-text-muted">Tidak ada data paket sesuai filter saat ini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPackages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="border-b border-border-light text-text-body last:border-b-0 transition-colors hover:bg-bg-header/30"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-main">
                      {pkg.trackingNumber || 'Tanpa Resi'}
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted font-medium">
                      {pkg.courierName}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-body">
                    {pkg.recipientName}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-bg-header text-text-main">
                      {pkg.unitNumber}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(pkg.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className="text-primary font-bold text-xs hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selectedPackage && (
          <PackageDetailModal
            open={!!selectedPackage}
            onClose={() => setSelectedPackage(null)}
            isSecurity={session?.user?.role === 'SECURITY' || session?.user?.role === 'ADMIN'}
            paket={{
              id: selectedPackage.id,
              trackingNumber: selectedPackage.trackingNumber || '',
              status: selectedPackage.status === 'RECEIVED_BY_SECURITY' ? 'Menunggu Pengambilan' : 'Sudah Diambil',
              courierName: selectedPackage.courierName,
              recipientName: selectedPackage.recipientName,
              receivedAt: selectedPackage.receivedAt,
              storedAt: `Pos Security - Unit ${selectedPackage.unitNumber}`,
              receivedBy: selectedPackage.security?.name || 'Petugas',
              pickedUpAt: selectedPackage.pickedUpAt,
              pickedUpBy: selectedPackage.pickedUpBy,
              penaltyAmount: selectedPackage.penaltyAmount,
              penaltyPaid: selectedPackage.penaltyPaid,
            }}
          />
        )}
      </div>
    </div>
  );
}
