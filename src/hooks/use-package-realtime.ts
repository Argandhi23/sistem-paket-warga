import { useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type PackageRealtimePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

export function usePackageRealtime(onPayload: (payload: PackageRealtimePayload) => void) {
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return;

    const channel = supabase
      .channel('public:Package')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Package',
        },
        (payload) => {
          onPayload(payload as PackageRealtimePayload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onPayload]);
}
