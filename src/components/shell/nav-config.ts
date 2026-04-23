import { Bell, CircleHelp, Grid2x2, Home, Package, PlusCircle, Users } from 'lucide-react';

export type AppRole = 'ADMIN' | 'SECURITY' | 'WARGA';

export type NavKey = 'dashboard' | 'warga' | 'rumah' | 'paket' | 'input-paket' | 'paket-saya' | 'riwayat';

export type NavItem = {
  key: NavKey;
  href: string;
  label: string;
  icon: typeof Grid2x2;
};

export type QuickAction = {
  href: string;
  label: string;
};

export type ShellConfig = {
  role: AppRole;
  roleLabel: string;
  appLabel: string;
  profileInitials: string;
  searchPlaceholder: string;
  navItems: NavItem[];
  quickAction?: QuickAction;
  topIcons?: Array<typeof Bell | typeof CircleHelp>;
};

const baseIcons = [Bell, CircleHelp];

export const shellConfigs: Record<AppRole, ShellConfig> = {
  ADMIN: {
    role: 'ADMIN',
    roleLabel: 'Admin',
    appLabel: 'ADMIN TERMINAL',
    profileInitials: 'BS',
    searchPlaceholder: 'Cari nama atau unit rumah...',
    navItems: [
      { key: 'dashboard', href: '/admin', label: 'Dashboard', icon: Grid2x2 },
      { key: 'warga', href: '/admin/warga', label: 'Data Pengguna', icon: Users },
      { key: 'rumah', href: '/admin/rumah', label: 'Manajemen Rumah', icon: Home },
      { key: 'paket', href: '/admin/paket', label: 'Daftar Paket', icon: Package },
    ],
    quickAction: { href: '/admin/paket/tambah', label: '+ Input Paket Baru' },
    topIcons: baseIcons,
  },
  SECURITY: {
    role: 'SECURITY',
    roleLabel: 'Security',
    appLabel: 'SECURITY TERMINAL',
    profileInitials: 'SC',
    searchPlaceholder: 'Cari nomor resi atau unit...',
    navItems: [
      { key: 'dashboard', href: '/security', label: 'Dashboard', icon: Grid2x2 },
      { key: 'paket', href: '/security/paket', label: 'Daftar Paket', icon: Package },
    ],
    quickAction: { href: '/security/paket/tambah', label: '+ Input Paket Baru' },
    topIcons: baseIcons,
  },
  WARGA: {
    role: 'WARGA',
    roleLabel: 'Warga',
    appLabel: 'WARGA TERMINAL',
    profileInitials: 'WG',
    searchPlaceholder: 'Cari status paket...',
    navItems: [
      { key: 'dashboard', href: '/warga', label: 'Dashboard', icon: Grid2x2 },
      { key: 'paket-saya', href: '/warga/paket', label: 'Paket Saya', icon: Package },
      { key: 'riwayat', href: '/warga/riwayat', label: 'Riwayat', icon: Users },
    ],
    quickAction: { href: '/warga/paket', label: 'Lihat Paket Saya' },
    topIcons: baseIcons,
  },
};
