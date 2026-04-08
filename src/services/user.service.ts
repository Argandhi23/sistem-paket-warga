import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { ApiError } from '@/lib/custom-error';
import { UserRepository } from '@/repositories/user.repository';
import { RumahRepository } from '@/repositories/rumah.repository';

const FE_ROLE_MAP: Record<string, Role> = {
  WARGA: Role.WARGA,
  SATPAM: Role.SECURITY,
  SECURITY: Role.SECURITY,
  ADMIN: Role.ADMIN,
};

function normalizeRole(input: unknown): Role | null {
  if (typeof input !== 'string') return null;
  const value = input.trim().toUpperCase();
  return FE_ROLE_MAP[value] ?? null;
}

function normalizeSort(input: unknown): 'asc' | 'desc' {
  if (typeof input !== 'string') return 'desc';
  const value = input.trim().toLowerCase();
  return value === 'lama' || value === 'asc' ? 'asc' : 'desc';
}

function sanitizeUser(user: {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  unitNumber?: string | null;
  rumah?: { id: string; blok: string; nomor: string } | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    unitNumber: user.unitNumber ?? null,
    rumah: user.rumah ?? null,
  };
}

export class UserService {
  static async listForManagement(params: { role?: unknown; sort?: unknown }) {
    const role = normalizeRole(params.role);
    const sortOrder = normalizeSort(params.sort);
    const users = await UserRepository.findForManagement({ role: role ?? undefined, sortOrder });
    return users.map(sanitizeUser);
  }

  static async createForAdmin(payload: {
    name?: unknown;
    email?: unknown;
    role?: unknown;
    password?: unknown;
    unitNumber?: unknown;
    status?: unknown;
  }) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const role = normalizeRole(payload.role);
    const password = typeof payload.password === 'string' ? payload.password : '';
    const unitNumber = typeof payload.unitNumber === 'string' ? payload.unitNumber.trim() || null : null;

    if (!name || !email || !role || !password) {
      throw new ApiError(400, 'name, email, role, dan password wajib diisi');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'password minimal 8 karakter');
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'email sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({
      name,
      email,
      role,
      password: hashedPassword,
      unitNumber,
    });

    return sanitizeUser(user);
  }

  static async updateForAdmin(payload: {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    role?: unknown;
    unitNumber?: unknown;
  }) {
    const id = typeof payload.id === 'string' ? payload.id.trim() : '';
    if (!id) {
      throw new ApiError(400, 'id user wajib diisi');
    }

    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new ApiError(404, 'user tidak ditemukan');
    }

    const nextData: {
      name?: string;
      email?: string;
      role?: Role;
      unitNumber?: string | null;
    } = {};

    if (typeof payload.name === 'string') {
      const name = payload.name.trim();
      if (!name) throw new ApiError(400, 'name tidak boleh kosong');
      nextData.name = name;
    }

    if (typeof payload.email === 'string') {
      const email = payload.email.trim().toLowerCase();
      if (!email) throw new ApiError(400, 'email tidak boleh kosong');

      const duplicate = await UserRepository.findByEmail(email);
      if (duplicate && duplicate.id !== id) {
        throw new ApiError(409, 'email sudah digunakan');
      }
      nextData.email = email;
    }

    if (payload.role !== undefined) {
      const role = normalizeRole(payload.role);
      if (!role) throw new ApiError(400, 'role tidak valid');
      nextData.role = role;
    }

    if (payload.unitNumber !== undefined) {
      if (typeof payload.unitNumber === 'string') {
        nextData.unitNumber = payload.unitNumber.trim() || null;
      } else {
        nextData.unitNumber = null;
      }
    }

    if (Object.keys(nextData).length === 0) {
      throw new ApiError(400, 'tidak ada data yang diperbarui');
    }

    const updated = await UserRepository.update(id, nextData);
    return sanitizeUser(updated);
  }

  static async deleteForAdmin(payload: { id?: unknown }) {
    const id = typeof payload.id === 'string' ? payload.id.trim() : '';
    if (!id) {
      throw new ApiError(400, 'id user wajib diisi');
    }

    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new ApiError(404, 'user tidak ditemukan');
    }

    await UserRepository.delete(id);
    return { id };
  }

  static async linkToRumah(payload: { userId?: unknown; rumahId?: unknown }) {
    const userId = typeof payload.userId === 'string' ? payload.userId.trim() : '';

    if (!userId) {
      throw new ApiError(400, 'userId wajib diisi');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'user tidak ditemukan');
    }

    if (user.role !== Role.WARGA) {
      throw new ApiError(400, 'hanya user role WARGA yang dapat ditautkan ke rumah');
    }

    if (payload.rumahId === null) {
      return UserRepository.linkToRumah(userId, null);
    }

    const rumahId = typeof payload.rumahId === 'string' ? payload.rumahId.trim() : '';
    if (!rumahId) {
      throw new ApiError(400, 'rumahId wajib diisi');
    }

    const rumah = await RumahRepository.findById(rumahId);
    if (!rumah) {
      throw new ApiError(404, 'rumah tidak ditemukan');
    }

    return UserRepository.linkToRumah(userId, rumahId);
  }
}
