import { useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

// Sesuaikan dengan tipe data Package dari Prisma jika perlu
export function usePackageRealtime(onPayload: (payload: any) => void) {
  useEffect(() => {
    // 1. Inisialisasi channel untuk tabel Package
    const channel = supabase
      .channel('public:Package')
      .on(
        'postgres_changes',
        {
          event: '*', // Mendengarkan INSERT, UPDATE, dan DELETE
          schema: 'public',
          table: 'Package',
        },
        (payload) => {
          onPayload(payload);
        }
      )
      .subscribe();

    // 2. Cleanup subscription saat komponen unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onPayload]);
}