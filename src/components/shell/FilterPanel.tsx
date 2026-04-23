'use client';

import { Search, X, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type FilterPanelProps = {
  baseUrl: string;
  isOpen: boolean;
  onClose?: () => void;
};

export function FilterPanel({ baseUrl, isOpen, onClose }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [courier, setCourier] = useState(searchParams.get('courier') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (courier) params.set('courier', courier); else params.delete('courier');
    if (startDate) params.set('startDate', startDate); else params.delete('startDate');
    if (endDate) params.set('endDate', endDate); else params.delete('endDate');
    
    params.delete('page');
    
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const handleReset = () => {
    if (onClose) onClose();
    setCourier('');
    setStartDate('');
    setEndDate('');
    router.push(baseUrl);
  };

  if (!isOpen) return null;

  return (
    <form 
      onSubmit={handleApply}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl border border-border-light bg-bg-header/30 mb-6 animate-in fade-in slide-in-from-top-1 duration-300 shadow-sm"
    >
      <Input 
        label="Ekspeditur / Kurir"
        icon={<Search size={14} />}
        value={courier}
        onChange={(e) => setCourier(e.target.value)}
        placeholder="Cari JNE, J&T, dll..." 
        className="text-xs"
      />

      <Input 
        label="Mulai Tanggal"
        type="date"
        icon={<Calendar size={14} />}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="text-xs"
      />

      <Input 
        label="Sampai Tanggal"
        type="date"
        icon={<Calendar size={14} />}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="text-xs"
      />

      <div className="flex items-end gap-2">
        <Button 
          type="submit" 
          className="flex-1 rounded-xl py-2.5 shadow-sm"
        >
          Terapkan
        </Button>
        <Button 
          variant="outline"
          type="button"
          onClick={handleReset}
          className="px-3 rounded-xl py-2.5 border-border-light hover:text-danger"
          title="Reset Filter"
        >
          <X size={18} />
        </Button>
      </div>
    </form>
  );
}
