'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex w-full items-center justify-center bg-danger gap-3 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:bg-danger/90 active:scale-[0.98] shadow-sm lg:gap-4"
      >
        <LogOut size={18} className="text-white" />
        Keluar
      </button>
  );
}
