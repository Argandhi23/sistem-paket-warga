import AppShell from '@/components/shell/AppShell';
import PackageRegistrationForm from '@/components/security/PackageRegistrationForm';

export default async function SecurityTambahPaketPage() {
  return (
    <AppShell active="paket">
      <div className="mt-4 flex flex-col items-center">
        <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500">
          <PackageRegistrationForm />
        </div>
      </div>
    </AppShell>
  );
}
