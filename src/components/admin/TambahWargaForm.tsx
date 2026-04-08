'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function TambahWargaForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'WARGA' | 'SATPAM'>('WARGA');
  const [unitNumber, setUnitNumber] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function resolveErrorMessage(payload: unknown, fallback: string) {
    if (!payload || typeof payload !== 'object') return fallback;

    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim()) return error;

    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;

    return fallback;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage('Nama, email, dan password wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setMessage('Password minimal 8 karakter.');
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
          password,
          role: role === 'SATPAM' ? 'SECURITY' : 'WARGA',
          unitNumber: unitNumber.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        setMessage(resolveErrorMessage(payload, 'Gagal menambahkan pengguna.'));
        setSaving(false);
        return;
      }

      router.push('/admin/warga');
      router.refresh();
    } catch {
      setMessage('Gagal menambahkan pengguna. Periksa koneksi atau endpoint API.');
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
            onChange={(event) => setRole(event.target.value === 'SATPAM' ? 'SATPAM' : 'WARGA')}
            className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
          >
            <option value="WARGA">WARGA</option>
            <option value="SATPAM">SATPAM</option>
          </select>
        </div>

        <div>
          <label htmlFor="unitNumber" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
            Nomor Unit (Opsional)
          </label>
          <input
            id="unitNumber"
            value={unitNumber}
            onChange={(event) => setUnitNumber(event.target.value)}
            placeholder="Contoh: A-12"
            className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f84a0]">
          Password Awal
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
          className="w-full rounded-xl border border-[#d5e1f0] bg-[#e7f0fb] px-4 py-3 text-sm text-[#324861] placeholder:text-[#91a4bb] focus:border-[#6a91d8] focus:outline-none focus:ring-2 focus:ring-[#b4c9eb] md:text-base"
        />
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
