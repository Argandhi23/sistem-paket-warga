'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function tambahWarga(formData: FormData) {
  const nama = formData.get('nama') as string;
  const blokRumah = formData.get('blokRumah') as string;
  const noHp = formData.get('noHp') as string;

  await prisma.warga.create({
    data: {
      nama,
      blokRumah,
      noHp,
    },
  });

  // UBAH DUA BARIS INI MENJADI /admin/warga
  revalidatePath('/admin/warga');
  redirect('/admin/warga');
}