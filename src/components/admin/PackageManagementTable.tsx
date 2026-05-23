'use client';

import {
  Pencil,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  Barcode,
  User2,
  Home,
  Truck,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useSession } from 'next-auth/react';
import { PackageDetailModal } from '@/components/modal/PackageDetailModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorState';
import { calculatePenalty, formatRupiah } from '@/utils/penalty';

type PackageItem = {
  id: string;
  trackingNumber: string | null;
  courierName: string;
  recipientName: string;
  unitNumber: string;
  status: 'RECEIVED_BY_SECURITY' | 'DELIVERED_TO_WARGA' | 'EXPIRED' | string;
  receivedAt: Date | string;
  pickedUpAt?: Date | string | null;
  pickedUpBy?: string | null;
  security: { name: string | null } | null;
  warga?: { name: string | null } | null;
  penaltyAmount?: number;
  penaltyPaid?: boolean;
};

type PackageManagementTableProps = {
  rows: PackageItem[];
  hideActions?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onResetFilter?: () => void;
};

export default function PackageManagementTable({ 
  rows = [], 
  hideActions = false, 
  isLoading = false,
  error = null,
  onRetry,
  onResetFilter
}: PackageManagementTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [editDraft, setEditDraft] = useState<PackageItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PackageItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const renderStatusBadge = (status: string) => {
    if (status === 'RECEIVED_BY_SECURITY') {
      return (
        <Badge variant="primary" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Menunggu
        </Badge>
      );
    }
    if (status === 'DELIVERED_TO_WARGA') {
      return (
        <Badge variant="success" className="gap-1.5 shadow-sm border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Diambil
        </Badge>
      );
    }
    return (
      <Badge variant="danger" className="gap-1.5">
        <X className="h-3.5 w-3.5" />
        Expired
      </Badge>
    );
  };

  async function submitEdit() {
    if (!editDraft) return;
    setSaving(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editDraft.id,
          courierName: editDraft.courierName,
          trackingNumber: editDraft.trackingNumber,
          recipientName: editDraft.recipientName,
          unitNumber: editDraft.unitNumber,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatusMessage('Data paket berhasil diperbarui.');
        router.refresh();
        setEditDraft(null);
      } else {
        setStatusMessage(result.error || 'Gagal memperbarui data.');
      }
    } catch {
      setStatusMessage('Kesalahan koneksi.');
    } finally {
      setSaving(false);
    }
  }

  async function submitDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setStatusMessage('');

    try {
      const response = await fetch(`/api/packages?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setStatusMessage('Log paket berhasil dihapus.');
        router.refresh();
        setDeleteTarget(null);
      } else {
        setStatusMessage(result.error || 'Gagal menghapus data.');
      }
    } catch {
      setStatusMessage('Kesalahan koneksi.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onRetry={onRetry} />}
      
      <div className="table-container shadow-soft border-border-light bg-white">
        <table className="min-w-[1200px] w-full text-left">
          <thead className="table-head">
            <tr className="border-b border-border-light">
              <th className="px-6 py-4 font-semibold text-center w-16 text-text-muted text-[10px] uppercase tracking-widest">No</th>
              <th className="px-6 py-4 font-semibold text-text-muted text-[10px] uppercase tracking-widest">Nomor Resi</th>
              <th className="px-6 py-4 font-semibold text-text-muted text-[10px] uppercase tracking-widest">Kurir</th>
              <th className="px-6 py-4 font-semibold text-center text-text-muted text-[10px] uppercase tracking-widest">Rumah Tujuan</th>
              <th className="px-6 py-4 font-semibold text-center text-text-muted text-[10px] uppercase tracking-widest">Tanggal Masuk</th>
              <th className="px-6 py-4 font-semibold text-center text-text-muted text-[10px] uppercase tracking-widest">Tanggal Diambil</th>
              <th className="px-6 py-4 font-semibold text-center text-text-muted text-[10px] uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 font-semibold text-center text-text-muted text-[10px] uppercase tracking-widest">Denda</th>
              <th className="px-6 py-4 font-semibold text-center text-text-muted text-[10px] uppercase tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-0">
                  <TableSkeleton rows={5} />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-0">
                  <EmptyState onReset={onResetFilter} />
                </td>
              </tr>
            ) : (
              rows.map((pkg, index) => {
                const penalty = calculatePenalty(pkg.receivedAt);
                const isPickedUp = pkg.status === 'DELIVERED_TO_WARGA';

                return (
                  <tr key={pkg.id} className="border-b border-border-light text-text-body last:border-b-0 transition-colors hover:bg-bg-header/50">
                    <td className="px-6 py-4 text-center font-medium text-text-muted text-sm">
                      {index + 1}
                    </td>
                    <td className={`px-6 py-4 font-bold tracking-tight text-sm ${isPickedUp ? 'text-text-muted/50' : 'text-text-main'}`}>
                      {pkg.trackingNumber || 'Tanpa Resi'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-primary/60" />
                        <span className="font-medium text-sm">{pkg.courierName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-body text-center text-sm">
                      {pkg.unitNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-medium text-text-body text-sm">
                        {new Date(pkg.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(pkg.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {pkg.pickedUpAt ? (
                        <>
                          <p className="font-medium text-text-body text-sm">
                            {new Date(pkg.pickedUpAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {new Date(pkg.pickedUpAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(pkg.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isPickedUp ? (
                        pkg.penaltyAmount ? (
                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Lunas</span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )
                      ) : penalty.amount > 0 ? (
                        <span className="font-black text-danger text-sm">{formatRupiah(penalty.amount)}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPackage(pkg)}
                          className="text-primary font-bold text-xs hover:underline flex items-center gap-1 group"
                        >
                          Detail <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        {!hideActions && (
                          <div className="flex items-center gap-1 border-l border-border-light pl-2 ml-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditDraft(pkg)}
                              className="size-8 text-text-muted hover:text-primary hover:bg-bg-header"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(pkg)}
                              className="size-8 text-text-muted hover:text-danger hover:bg-danger-light"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

      {editDraft && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-xl overflow-hidden shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-2xl font-bold text-text-main">Edit Detail Paket</h2>
              <button onClick={() => setEditDraft(null)} className="rounded p-1 hover:bg-bg-header">
                <X size={20} className="text-text-muted" />
              </button>
            </CardHeader>

            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Kurir"
                  icon={<Truck size={18} />}
                  value={editDraft.courierName}
                  onChange={(e) => setEditDraft({ ...editDraft, courierName: e.target.value })}
                />
                <Input
                  label="Nomor Resi"
                  icon={<Barcode size={18} />}
                  value={editDraft.trackingNumber || ''}
                  onChange={(e) => setEditDraft({ ...editDraft, trackingNumber: e.target.value })}
                />
              </div>

              <Input
                label="Nama Penerima"
                icon={<User2 size={18} />}
                value={editDraft.recipientName}
                onChange={(e) => setEditDraft({ ...editDraft, recipientName: e.target.value })}
              />

              <Input
                label="Unit Rumah"
                icon={<Home size={18} />}
                value={editDraft.unitNumber}
                onChange={(e) => setEditDraft({ ...editDraft, unitNumber: e.target.value })}
              />

              {statusMessage && (
                <p className="text-sm font-medium text-primary italic">{statusMessage}</p>
              )}
            </div>

            <CardFooter className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditDraft(null)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={submitEdit}
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-md p-6 border-danger-border shadow-card">
            <h2 className="text-xl font-bold text-text-main">Hapus Log Paket?</h2>
            <p className="mt-3 text-text-muted">
              Anda akan menghapus data paket dengan resi <span className="font-bold text-text-main">{deleteTarget.trackingNumber || deleteTarget.id}</span>. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={submitDelete}
              >
                Ya, Hapus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
