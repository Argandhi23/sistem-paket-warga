'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

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
      <Input
        label="Nama Lengkap"
        id="name"
        type="text"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        placeholder="Masukkan nama lengkap..."
      />

      <Input
        label="Alamat Email"
        id="email"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        placeholder="contoh@email.com"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Peran (Role)"
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value === 'SATPAM' ? 'SATPAM' : 'WARGA')}
          options={[
            { value: 'WARGA', label: 'WARGA' },
            { value: 'SATPAM', label: 'SATPAM' },
          ]}
        />

        <Input
          label="Nomor Unit (Opsional)"
          id="unitNumber"
          value={unitNumber}
          onChange={(event) => setUnitNumber(event.target.value)}
          placeholder="Contoh: A-12"
        />
      </div>

      <Input
        label="Password Awal"
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        placeholder="Minimal 8 karakter"
      />

      <p className="min-h-5 text-sm text-text-muted">{message}</p>

      <div className="flex flex-col gap-3 border-t border-border-light pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.push('/admin/warga')}
          className="text-text-muted"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="sm:min-w-[230px]"
        >
          {saving ? 'Menyimpan...' : 'Simpan Data User'}
        </Button>
      </div>
    </form>
  );
}
