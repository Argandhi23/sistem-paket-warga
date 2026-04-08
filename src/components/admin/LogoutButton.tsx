'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="inline-flex items-center justify-center rounded-full border border-[#e2c7cb] bg-[#f9ebee] px-[1.2rem] py-[0.65rem] text-[0.95rem] font-semibold text-[#aa4a51] transition hover:bg-[#f6dee2]"
    >
      Keluar (Logout)
    </button>
  );
}
