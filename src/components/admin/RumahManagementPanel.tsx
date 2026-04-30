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
    <div className="flex flex-col gap-8 pb-8">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 shadow-2xl sm:px-10 sm:py-12 mt-4 md:mt-0">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Manajemen Hunian
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-100/90 md:text-base">
              Konfigurasi hunian unit perumahan, pemetaan blok, dan pengaturan asosiasi penghuni digital ke dalam sistem.
            </p>
          </div>
          
          <Button onClick={openCreateModal} className="shrink-0 bg-secondary hover:bg-secondary/90 text-secondary-dark font-bold border-0 shadow-lg px-6 py-3 rounded-xl transition-all hover:scale-105 w-full sm:w-auto">
            + Tambah Hunian Baru
          </Button>
        </div>
      </div>

      <div className="px-1">
        <div className="grid gap-5 sm:grid-cols-3 mb-6">
          <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Hunian</p>
              <p className="mt-2 text-4xl font-black text-text-main">{statistik.totalUnit}</p>
            </div>
          </Card>
          <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-secondary/10 transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Penghuni Terhubung</p>
              <p className="mt-2 text-4xl font-black text-text-main">{statistik.totalPenghuni}</p>
            </div>
          </Card>
          <Card className="relative overflow-hidden p-6 border-0 shadow-md bg-bg-card group hover:-translate-y-1 hover:shadow-lg transition-all rounded-2xl">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-danger/5 transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Unit Belum Terisi</p>
              <p className="mt-2 text-4xl font-black text-danger">{statistik.unitKosong}</p>
            </div>
          </Card>
        </div>

        <div className="mb-6 max-w-sm rounded-xl bg-bg-card shadow-sm border border-border-light p-3">
        <Input
          label="Cari Hunian"
          id="cari-unit"
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Cari blok atau nomor unit"
        />
      </div>

        <div className="rounded-2xl bg-bg-card shadow-md border border-border-light overflow-hidden mt-6">
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
                            className="rounded-full border border-danger-border bg-danger-light p-2 text-danger hover:bg-opacity-80 transition-all"
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
        </div>

      {!usersApiReady ? (
        <p className="mt-3 text-xs text-secondary-dark">
          API list user belum tersedia penuh. Pemetaan warga di modal menggunakan data yang tersedia.
        </p>
      ) : null}

      <p className="mt-3 min-h-5 text-sm text-text-muted">{status}</p>

      {rumahModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl overflow-hidden shadow-2xl rounded-3xl border-0 bg-bg-card flex flex-col max-h-[90vh]">
            <div className="relative overflow-hidden bg-primary px-6 py-8 sm:px-10 shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>
              
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Detail Hunian</h2>
                  <p className="mt-2 text-sm text-blue-100/90 leading-relaxed max-w-md">
                    Konfigurasi hunian perumahan/apartemen dan pemetaan penghuni.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !saving && setRumahModalOpen(false)}
                  className="rounded-full bg-white/10 p-2.5 text-white transition-all hover:bg-white/20 hover:scale-105 backdrop-blur-md shadow-sm shrink-0"
                  aria-label="Tutup modal detail unit"
                  disabled={saving}
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Blok / Tower"
                  icon={<Home size={16} />}
                  value={rumahDraft.blok}
                  onChange={(event) => setRumahDraft((prev) => ({ ...prev, blok: event.target.value }))}
                  placeholder="Contoh: Blok A / Tower A"
                  className="py-2.5"
                />
                <Input
                  label="Nomor Rumah / Unit"
                  icon={<Home size={16} />}
                  value={rumahDraft.nomor}
                  onChange={(event) => setRumahDraft((prev) => ({ ...prev, nomor: event.target.value }))}
                  placeholder="Contoh: 12 / A-12"
                  className="py-2.5"
                />
              </div>

              <div className="mt-5">
                <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary-dark shadow-sm">
                  Kode Unit Terbentuk: <span className="font-bold">{rumahDraft.blok || '-'} - {rumahDraft.nomor || '-'}</span>
                </div>

                <Select
                  label="Pemetaan Warga Penghuni"
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
                  className="py-2.5"
                />
                <p className="mt-1.5 text-xs text-text-muted">Pilih dari daftar warga yang sudah terdaftar di sistem.</p>

                {rumahDraft.penghuniAktif.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-border-light bg-bg-card shadow-sm p-4">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">Penghuni Saat Ini</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {rumahDraft.penghuniAktif.map((item) => (
                        <Badge key={item.id} variant="primary" className="gap-1.5 px-3 py-1 shadow-sm">
                          <Users size={14} />
                          {item.name ?? item.email ?? item.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border-light px-6 py-5 bg-bg-card shrink-0">
              <Button
                variant="ghost"
                onClick={() => !saving && setRumahModalOpen(false)}
                disabled={saving}
                className="font-bold text-text-muted hover:text-text-main"
              >
                Batal
              </Button>
              <Button
                onClick={saveRumah}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 shadow-md"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
            
            <div className="border-t border-border-light bg-primary/5 px-6 py-4 shrink-0">
              <p className="text-xs text-primary-dark text-center">
                Menghubungkan warga ke unit akan memberikan akses notifikasi paket dan akses area digital gedung.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden shadow-2xl rounded-3xl border-0 bg-bg-card">
            <div className="bg-danger/10 p-6 flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-danger/20 text-danger mb-4 shadow-inner">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold text-danger-dark">Konfirmasi Hapus Unit</h2>
              <p className="mt-2 text-sm text-danger-dark/80">
                Anda akan menghapus unit secara permanen.
              </p>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-text-main text-base">
                Apakah Anda yakin ingin menghapus unit <span className="font-bold text-lg block mt-2 text-danger">{deleteTarget.blok} - {deleteTarget.nomor}</span>
              </p>
              <p className="text-sm text-text-muted mt-2">Data yang sudah dihapus tidak dapat dikembalikan.</p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-light bg-bg-card px-6 py-5">
              <Button
                variant="ghost"
                onClick={() => !deleting && setDeleteTarget(null)}
                disabled={deleting}
                className="font-bold text-text-muted hover:text-text-main"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteRumah}
                disabled={deleting}
                className="font-bold py-2.5 px-6 shadow-md"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
