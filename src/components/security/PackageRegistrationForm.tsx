'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Barcode, 
  ChevronDown, 
  Calendar, 
  Home, 
  Search, 
  Package, 
  X, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

type Resident = {
  id: string;
  name: string;
  unitNumber: string;
  activePackages?: number;
  floor?: string;
};

export default function PackageRegistrationForm() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResidents([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search-warga?q=${searchQuery}`);
        const result = await response.json();
        
        if (result.success) {
          setResidents(result.data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Failed to fetch residents', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident || !courierName) {
      setMessage('Lengkapi data kurir dan pilih warga penerima.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          courierName,
          recipientName: selectedResident.name,
          unitNumber: selectedResident.unitNumber,
          wargaId: selectedResident.id,
          securityId: session?.user?.id || 'default-security-id', 
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Paket berhasil didaftarkan!');
        setTimeout(() => {
          router.push('/security');
          router.refresh();
        }, 1500);
      } else {
        setMessage(result.message || 'Gagal mendaftarkan paket.');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl overflow-hidden shadow-2xl rounded-3xl border-0 bg-bg-card">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-primary px-6 py-10 sm:px-12 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner border border-white/20 backdrop-blur-sm">
            <Package className="size-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Registrasi Paket Baru
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-blue-100/90 max-w-md">
            Input data kedatangan paket dengan lengkap. Sistem akan otomatis mengirimkan notifikasi ke perangkat warga terkait.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            label="Nomor Resi / AWB"
            icon={<Barcode className="size-5" />}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Scan barcode atau masukkan nomor resi..."
            className="text-lg py-3"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Select
              label="Ekspeditur / Kurir"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              required
              options={[
                { value: '', label: 'Pilih Kurir' },
                { value: 'JNE', label: 'JNE Express' },
                { value: 'J&T', label: 'J&T Express' },
                { value: 'Sicepat', label: 'SiCepat' },
                { value: 'Anteraja', label: 'Anteraja' },
                { value: 'Shopee Express', label: 'Shopee Express' },
                { value: 'Gojek/Grab', label: 'Gojek / Grab' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
              className="text-lg"
            />

            <Input
              label="Tanggal Diterima"
              icon={<Calendar className="size-5" />}
              type="date"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              required
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">Tautkan ke Rumah / Warga</p>
            {!selectedResident ? (
              <div className="relative">
                <Input
                  icon={<Home className="size-5" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  placeholder="Cari Unit (A-01) atau Nama Warga..."
                  className="text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {isSearching ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <Search className="size-5 text-text-muted" />
                  )}
                </div>

                {showResults && residents.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border-light bg-bg-card shadow-card">
                    {residents.map((resident) => (
                      <button
                        key={resident.id}
                        type="button"
                        onClick={() => {
                          setSelectedResident(resident);
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="flex w-full items-center gap-4 border-b border-border-light p-4 text-left transition-all hover:bg-bg-header last:border-0"
                      >
                        <div className="flex size-10 items-center justify-center rounded-xl bg-bg-header text-primary">
                          <Home className="size-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-text-main">
                            {resident.unitNumber} — {resident.name}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-text-muted">
                            <span className="flex items-center gap-1 text-primary">
                              <Package className="size-3" /> {resident.activePackages} Paket Aktif
                            </span>
                            <span>{resident.floor}</span>
                          </div>
                        </div>
                        <CheckCircle2 className="size-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-bg-card text-primary shadow-soft">
                    <Home className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main">
                      {selectedResident.unitNumber} — {selectedResident.name}
                    </h4>
                    <Badge variant="primary" className="mt-0.5">Penerima Terpilih</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedResident(null)}
                  className="text-text-muted hover:text-danger"
                >
                  <X className="size-5" />
                </Button>
              </div>
            )}
          </div>

          {message && (
            <div className={`flex items-center gap-3 rounded-xl p-4 font-bold animate-in zoom-in-95 ${
              message.includes('berhasil') 
                ? 'bg-success/10 text-success' 
                : 'bg-danger/10 text-danger'
            }`}>
              {message.includes('berhasil') ? <CheckCircle2 className="size-5" /> : <X className="size-5" />}
              <span className="flex-1">{message}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-4 pt-4 md:flex-row">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-lg md:w-auto md:min-w-[300px]"
            >
              {isSubmitting ? (
                <Loader2 className="size-6 animate-spin mr-2" />
              ) : (
                <Package className="size-6 mr-2 transition-transform group-hover:rotate-12" />
              )}
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Paket'}
            </Button>
            
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.back()}
              className="text-text-muted hover:text-text-main font-bold"
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
