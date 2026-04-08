'use client';

import { useEffect, useMemo, useState } from 'react';
import { Home, Pencil, Search, Trash2, UserRoundSearch, Users, X } from 'lucide-react';
import { useCallback } from 'react';

type Penghuni = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type Rumah = {
  id: string;
  blok: string;
  nomor: string;
  penghuni: Penghuni[];
  createdAt?: string;
};

type UserWarga = {
  id: string;
  name: string | null;
  email: string | null;
  rumahId?: string | null;
};

type RumahDraft = {
  id: string | null;
  blok: string;
  nomor: string;
  userId: string;
  penghuniAktif: Penghuni[];
};

function emptyDraft(): RumahDraft {
  return { id: null, blok: '', nomor: '', userId: '', penghuniAktif: [] };
}

function formatTanggal(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function RumahManagementPanel() {
  const [rumah, setRumah] = useState<Rumah[]>([]);
  const [warga, setWarga] = useState<UserWarga[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersApiReady, setUsersApiReady] = useState(true);

  const [rumahModalOpen, setRumahModalOpen] = useState(false);
  const [rumahDraft, setRumahDraft] = useState<RumahDraft>(emptyDraft());
  const [deleteTarget, setDeleteTarget] = useState<Rumah | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function resolveErrorMessage(payload: unknown, fallback: string) {
    if (!payload || typeof payload !== 'object') return fallback;

    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim()) return error;

    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;

    return fallback;
  }

  const availableWarga = useMemo(
    () => warga.filter((u) => !u.rumahId || u.rumahId === rumahDraft.id),
    [warga, rumahDraft.id],
  );

  const filteredRumah = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return rumah;

    return rumah.filter((item) => `${item.blok} ${item.nomor}`.toLowerCase().includes(keyword));
  }, [rumah, searchTerm]);

  const statistik = useMemo(() => {
    const totalUnit = rumah.length;
    const totalPenghuni = rumah.reduce((acc, item) => acc + item.penghuni.length, 0);
    const unitKosong = rumah.filter((item) => item.penghuni.length === 0).length;

    return { totalUnit, totalPenghuni, unitKosong };
  }, [rumah]);

  const loadRumah = useCallback(async () => {
    const response = await fetch('/api/rumah', { cache: 'no-store' });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error('Gagal mengambil data rumah');
    }
    setRumah(result.data ?? []);
  }, []);

  const loadWarga = useCallback(async () => {
    try {
      const response = await fetch('/api/users?role=WARGA', { cache: 'no-store' });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success || !Array.isArray(result?.data)) {
        setUsersApiReady(false);
        setWarga([]);
        return;
      }

      setUsersApiReady(true);
      setWarga(result.data);
    } catch {
      setUsersApiReady(false);
      setWarga([]);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadRumah(), loadWarga()]);
    } catch {
      setStatus('Gagal memuat data rumah.');
    } finally {
      setLoading(false);
    }
  }, [loadRumah, loadWarga]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  function openCreateModal() {
    setStatus('');
    setRumahDraft(emptyDraft());
    setRumahModalOpen(true);
  }

  function openEditModal(item: Rumah) {
    setStatus('');
    setRumahDraft({
      id: item.id,
      blok: item.blok,
      nomor: item.nomor,
      userId: item.penghuni[0]?.id ?? '',
      penghuniAktif: item.penghuni,
    });
    setRumahModalOpen(true);
  }

  async function saveRumah() {
    if (!rumahDraft.blok.trim() || !rumahDraft.nomor.trim()) {
      setStatus('Blok dan nomor unit wajib diisi.');
      return;
    }

    setSaving(true);
    setStatus('');

    try {
      const payload = { blok: rumahDraft.blok.trim(), nomor: rumahDraft.nomor.trim() };
      const response = await fetch('/api/rumah', {
        method: rumahDraft.id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(rumahDraft.id ? { id: rumahDraft.id, ...payload } : payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        setStatus(resolveErrorMessage(result, 'Simpan data rumah belum berhasil.'));
        setSaving(false);
        return;
      }

      const rumahId = result?.data?.id ?? rumahDraft.id;

      if (rumahId && rumahDraft.id && rumahDraft.penghuniAktif.length > 0) {
        const unmapPromises = rumahDraft.penghuniAktif
          .filter((item) => item.id !== rumahDraft.userId)
          .map((item) =>
            fetch('/api/users/link-rumah', {
              method: 'PUT',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ userId: item.id, rumahId: null }),
            }),
          );

        if (unmapPromises.length > 0) {
          const unmapResults = await Promise.all(unmapPromises);
          const hasFailedUnmap = unmapResults.some((response) => !response.ok);
          if (hasFailedUnmap) {
            setStatus('Data rumah tersimpan, tetapi pembaruan pemetaan penghuni lama belum berhasil.');
            setRumahModalOpen(false);
            await refreshData();
            setSaving(false);
            return;
          }
        }
      }

      if (rumahId && rumahDraft.userId) {
        const linkResponse = await fetch('/api/users/link-rumah', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ userId: rumahDraft.userId, rumahId }),
        });
        const linkResult = await linkResponse.json().catch(() => null);
        if (!linkResponse.ok || linkResult?.success === false) {
          setStatus(resolveErrorMessage(linkResult, 'Data rumah tersimpan, tapi pemetaan warga belum berhasil.'));
          setRumahModalOpen(false);
          await refreshData();
          setSaving(false);
          return;
        }
      }

      setStatus(rumahDraft.id ? 'Perubahan rumah berhasil disimpan.' : 'Rumah baru berhasil ditambahkan.');
      setRumahModalOpen(false);
      await refreshData();
    } catch {
      setStatus('Simpan data rumah belum berhasil. Periksa koneksi atau endpoint API.');
    }

    setSaving(false);
  }

  async function confirmDeleteRumah() {
    if (!deleteTarget) return;

    setDeleting(true);
    setStatus('');
    try {
      const response = await fetch(`/api/rumah?id=${deleteTarget.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        setStatus(resolveErrorMessage(result, 'Hapus rumah belum berhasil.'));
        setDeleting(false);
        return;
      }

      setDeleteTarget(null);
      setStatus('Data rumah berhasil dihapus.');
      await refreshData();
    } catch {
      setStatus('Hapus rumah belum berhasil. Periksa koneksi atau endpoint API.');
    }
    setDeleting(false);
  }

  return (
    <section className="mt-4 rounded-2xl border border-blue-100 bg-[#eaf1f9] p-4 md:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-[#16293f] md:text-[2.25rem]">Manajemen Hunian</h1>
          <p className="mt-1 text-[0.95rem] text-[#637995] md:text-[1.05rem]">
            Konfigurasi hunian perumahan/apartemen dan pemetaan penghuni.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-full bg-[#3f6fd5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#325fc0]"
        >
          + Tambah Hunian
        </button>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#c8d8ea] bg-[#d8e4f2] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#2f5e9f]">Total Hunian</p>
          <p className="mt-2 text-2xl font-bold text-[#1f324b]">{statistik.totalUnit}</p>
        </article>
        <article className="rounded-2xl border border-[#d8d0c0] bg-[#e9e1d4] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8f5e12]">Penghuni Terhubung</p>
          <p className="mt-2 text-2xl font-bold text-[#1f324b]">{statistik.totalPenghuni}</p>
        </article>
        <article className="rounded-2xl border border-[#decfd2] bg-[#efe2e4] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#a23b33]">Unit Belum Terisi</p>
          <p className="mt-2 text-2xl font-bold text-[#1f324b]">{statistik.unitKosong}</p>
        </article>
      </div>

      <div className="mt-4 max-w-sm">
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-[#6f84a0]" htmlFor="cari-unit">
          Cari Hunian
        </label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
          <input
            id="cari-unit"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari blok atau nomor unit"
            className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#cfdceb] bg-white shadow-[0_8px_24px_rgba(37,76,130,0.08)]">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-[#edf3fa] text-xs uppercase tracking-[0.08em] text-[#6e849f]">
            <tr>
              <th className="px-4 py-3">Blok</th>
              <th className="px-4 py-3">Nomor Rumah / Unit</th>
              <th className="px-4 py-3">Penghuni</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#637995]">
                  Memuat data rumah...
                </td>
              </tr>
            ) : filteredRumah.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#637995]">
                  Tidak ada data hunian sesuai pencarian.
                </td>
              </tr>
            ) : (
              filteredRumah.map((item) => (
                <tr key={item.id} className="border-t border-[#e2ebf5]">
                  <td className="px-4 py-3 font-semibold text-[#1f324b]">{item.blok}</td>
                  <td className="px-4 py-3 text-[#4f6683]">{item.nomor}</td>
                  <td className="px-4 py-3 text-[#4f6683]">
                    {item.penghuni.length === 0 ? (
                      '-'
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6e849f]">
                          {item.penghuni.length} Penghuni
                        </p>
                        <p>{item.penghuni.map((p) => p.name ?? p.email ?? p.id).join(', ')}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#4f6683]">{formatTanggal(item.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2 text-[#778ca7]">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-full border border-[#d7e3f2] bg-[#eef4fb] p-2 hover:bg-[#e2edf9]"
                        aria-label="Edit unit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-full border border-[#ecd5d8] bg-[#f8edef] p-2 text-[#b5525a] hover:bg-[#f3e2e5]"
                        aria-label="Hapus unit"
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

      {!usersApiReady ? (
        <p className="mt-3 text-xs text-[#8f5e12]">
          API list user belum tersedia penuh. Pemetaan warga di modal menggunakan data yang tersedia.
        </p>
      ) : null}

      <p className="mt-3 min-h-5 text-sm text-[#5e7591]">{status}</p>

      {rumahModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#12233a]/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl rounded-2xl border border-[#cfdceb] bg-white p-0">
            <div className="flex items-center justify-between border-b border-[#e5edf7] px-6 py-5">
              <div>
                <h2 className="text-[2rem] font-bold leading-none text-[#1f324b]">Detail Hunian</h2>
                <p className="mt-1 text-sm text-[#5f728a]">Konfigurasi hunian perumahan/apartemen dan pemetaan penghuni.</p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setRumahModalOpen(false)}
                className="rounded p-1 text-[#7086a0] hover:bg-[#e8f0f9]"
                aria-label="Tutup modal detail unit"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Blok / Tower</p>
                  <div className="relative">
                    <Home size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
                    <input
                      value={rumahDraft.blok}
                      onChange={(event) => setRumahDraft((prev) => ({ ...prev, blok: event.target.value }))}
                      placeholder="Contoh: Blok A / Tower A"
                      className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Nomor Rumah / Unit</p>
                  <div className="relative">
                    <Home size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
                    <input
                      value={rumahDraft.nomor}
                      onChange={(event) => setRumahDraft((prev) => ({ ...prev, nomor: event.target.value }))}
                      placeholder="Contoh: 12 / A-12"
                      className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-3 rounded-xl border border-[#d9e4f1] bg-[#f2f7fd] px-3 py-2 text-sm text-[#5f728a]">
                  Kode Unit: <span className="font-semibold text-[#1f324b]">{rumahDraft.blok || '-'}-{rumahDraft.nomor || '-'}</span>
                </div>

                <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#7c8da3]">Pemetaan Warga</p>
                <div className="relative">
                  <UserRoundSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b88ab]" />
                  <select
                    value={rumahDraft.userId}
                    onChange={(event) => setRumahDraft((prev) => ({ ...prev, userId: event.target.value }))}
                    className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] py-2.5 pl-10 pr-3 text-sm outline-none"
                  >
                    <option value="">Tanpa penghuni / batalkan pemetaan</option>
                    {availableWarga.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name ?? '-'} ({item.email ?? '-'})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-[#7086a0]">Pilih dari daftar warga yang sudah terdaftar di sistem.</p>

                {rumahDraft.penghuniAktif.length > 0 ? (
                  <div className="mt-3 rounded-xl border border-[#d9e4f1] bg-[#f8fbff] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6f84a0]">Penghuni Saat Ini</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rumahDraft.penghuniAktif.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 rounded-full bg-[#e6effa] px-3 py-1 text-xs font-semibold text-[#2f5e9f]"
                        >
                          <Users size={12} />
                          {item.name ?? item.email ?? item.id}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e5edf7] px-6 py-4">
              <button
                type="button"
                onClick={() => !saving && setRumahModalOpen(false)}
                className="rounded-full border border-[#d6e1ef] px-4 py-2 text-sm font-semibold text-[#5f728a]"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveRumah}
                className="rounded-full bg-[#3f6fd5] px-5 py-2 text-sm font-semibold text-white"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>

            <div className="border-t border-[#e5edf7] bg-[#f8fbff] px-6 py-4">
              <p className="text-xs text-[#5f728a]">
                Menghubungkan warga ke unit akan memberikan akses notifikasi paket dan akses area digital gedung.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#12233a]/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-[#decfd2] bg-white p-5">
            <h2 className="text-xl font-bold text-[#1f324b]">Konfirmasi Hapus Unit</h2>
            <p className="mt-3 text-sm text-[#5f728a]">
              Anda akan menghapus unit <span className="font-semibold">{deleteTarget.blok}-{deleteTarget.nomor}</span>.
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
                onClick={confirmDeleteRumah}
                className="rounded-full bg-[#c4525a] px-4 py-2 text-sm font-semibold text-white"
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
