'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function TambahWargaForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'WARGA' | 'SECURITY'>('WARGA');
  const [status, setStatus] = useState('Aktif');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!name.trim() || !email.trim()) {
      setMessage('Nama dan email wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          status,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        setMessage('Gagal menambahkan pengguna. Cek kesiapan endpoint API user.');
        setSaving(false);
        return;
      }

      router.push('/admin/warga');
      router.refresh();
    } catch {
      setMessage('Gagal menambahkan pengguna. Cek kesiapan endpoint API user.');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4 md:p-6">
      <div>
        <label htmlFor="name" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] placeholder:text-[#91a4bb] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
          placeholder="Masukkan nama lengkap..."
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
          Alamat Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] placeholder:text-[#91a4bb] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
          placeholder="contoh@email.com"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
            Peran (Role)
          </label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value === 'SECURITY' ? 'SECURITY' : 'WARGA')}
            className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
          >
            <option value="WARGA">WARGA</option>
            <option value="SECURITY">SATPAM</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
            Status Akun
          </label>
          <input
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
          />
        </div>
      </div>

      <p className="min-h-5 text-sm text-[#5e7591]">{message}</p>

      <div className="flex flex-col gap-3 border-t border-[#e3ebf5] pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/admin/warga"
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[0.95rem] font-semibold text-[#516a86] transition hover:bg-[#edf3fb]"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[#3f6fd5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#325fc0] disabled:cursor-not-allowed disabled:bg-[#9fb4d8] sm:w-auto sm:min-w-[230px]"
        >
          {saving ? 'Menyimpan...' : 'Simpan Data User'}
        </button>
      </div>
    </form>
  );
}
