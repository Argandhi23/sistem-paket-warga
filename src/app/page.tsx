export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sistem Paket Warga</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Portal Distribusi Paket</h1>
        <p className="mt-4 text-sm text-slate-600">
          Akses akun dikelola admin melalui CRUD user. Silakan lanjut ke halaman login untuk masuk sesuai role.
        </p>
        <a
          href="/login"
          className="mt-8 inline-flex rounded-xl bg-[#1a3fd4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1737b8]"
        >
          Buka Halaman Login
        </a>
      </section>
    </main>
  );
}
