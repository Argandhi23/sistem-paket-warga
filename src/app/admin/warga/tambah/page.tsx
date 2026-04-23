import { X } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/shell/AppShell';
import TambahWargaForm from '@/components/admin/TambahWargaForm';
import { Card, CardHeader } from '@/components/ui/Card';

export default async function TambahWargaPage() {
  return (
    <AppShell active="warga">
      <section className="rounded-2xl border border-border-light bg-bg-header p-3 md:p-6 shadow-soft">
        <Card className="mx-auto max-w-3xl overflow-hidden shadow-card">
          <CardHeader className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[1.55rem] font-bold text-text-main md:text-[1.9rem]">Tambah Pengguna Baru</h1>
              <p className="mt-1 text-[0.92rem] text-text-muted md:text-[0.98rem]">Isi data warga untuk menambahkan akun baru ke sistem.</p>
            </div>
            <Link
              href="/admin/warga"
              className="rounded-full p-2 text-text-muted transition hover:bg-bg-header hover:text-primary"
              aria-label="Tutup form tambah pengguna"
            >
              <X size={20} />
            </Link>
          </CardHeader>

          <TambahWargaForm />
        </Card>
      </section>
    </AppShell>
  );
}
