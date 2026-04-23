'use client';

import {
  Package,
  Pencil,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  Barcode,
  User2,
  Home,
  Truck
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

type PackageItem = {
  id: string;
  trackingNumber: string | null;
  courierName: string;
  recipientName: string;
  unitNumber: string;
  status: 'RECEIVED_BY_SECURITY' | 'DELIVERED_TO_WARGA' | string;
  receivedAt: Date | string;
  pickedUpAt?: Date | string | null;
  security: { name: string | null } | null;
  warga?: { name: string | null } | null;
};

type PackageManagementTableProps = {
  rows: PackageItem[];
  hideActions?: boolean;
};

export default function PackageManagementTable({ rows, hideActions = false }: PackageManagementTableProps) {
  const router = useRouter();
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
          Di Pos Satpam
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Sudah Diambil
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
    <>
      <div className="table-container">
        <table className="min-w-[1000px] w-full text-left">
          <thead className="table-head">
            <tr className="border-b border-border-light">
              <th className="px-6 py-4 font-semibold text-center">No</th>
              <th className="px-6 py-4 font-semibold text-center">Nomor Resi</th>
              <th className="px-6 py-4 font-semibold text-center">Kurir</th>
              <th className="px-6 py-4 font-semibold text-center">Blok & Unit</th>
              <th className="px-6 py-4 font-semibold text-center">Tanggal Masuk</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              {!hideActions && <th className="px-6 py-4 font-semibold text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={hideActions ? 6 : 7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-bg-header text-primary-light">
                      <Package className="h-10 w-10" />
                    </div>
                    <p className="text-xl font-bold text-text-main">Log Paket Kosong</p>
                    <p className="mt-1 text-text-muted">Belum ada data paket yang tercatat di sistem saat ini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((pkg, index) => {
                const diffTime = Math.abs(new Date().getTime() - new Date(pkg.receivedAt).getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays > 7 && pkg.status === 'RECEIVED_BY_SECURITY';

                return (
                  <tr key={pkg.id} className="border-b border-border-light text-text-body last:border-b-0 transition-colors hover:bg-bg-header/50">
                    <td className="px-6 py-4 text-center font-medium text-text-muted">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-text-main">
                      <p className='text-center'>{pkg.trackingNumber || 'Tanpa Resi'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-center">
                        <Truck size={14} className="text-primary" />
                        <span className="font-medium">{pkg.courierName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-body text-center">
                      {pkg.unitNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-body text-center">
                        {new Date(pkg.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {isOverdue && (
                        <p className="text-[10px] font-black uppercase tracking-wider text-danger text-center">
                          Overdue ({diffDays} Days)
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(pkg.status)}
                    </td>
                    {!hideActions && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 text-text-muted">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditDraft(pkg)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(pkg)}
                            className="rounded-full border border-danger-border bg-danger-light p-2 text-danger hover:bg-opacity-80"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
    </>
  );
}
