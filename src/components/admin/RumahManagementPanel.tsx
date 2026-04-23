'use client';

import { useEffect, useMemo, useState } from 'react';
import { Home, Pencil, Search, Trash2, UserRoundSearch, Users, X } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';

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
    <section className="mt-4 rounded-2xl border border-border-light bg-bg-header p-4 md:p-6 shadow-soft">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-text-main md:text-[2.25rem]">Manajemen Hunian</h1>
          <p className="mt-1 text-[0.95rem] text-text-muted md:text-[1.05rem]">
            Konfigurasi hunian perumahan/apartemen dan pemetaan penghuni.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          + Tambah Hunian
        </Button>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4 border-primary-light bg-primary-light/20">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-dark">Total Hunian</p>
          <p className="mt-2 text-2xl font-bold text-text-main">{statistik.totalUnit}</p>
        </Card>
        <Card className="p-4 border-secondary-light bg-secondary-light/20">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-dark">Penghuni Terhubung</p>
          <p className="mt-2 text-2xl font-bold text-text-main">{statistik.totalPenghuni}</p>
        </Card>
        <Card className="p-4 border-danger-border bg-danger-light/20">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-danger">Unit Belum Terisi</p>
          <p className="mt-2 text-2xl font-bold text-text-main">{statistik.unitKosong}</p>
        </Card>
      </div>

      <div className="mt-4 max-w-sm">
        <Input
          label="Cari Hunian"
          id="cari-unit"
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Cari blok atau nomor unit"
        />
      </div>

      <div className="table-container">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="table-head">
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
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-text-main">Memuat data rumah...</p>
                  <p className="mt-1 text-sm text-text-muted">Mohon tunggu, data sedang dimuat.</p>
                </td>
              </tr>
            ) : filteredRumah.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-text-main">Tidak ada data hunian sesuai pencarian.</p>
                  <p className="mt-1 text-sm text-text-muted">Silakan tambah hunian baru atau ubah kata kunci pencarian.</p>
                </td>
              </tr>
            ) : (
              filteredRumah.map((item) => (
                <tr key={item.id} className="border-b border-border-light text-text-body last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-text-main">{item.blok}</td>
                  <td className="px-4 py-3 text-text-body">{item.nomor}</td>
                  <td className="px-4 py-3 text-text-body">
                    {item.penghuni.length === 0 ? (
                      '-'
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                          {item.penghuni.length} Penghuni
                        </p>
                        <p>{item.penghuni.map((p) => p.name ?? p.email ?? p.id).join(', ')}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatTanggal(item.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2 text-text-muted">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(item)}
                        aria-label="Edit unit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-full border border-danger-border bg-danger-light p-2 text-danger hover:bg-opacity-80"
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
        <p className="mt-3 text-xs text-secondary-dark">
          API list user belum tersedia penuh. Pemetaan warga di modal menggunakan data yang tersedia.
        </p>
      ) : null}

      <p className="mt-3 min-h-5 text-sm text-text-muted">{status}</p>

      {rumahModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-xl p-0 overflow-hidden shadow-card">
            <div className="flex items-center justify-between border-b border-border-light px-6 py-5">
              <div>
                <h2 className="text-[2rem] font-bold leading-none text-text-main">Detail Hunian</h2>
                <p className="mt-1 text-sm text-text-muted">Konfigurasi hunian perumahan/apartemen dan pemetaan penghuni.</p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setRumahModalOpen(false)}
                className="rounded p-1 text-text-muted hover:bg-bg-header"
                aria-label="Tutup modal detail unit"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Blok / Tower"
                  icon={<Home size={16} />}
                  value={rumahDraft.blok}
                  onChange={(event) => setRumahDraft((prev) => ({ ...prev, blok: event.target.value }))}
                  placeholder="Contoh: Blok A / Tower A"
                />
                <Input
                  label="Nomor Rumah / Unit"
                  icon={<Home size={16} />}
                  value={rumahDraft.nomor}
                  onChange={(event) => setRumahDraft((prev) => ({ ...prev, nomor: event.target.value }))}
                  placeholder="Contoh: 12 / A-12"
                />
              </div>

              <div className="mt-4">
                <div className="mb-3 rounded-xl border border-border-light bg-bg-header px-3 py-2 text-sm text-text-muted">
                  Kode Unit: <span className="font-semibold text-text-main">{rumahDraft.blok || '-'}-{rumahDraft.nomor || '-'}</span>
                </div>

                <Select
                  label="Pemetaan Warga"
                  icon={<UserRoundSearch size={16} />}
                  value={rumahDraft.userId}
                  onChange={(event) => setRumahDraft((prev) => ({ ...prev, userId: event.target.value }))}
                  options={[
                    { value: '', label: 'Tanpa penghuni / batalkan pemetaan' },
                    ...availableWarga.map((item) => ({
                      value: item.id,
                      label: `${item.name ?? '-'} (${item.email ?? '-'})`,
                    })),
                  ]}
                />
                <p className="mt-1 text-xs text-text-muted">Pilih dari daftar warga yang sudah terdaftar di sistem.</p>

                {rumahDraft.penghuniAktif.length > 0 ? (
                  <div className="mt-3 rounded-xl border border-border-light bg-bg-muted p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Penghuni Saat Ini</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rumahDraft.penghuniAktif.map((item) => (
                        <Badge key={item.id} variant="primary" className="gap-1">
                          <Users size={12} />
                          {item.name ?? item.email ?? item.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border-light px-6 py-4">
              <Button
                variant="outline"
                onClick={() => !saving && setRumahModalOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={saveRumah}
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>

            <div className="border-t border-border-light bg-bg-muted px-6 py-4">
              <p className="text-xs text-text-muted text-center italic">
                Menghubungkan warga ke unit akan memberikan akses notifikasi paket dan akses area digital gedung.
              </p>
            </div>
          </Card>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-md p-5 border-danger-border shadow-card">
            <h2 className="text-xl font-bold text-text-main">Konfirmasi Hapus Unit</h2>
            <p className="mt-3 text-sm text-text-muted">
              Anda akan menghapus unit <span className="font-semibold">{deleteTarget.blok}-{deleteTarget.nomor}</span>.
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
                onClick={confirmDeleteRumah}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
