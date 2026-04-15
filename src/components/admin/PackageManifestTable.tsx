'use client';

import { useState } from 'react';
import { usePackageRealtime } from '@/hooks/use-package-realtime';
import { CheckCircle2, Clock, Package as PackageIcon } from 'lucide-react';

interface Package {
  id: string;
  trackingNumber: string | null;
  courierName: string;
  recipientName: string;
  status: string;
  unitNumber: string;
}

export default function PackageManifestTable({ initialData }: { initialData: Package[] }) {
  const [packages, setPackages] = useState<Package[]>(initialData);

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

  // Helper untuk membuat desain badge status terlihat cantik dan profesional
  const renderStatusBadge = (status: string) => {
    if (status === 'RECEIVED_BY_SECURITY') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
          <Clock className="h-3.5 w-3.5" />
          Di Pos Satpam
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Diambil Warga
      </span>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Resi & Kurir</th>
              <th className="px-6 py-4">Penerima</th>
              <th className="px-6 py-4">Blok / No</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageIcon className="h-8 w-8 text-slate-300" />
                    <p>Belum ada data paket saat ini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr 
                  key={pkg.id} 
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {pkg.trackingNumber || 'Tanpa Resi'}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {pkg.courierName}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {pkg.recipientName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      {pkg.unitNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(pkg.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}