'use client';

import { Mail, Pencil, ShieldCheck, Trash2, User2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'WARGA' | 'SECURITY' | string;
  unitNumber?: string | null;
  rumah: { blok: string; nomor: string } | null;
};

type UserManagementTableProps = {
  rows: UserItem[];
  activeRole: 'SEMUA' | 'WARGA' | 'SATPAM';
  activeSort: 'terbaru' | 'lama';
};

type EditDraft = {
  id: string;
  name: string;
  email: string;
  role: string;
  unitNumber: string;
};

export default function UserManagementTable({ rows, activeRole, activeSort }: UserManagementTableProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tableRows, setTableRows] = useState<UserItem[]>(rows);

  const loadUsersFromApi = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeRole !== 'SEMUA') {
      params.set('role', activeRole);
    }
    params.set('sort', activeSort);

    try {
      const response = await fetch(`/api/users?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success && Array.isArray(payload?.data)) {
        setTableRows(payload.data);
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }, [activeRole, activeSort]);

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  useEffect(() => {
    loadUsersFromApi();
  }, [loadUsersFromApi]);

  const emptyState = useMemo(() => tableRows.length === 0, [tableRows.length]);

  function openEdit(user: UserItem) {
    setStatusMessage('');
    setEditDraft({
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role,
      unitNumber: user.rumah ? `${user.rumah.blok}-${user.rumah.nomor}` : '',
    });
  }

  function resolveErrorMessage(payload: unknown, fallback: string) {
    if (!payload || typeof payload !== 'object') return fallback;

    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim()) return error;

    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;

    return fallback;
  }

  async function submitEditPreview() {
    if (!editDraft) return;
    if (!editDraft.name.trim() || !editDraft.email.trim()) {
      setStatusMessage('Nama dan email wajib diisi sebelum simpan perubahan.');
      return;
    }

    setSaving(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: editDraft.id,
          name: editDraft.name.trim(),
          email: editDraft.email.trim(),
          role: editDraft.role,
          unitNumber: editDraft.unitNumber.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success !== false) {
        setStatusMessage('Data pengguna berhasil diperbarui.');
        await loadUsersFromApi();
        router.refresh();
      } else {
        setStatusMessage(resolveErrorMessage(payload, 'Gagal memperbarui data pengguna.'));
      }
    } catch {
      setStatusMessage('Gagal memperbarui data pengguna. Periksa koneksi atau endpoint API.');
    }

    setEditDraft(null);
    setSaving(false);
  }

  async function submitDeletePreview() {
    if (!deleteTarget) return;

    setDeleting(true);
    setStatusMessage('');

    try {
      let response = await fetch(`/api/users?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!response.ok) {
        response = await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: deleteTarget.id }),
        });
      }

      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success !== false) {
        setStatusMessage('Pengguna berhasil dihapus.');
        await loadUsersFromApi();
        router.refresh();
      } else {
        setStatusMessage(resolveErrorMessage(payload, 'Gagal menghapus pengguna.'));
      }
    } catch {
      setStatusMessage('Gagal menghapus pengguna. Periksa koneksi atau endpoint API.');
    }

    setDeleteTarget(null);
    setDeleting(false);
  }

  return (
    <>
      <div className="table-container">
        <table className="min-w-[980px] w-full text-left">
          <thead className="table-head">
            <tr className="border-b border-border-light">
              <th scope="col" className="px-6 py-4 font-semibold">Nama Pengguna</th>
              <th scope="col" className="px-6 py-4 font-semibold">Unit / Rumah</th>
              <th scope="col" className="px-6 py-4 font-semibold">No. Whatsapp</th>
              <th scope="col" className="px-6 py-4 font-semibold">Peran</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status Akun</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {emptyState ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-text-main">Belum ada akun warga.</p>
                  <p className="mt-1 text-sm text-text-muted">Tambahkan pengguna baru untuk memulai manajemen akun.</p>
                </td>
              </tr>
            ) : (
              tableRows.map((warga) => (
                <tr key={warga.id} className="border-b border-border-light text-text-body last:border-b-0">
                  <td className="px-6 py-3.5 md:py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={warga.name} email={warga.email} />
                      <div>
                        <p className="text-[1.03rem] font-semibold leading-tight text-text-main md:text-[1.2rem]">{warga.name || '-'}</p>
                        <p className="text-[0.86rem] text-text-muted md:text-[0.95rem]">{warga.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[1.1rem] font-medium leading-tight text-text-body md:py-4 md:text-[1.3rem]">
                    {warga.rumah ? `${warga.rumah.blok} - ${warga.rumah.nomor}` : warga.unitNumber || '-'}
                  </td>
                  <td className="px-6 py-3.5 text-[1.1rem] text-text-muted md:py-4 md:text-[1.3rem]">-</td>
                  <td className="px-6 py-3.5 md:py-4">
                    {warga.role === 'SECURITY' ? (
                      <Badge variant="secondary">SATPAM</Badge>
                    ) : (
                      <Badge variant="primary">WARGA</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5 md:py-4">
                    <span className="inline-flex items-center gap-2 text-[1rem] font-medium text-text-body md:text-[1.15rem]">
                      <span className="size-2.5 rounded-full bg-success" />
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-3.5 md:py-4">
                    <div className="flex items-center justify-end gap-2 text-text-muted">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(warga)}
                        aria-label="Edit pengguna"
                      >
                        <Pencil size={16} />
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(warga)}
                        className="rounded-full border border-danger-border bg-danger-light p-2 text-danger hover:bg-opacity-80"
                        aria-label="Hapus pengguna"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 min-h-5 text-sm text-text-muted">{statusMessage}</p>

      {editDraft ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-xl overflow-hidden shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-[1.9rem] font-bold leading-none text-text-main">Edit Pengguna</h2>
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                className="rounded p-1 text-text-muted hover:bg-bg-header"
                aria-label="Tutup modal edit"
              >
                <X size={18} />
              </button>
            </CardHeader>

            <div className="grid gap-3 px-6 py-5">
              <Input
                label="Nama Lengkap"
                icon={<User2 size={16} />}
                value={editDraft.name}
                onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                placeholder="Masukkan nama lengkap..."
              />

              <Input
                label="Alamat Email"
                icon={<Mail size={16} />}
                value={editDraft.email}
                onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
                placeholder="contoh@email.com"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Peran (Role)"
                  icon={<ShieldCheck size={16} />}
                  value={editDraft.role}
                  onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, role: event.target.value } : prev))}
                  options={[
                    { value: 'WARGA', label: 'WARGA' },
                    { value: 'SECURITY', label: 'SATPAM' },
                  ]}
                />
                <Input
                  label="Status Akun"
                  value="Aktif"
                  disabled
                  className="text-text-muted"
                />
              </div>

              <Input
                label="Nomor Unit (Opsional)"
                value={editDraft.unitNumber}
                onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, unitNumber: event.target.value } : prev))}
                placeholder="Contoh: A-12"
              />
            </div>

            <CardFooter className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => !saving && setEditDraft(null)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={submitEditPreview}
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Data User'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-md p-5 border-danger-border">
            <h2 className="text-xl font-bold text-text-main">Konfirmasi Hapus</h2>
            <p className="mt-3 text-sm text-text-muted">
              Anda akan menghapus <span className="font-semibold">{deleteTarget.name ?? deleteTarget.email ?? deleteTarget.id}</span>.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => !deleting && setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={submitDeletePreview}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
