import React from 'react';
import { X, Package, Calendar, MapPin, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export type PackageDetail = {
  trackingNumber: string;
  status: string;
  courierName: string;
  receivedAt: string | Date;
  storedAt: string; // Pos Security - Blok A
  receivedBy: string; // Penerima awal (security/admin)
  pickedUpAt?: string | Date;
  pickedUpBy?: string;
};

type PackageDetailModalProps = {
  open: boolean;
  onClose: () => void;
  paket: PackageDetail;
};

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ open, onClose, paket }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/40 backdrop-blur-[2px] px-4">
      <Card className="relative w-full max-w-md overflow-hidden shadow-card animate-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-bg-header">
          <div className="font-bold text-lg text-text-main">Detail Pengiriman</div>
          <button 
            onClick={onClose} 
            aria-label="Tutup" 
            className="text-text-muted hover:bg-bg-card rounded-full p-1.5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="text-[0.7rem] uppercase font-bold tracking-[0.14em] text-text-muted mb-1.5">NOMOR RESI</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-2xl text-primary tracking-tight select-all">
                {paket.trackingNumber || '-'}
              </span>
              <Badge variant={paket.pickedUpAt ? "success" : "primary"}>
                {paket.status || '-'}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <DetailRow icon={<Package size={16} />} label="Kurir" value={paket.courierName} bold />
            <DetailRow icon={<Calendar size={16} />} label="Tanggal Masuk" value={dateTimeID(paket.receivedAt)} />
            <DetailRow icon={<MapPin size={16} />} label="Disimpan di" value={paket.storedAt} />
            <DetailRow icon={<User size={16} />} label="Diterima oleh" value={paket.receivedBy} />
            
            {paket.pickedUpAt && (
              <div className="mt-4 pt-4 border-t border-border-light border-dashed">
                <DetailRow icon={<CheckCircle2 size={16} />} label="Tanggal Diambil" value={dateTimeID(paket.pickedUpAt)} />
                {paket.pickedUpBy && (
                  <DetailRow icon={<User size={16} />} label="Diambil oleh" value={paket.pickedUpBy} bold />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-2 bg-bg-muted/30">
          <Button
            onClick={onClose}
            className="w-full py-3.5 shadow-md"
          >
            Tutup Detail
          </Button>
        </div>
      </Card>
    </div>
  );
};

function DetailRow({ icon, label, value, bold }: { icon?: React.ReactNode, label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      {icon && <div className="mt-0.5 text-text-muted/60">{icon}</div>}
      <div className="flex-1 flex justify-between gap-4">
        <span className="text-text-muted font-medium">{label}</span>
        <span className={`${bold ? 'font-bold text-text-main' : 'text-text-body font-medium'} text-right`}>{value || '-'}</span>
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
  });
}
