'use client';

import { Mail, Pencil, ShieldCheck, Trash2, User2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type WargaItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'WARGA' | 'SECURITY' | string;
  rumah: { blok: string; nomor: string } | null;
};

type WargaManagementTableProps = {
  rows: WargaItem[];
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

function initials(name: string | null, email: string | null) {
  const seed = (name || email || 'U').trim();
  const parts = seed.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export default function WargaManagementTable({ rows, activeRole, activeSort }: WargaManagementTableProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WargaItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tableRows, setTableRows] = useState<WargaItem[]>(rows);

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

  function openEdit(user: WargaItem) {
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
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#cfdceb] bg-white shadow-[0_8px_24px_rgba(37,76,130,0.08)]">
        <table className="min-w-[980px] w-full text-left">
          <thead className="sticky top-0 z-[1] bg-[#e8f0f9] text-xs uppercase tracking-[0.12em] text-[#6e849f]">
            <tr className="border-b border-[#d6e1ef]">
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
                  <p className="text-lg font-semibold text-[#2b3f59]">Belum ada akun warga.</p>
                  <p className="mt-1 text-sm text-[#6d829d]">Tambahkan pengguna baru untuk memulai manajemen akun.</p>
                </td>
              </tr>
            ) : (
              tableRows.map((warga) => (
                <tr key={warga.id} className="border-b border-[#d6e1ef] text-[#2f3f56] last:border-b-0">
                  <td className="px-6 py-3.5 md:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-[#cad9eb] text-sm font-bold text-[#2c4f7a]">
                        {initials(warga.name, warga.email)}
                      </div>
                      <div>
                        <p className="text-[1.03rem] font-semibold leading-tight text-[#1f324b] md:text-[1.2rem]">{warga.name || '-'}</p>
                        <p className="text-[0.86rem] text-[#7086a0] md:text-[0.95rem]">{warga.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[1.1rem] font-medium leading-tight text-[#2a3e57] md:py-4 md:text-[1.3rem]">
                    {warga.rumah ? `${warga.rumah.blok} - ${warga.rumah.nomor}` : '-'}
                  </td>
                  <td className="px-6 py-3.5 text-[1.1rem] text-[#4f6683] md:py-4 md:text-[1.3rem]">-</td>
                  <td className="px-6 py-3.5 md:py-4">
                    {warga.role === 'SECURITY' ? (
                      <span className="inline-flex rounded-full bg-[#ead8bf] px-3 py-1 text-sm font-bold uppercase tracking-[0.08em] text-[#8f5e12]">
                        SATPAM
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-[#c6dbef] px-3 py-1 text-sm font-bold uppercase tracking-[0.08em] text-[#2c5fa6]">
                        WARGA
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 md:py-4">
                    <span className="inline-flex items-center gap-2 text-[1rem] font-medium text-[#324861] md:text-[1.15rem]">
                      <span className="size-2.5 rounded-full bg-[#4caf78]" />
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-3.5 md:py-4">
                    <div className="flex items-center justify-end gap-2 text-[#778ca7]">
                      <button
                        type="button"
                        onClick={() => openEdit(warga)}
                        className="rounded-full border border-[#d7e3f2] bg-[#eef4fb] p-2 hover:bg-[#e2edf9]"
                        aria-label="Edit pengguna"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(warga)}
                        className="rounded-full border border-[#ecd5d8] bg-[#f8edef] p-2 text-[#b5525a] hover:bg-[#f3e2e5]"
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

      <p className="mt-3 min-h-5 text-sm text-[#5e7591]">{statusMessage}</p>

      {editDraft ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#12233a]/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#cfdceb] bg-white shadow-[0_24px_60px_rgba(16,43,79,0.26)]">
            <div className="flex items-center justify-between border-b border-[#e5edf7] px-6 py-5">
              <h2 className="text-[1.9rem] font-bold leading-none text-[#1f324b]">Edit Pengguna</h2>
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                className="rounded p-1 text-[#7086a0] hover:bg-[#e8f0f9]"
                aria-label="Tutup modal edit"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 px-6 py-5">
              <div>
                <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Nama Lengkap</p>
                <div className="relative">
                  <User2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
                  <input
                    value={editDraft.name}
                    onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                    placeholder="Masukkan nama lengkap..."
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Alamat Email</p>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
                  <input
                    value={editDraft.email}
                    onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
                    placeholder="contoh@email.com"
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Peran (Role)</p>
                  <div className="relative">
                    <ShieldCheck size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
                    <select
                      value={editDraft.role}
                      onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, role: event.target.value } : prev))}
                      className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
                    >
                      <option value="WARGA">WARGA</option>
                      <option value="SECURITY">SATPAM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Status Akun</p>
                  <input
                    value="Aktif"
                    disabled
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-3 py-2.5 text-sm text-[#5f728a]"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Nomor Unit (Opsional)</p>
                <input
                  value={editDraft.unitNumber}
                  onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, unitNumber: event.target.value } : prev))}
                  placeholder="Contoh: A-12"
                  className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e5edf7] px-6 py-4">
              <button
                type="button"
                onClick={() => !saving && setEditDraft(null)}
                className="rounded-full border border-[#d6e1ef] px-4 py-2 text-sm font-semibold text-[#5f728a]"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitEditPreview}
                disabled={saving}
                className="rounded-full bg-[#3f6fd5] px-4 py-2 text-sm font-semibold text-white"
              >
                {saving ? 'Menyimpan...' : 'Simpan Data User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#12233a]/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-[#decfd2] bg-white p-5">
            <h2 className="text-xl font-bold text-[#1f324b]">Konfirmasi Hapus</h2>
            <p className="mt-3 text-sm text-[#5f728a]">
              Anda akan menghapus <span className="font-semibold">{deleteTarget.name ?? deleteTarget.email ?? deleteTarget.id}</span>.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !deleting && setDeleteTarget(null)}
                className="rounded-full border border-[#d6e1ef] px-4 py-2 text-sm font-semibold text-[#5f728a]"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitDeletePreview}
                disabled={deleting}
                className="rounded-full bg-[#c4525a] px-4 py-2 text-sm font-semibold text-white"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
