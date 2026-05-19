'use client';

import { useState } from 'react';
import { usePackageRealtime } from '@/hooks/use-package-realtime';
import { CheckCircle2, Clock, Package as PackageIcon } from 'lucide-react';
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
}

export default function PackageManifestTable({ initialData }: { initialData: Package[] }) {
  const { data: session } = useSession();
  const [packages, setPackages] = useState<Package[]>(initialData);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  usePackageRealtime((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      setPackages((prev) => [newRecord as Package, ...prev]);
    } else if (eventType === 'UPDATE') {
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === newRecord.id ? (newRecord as Package) : pkg))
      );
    } else if (eventType === 'DELETE') {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== oldRecord.id));
    }
  });

  const renderStatusBadge = (status: string) => {
    if (status === 'RECEIVED_BY_SECURITY') {
      return (
        <Badge variant="primary" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Di Pos Satpam
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
          {packages.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <PackageIcon className="h-8 w-8 text-primary-light" />
                  <p className="text-text-muted">Belum ada data paket saat ini.</p>
                </div>
              </td>
            </tr>
          ) : (
            packages.map((pkg) => (
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
            receivedAt: selectedPackage.receivedAt,
            storedAt: `Pos Security - Unit ${selectedPackage.unitNumber}`,
            receivedBy: selectedPackage.recipientName,
            pickedUpAt: selectedPackage.pickedUpAt,
            pickedUpBy: selectedPackage.pickedUpBy,
            penaltyAmount: selectedPackage.penaltyAmount,
            penaltyPaid: selectedPackage.penaltyPaid,
          }}
        />
      )}
    </div>
  );
}
