import React, { useState } from 'react';
import { X, Package, Calendar, MapPin, User, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { calculatePenalty, formatRupiah } from '@/utils/penalty';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export type PackageDetail = {
  id: string;
  trackingNumber: string;
  status: string;
  courierName: string;
  receivedAt: string | Date;
  storedAt: string; // Pos Security - Blok A
  receivedBy: string; // Penerima awal (security/admin)
  pickedUpAt?: string | Date | null;
  pickedUpBy?: string | null;
  penaltyAmount?: number;
  penaltyPaid?: boolean;
};

type PackageDetailModalProps = {
  open: boolean;
  onClose: () => void;
  paket: PackageDetail;
  isSecurity?: boolean;
};

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ open, onClose, paket, isSecurity = false }) => {
  const router = useRouter();
  const [handoverName, setHandoverName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!open) return null;

  const penaltyInfo = calculatePenalty(paket.receivedAt);
  const isPickedUp = !!paket.pickedUpAt;
  const hasPenalty = penaltyInfo.amount > 0;
  const showHandoverForm = isSecurity && !isPickedUp;

  const handleHandover = async () => {
    if (!handoverName.trim()) {
      alert('Masukkan nama pengambil paket.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/packages/handover', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: paket.id,
          pickedUpBy: handoverName.trim(),
          penaltyAmount: penaltyInfo.amount,
          penaltyPaid: hasPenalty, // Jika ada denda, tandai lunas saat diserahkan
        }),
      });

      if (response.ok) {
        router.refresh();
        onClose();
      } else {
        const errorResult = await response.json();
        alert(errorResult.error || 'Gagal memproses penyerahan paket.');
      }
    } catch (err) {
      alert('Kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/40 backdrop-blur-[2px] px-4">
      <Card className="relative w-full max-w-xl overflow-hidden shadow-card animate-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-bg-header">
          <div className="font-bold text-lg text-text-main">
            {hasPenalty && !isPickedUp ? 'Detail Paket & Denda' : 'Detail Paket'}
          </div>
          <button 
            onClick={onClose} 
            aria-label="Tutup" 
            className="text-text-muted hover:bg-bg-card rounded-full p-1.5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[0.7rem] uppercase font-bold tracking-[0.14em] text-text-muted mb-1">NOMOR RESI</div>
                <span className={`font-bold text-3xl tracking-tight select-all ${isPickedUp ? 'text-text-muted/50' : 'text-primary'}`}>
                  {paket.trackingNumber || '-'}
                </span>
              </div>
              <Badge variant={isPickedUp ? "success" : hasPenalty ? "secondary" : "primary"}>
                {isPickedUp ? "SUDAH DIAMBIL" : hasPenalty ? "Denda Belum Bayar" : "Menunggu Pengambilan"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
            <DetailRow icon={<Package size={16} />} label="Penerima" value={paket.recipientName} bold />
            <DetailRow icon={<Calendar size={16} />} label="Waktu Kedatangan" value={dateTimeID(paket.receivedAt)} />
            <DetailRow icon={<Package size={16} />} label="Ekspedisi" value={paket.courierName} />
            <DetailRow icon={<MapPin size={16} />} label="Disimpan di" value={paket.storedAt} />
            <DetailRow icon={<User size={16} />} label="Petugas Input" value={paket.receivedBy} />
          </div>

          {hasPenalty && !isPickedUp && (
            <div className="rounded-xl border border-danger-border bg-danger-light/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-danger font-bold text-xs uppercase tracking-wider">
                  <AlertCircle size={14} />
                  Informasi Denda
                </div>
                <Badge variant="danger">Belum Dibayar</Badge>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-text-main">Jumlah Hari Telat: {penaltyInfo.lateDays} hari</p>
                  <p className="text-[10px] text-text-muted italic">Denda dihitung Rp 2.000/hari mulai hari ke-4</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-muted">Total Denda:</p>
                  <p className="text-2xl font-black text-danger">{formatRupiah(penaltyInfo.amount)}</p>
                </div>
              </div>
            </div>
          )}

          {isPickedUp && (
            <div className="pt-4 border-t border-border-light border-dashed space-y-4">
               <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 size={14} />
                  Informasi Pengambilan
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <DetailRow icon={<Calendar size={16} />} label="Tanggal Diambil" value={dateTimeID(paket.pickedUpAt!)} />
                  <DetailRow icon={<User size={16} />} label="Diambil oleh" value={paket.pickedUpBy || '-'} bold />
                </div>
                {paket.penaltyAmount ? (
                   <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Status Denda</span>
                      <span className="font-black text-emerald-700">LUNAS ({formatRupiah(paket.penaltyAmount)})</span>
                   </div>
                ) : null}
            </div>
          )}

          {!isPickedUp && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="aspect-video rounded-lg bg-bg-muted border border-border-light flex flex-col items-center justify-center text-text-muted gap-2">
                <ImageIcon size={24} className="opacity-20" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Bukti Kedatangan</span>
              </div>
              <div className="aspect-video rounded-lg bg-bg-muted border border-border-light flex flex-col items-center justify-center text-text-muted gap-2">
                <ImageIcon size={24} className="opacity-20" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Aktifitas Penyerahan</span>
              </div>
            </div>
          )}

          {showHandoverForm && (
            <div className="pt-4 border-t border-border-light">
               <Input 
                  label="Nama Pengambil Paket"
                  placeholder="Masukkan nama warga atau keluarga..."
                  value={handoverName}
                  onChange={(e) => setHandoverName(e.target.value)}
                  icon={<User size={16} />}
               />
            </div>
          )}
        </div>

        <div className="p-6 pt-2 bg-bg-muted/30 flex gap-3">
          {showHandoverForm ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3"
              >
                Tutup
              </Button>
              <Button
                onClick={handleHandover}
                disabled={isSubmitting}
                className="flex-[2] py-3 shadow-md gap-2"
              >
                <CheckCircle2 size={18} />
                {isSubmitting ? 'Memproses...' : hasPenalty ? 'Mark as Paid & Diserahkan' : 'Serahkan Paket'}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className="w-full py-3.5 shadow-md"
            >
              Tutup Detail
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

function DetailRow({ icon, label, value, bold }: { icon?: React.ReactNode, label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <div className="text-text-muted/40">{icon}</div>}
        <span className={`${bold ? 'font-bold text-text-main' : 'text-text-body font-medium'} text-sm`}>{value || '-'}</span>
      </div>
    </div>
  );
}

function dateTimeID(dt: string | Date | undefined) {
  if (!dt) return '-';
  const date = new Date(dt);
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }) + ' WIB';
}
