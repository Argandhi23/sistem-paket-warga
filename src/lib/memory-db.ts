import { randomUUID } from 'crypto';
import type { Role, PackageStatus } from '@prisma/client';
import backupJson from '../../prisma/backup/supabase_backup.json';

export interface MemoryRumah {
  id: string;
  blok: string;
  nomor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: Role;
  unitNumber: string | null;
  rumahId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryPackage {
  id: string;
  trackingNumber: string | null;
  courierName: string;
  recipientName: string;
  unitNumber: string;
  status: PackageStatus;
  receivedAt: Date;
  pickedUpAt: Date | null;
  pickedUpBy: string | null;
  penaltyAmount: number;
  penaltyPaid: boolean;
  wargaId: string | null;
  securityId: string;
}

export interface MemoryActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  userId: string | null;
  createdAt: Date;
}

interface MemoryStore {
  rumah: MemoryRumah[];
  users: MemoryUser[];
  packages: MemoryPackage[];
  activityLogs: MemoryActivityLog[];
}

type FilterRecord = Record<string, unknown>;

function createInitialStore(): MemoryStore {
  const now = Date.now();
  return {
    rumah: (backupJson.Rumah || []).map((r) => ({
      id: r.id,
      blok: r.blok,
      nomor: r.nomor,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    })),
    users: (backupJson.User || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: u.emailVerified ? new Date(u.emailVerified) : null,
      image: u.image,
      password: u.password,
      role: u.role as Role,
      unitNumber: u.unitNumber,
      rumahId: u.rumahId,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    })),
    packages: (backupJson.Package || []).map((p, idx) => {
      // Keep relative realistic dates for demo/portfolio freshness
      const receivedOffset =
        p.status === 'EXPIRED'
          ? 1000 * 60 * 60 * 24 * 6 // 6 days ago (overdue)
          : p.status === 'DELIVERED_TO_WARGA'
            ? 1000 * 60 * 60 * 24 * 3 // 3 days ago
            : 1000 * 60 * 60 * (idx + 1) * 4; // 4-16 hours ago
      const receivedAt = new Date(now - receivedOffset);
      const pickedUpAt =
        p.status === 'DELIVERED_TO_WARGA'
          ? new Date(now - 1000 * 60 * 60 * 24 * 2)
          : null;

      return {
        id: p.id,
        trackingNumber: p.trackingNumber,
        courierName: p.courierName,
        recipientName: p.recipientName,
        unitNumber: p.unitNumber,
        status: p.status as PackageStatus,
        receivedAt,
        pickedUpAt,
        pickedUpBy: p.pickedUpBy,
        penaltyAmount: p.penaltyAmount,
        penaltyPaid: p.penaltyPaid,
        wargaId: p.wargaId,
        securityId: p.securityId,
      };
    }),
    activityLogs: (backupJson.ActivityLog || []).map((l) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      details: l.details,
      userId: l.userId,
      createdAt: new Date(l.createdAt),
    })),
  };
}

const globalForMemory = globalThis as unknown as {
  __spwMemoryStore?: MemoryStore;
};

function getStore(): MemoryStore {
  if (!globalForMemory.__spwMemoryStore) {
    globalForMemory.__spwMemoryStore = createInitialStore();
  }
  return globalForMemory.__spwMemoryStore;
}

function matchStringCondition(value: string | null | undefined, cond: unknown): boolean {
  if (typeof cond === 'string') {
    return value === cond;
  }
  if (cond === null) {
    return value === null || value === undefined;
  }
  if (cond && typeof cond === 'object') {
    const c = cond as FilterRecord;
    if (Array.isArray(c.in)) {
      return c.in.includes(value);
    }
    if (typeof c.contains === 'string') {
      if (!value) return false;
      return c.mode === 'insensitive'
        ? value.toLowerCase().includes(c.contains.toLowerCase())
        : value.includes(c.contains);
    }
  }
  return true;
}

function matchDateCondition(value: Date | null | undefined, cond: unknown): boolean {
  if (cond === null) return value === null;
  if (cond instanceof Date) return value?.getTime() === cond.getTime();
  if (cond && typeof cond === 'object') {
    if (!value) return false;
    const c = cond as FilterRecord;
    const t = value.getTime();
    if (c.gte instanceof Date && t < c.gte.getTime()) return false;
    if (c.gt instanceof Date && t <= c.gt.getTime()) return false;
    if (c.lte instanceof Date && t > c.lte.getTime()) return false;
    if (c.lt instanceof Date && t >= c.lt.getTime()) return false;
  }
  return true;
}

function matchNumberCondition(value: number, cond: unknown): boolean {
  if (typeof cond === 'number') return value === cond;
  if (cond && typeof cond === 'object') {
    const c = cond as FilterRecord;
    if (typeof c.gt === 'number' && value <= c.gt) return false;
    if (typeof c.gte === 'number' && value < c.gte) return false;
    if (typeof c.lt === 'number' && value >= c.lt) return false;
    if (typeof c.lte === 'number' && value > c.lte) return false;
  }
  return true;
}

function matchRumah(item: MemoryRumah, where: FilterRecord | undefined, store: MemoryStore): boolean {
  if (!where) return true;
  if (Array.isArray(where.OR)) {
    const orMatched = (where.OR as FilterRecord[]).some((sub) => matchRumah(item, sub, store));
    if (!orMatched) return false;
  }
  if (where.id !== undefined && !matchStringCondition(item.id, where.id)) return false;
  if (where.blok !== undefined && !matchStringCondition(item.blok, where.blok)) return false;
  if (where.nomor !== undefined && !matchStringCondition(item.nomor, where.nomor)) return false;
  if (where.penghuni && typeof where.penghuni === 'object') {
    const penghuniCond = where.penghuni as FilterRecord;
    if (penghuniCond.some !== undefined) {
      const hasPenghuni = store.users.some((u) => u.rumahId === item.id);
      if (!hasPenghuni) return false;
    }
  }
  return true;
}

function matchUser(item: MemoryUser, where: FilterRecord | undefined, store: MemoryStore): boolean {
  if (!where) return true;
  if (Array.isArray(where.AND)) {
    const andMatched = (where.AND as FilterRecord[]).every((sub) => matchUser(item, sub, store));
    if (!andMatched) return false;
  }
  if (Array.isArray(where.OR)) {
    const orMatched = (where.OR as FilterRecord[]).some((sub) => matchUser(item, sub, store));
    if (!orMatched) return false;
  }
  if (where.id !== undefined && !matchStringCondition(item.id, where.id)) return false;
  if (where.email !== undefined && !matchStringCondition(item.email, where.email)) return false;
  if (where.name !== undefined && !matchStringCondition(item.name, where.name)) return false;
  if (where.role !== undefined && !matchStringCondition(item.role, where.role)) return false;
  if (where.unitNumber !== undefined && !matchStringCondition(item.unitNumber, where.unitNumber)) return false;
  if (where.rumahId !== undefined && !matchStringCondition(item.rumahId, where.rumahId)) return false;
  if (where.rumah && typeof where.rumah === 'object') {
    const rumah = item.rumahId ? store.rumah.find((r) => r.id === item.rumahId) : null;
    if (!rumah) return false;
    if (!matchRumah(rumah, where.rumah as FilterRecord, store)) return false;
  }
  return true;
}

function matchPackage(item: MemoryPackage, where: FilterRecord | undefined): boolean {
  if (!where) return true;
  if (Array.isArray(where.AND)) {
    const andMatched = (where.AND as FilterRecord[]).every((sub) => matchPackage(item, sub));
    if (!andMatched) return false;
  }
  if (Array.isArray(where.OR)) {
    const orMatched = (where.OR as FilterRecord[]).some((sub) => matchPackage(item, sub));
    if (!orMatched) return false;
  }
  if (where.id !== undefined && !matchStringCondition(item.id, where.id)) return false;
  if (where.trackingNumber !== undefined && !matchStringCondition(item.trackingNumber, where.trackingNumber)) return false;
  if (where.unitNumber !== undefined && !matchStringCondition(item.unitNumber, where.unitNumber)) return false;
  if (where.status !== undefined && !matchStringCondition(item.status, where.status)) return false;
  if (where.wargaId !== undefined && !matchStringCondition(item.wargaId, where.wargaId)) return false;
  if (where.securityId !== undefined && !matchStringCondition(item.securityId, where.securityId)) return false;
  if (where.courierName !== undefined && !matchStringCondition(item.courierName, where.courierName)) return false;
  if (where.recipientName !== undefined && !matchStringCondition(item.recipientName, where.recipientName)) return false;
  if (where.receivedAt !== undefined && !matchDateCondition(item.receivedAt, where.receivedAt)) return false;
  if (where.penaltyAmount !== undefined && !matchNumberCondition(item.penaltyAmount, where.penaltyAmount)) return false;
  return true;
}

function attachUserRelations(user: MemoryUser, include: FilterRecord | undefined, store: MemoryStore) {
  const result: Record<string, unknown> = { ...user };
  if (include?.rumah) {
    const r = user.rumahId ? store.rumah.find((rm) => rm.id === user.rumahId) ?? null : null;
    result.rumah = r ? { id: r.id, blok: r.blok, nomor: r.nomor, createdAt: r.createdAt, updatedAt: r.updatedAt } : null;
  }
  if (include?._count) {
    const activeCount = store.packages.filter(
      (p) => p.wargaId === user.id && p.status === 'RECEIVED_BY_SECURITY'
    ).length;
    result._count = { packages: activeCount };
  }
  return result;
}

export const memoryPrisma = {
  rumah: {
    async findMany(args?: { where?: FilterRecord; include?: FilterRecord; orderBy?: unknown }) {
      const store = getStore();
      const filtered = store.rumah.filter((r) => matchRumah(r, args?.where, store));
      filtered.sort((a, b) => {
        const cmpBlok = a.blok.localeCompare(b.blok);
        if (cmpBlok !== 0) return cmpBlok;
        return a.nomor.localeCompare(b.nomor, undefined, { numeric: true });
      });
      return filtered.map((r) => {
        if (args?.include?.penghuni) {
          const penghuni = store.users
            .filter((u) => u.rumahId === r.id)
            .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
          return { ...r, penghuni };
        }
        return { ...r };
      });
    },
    async findUnique(args: { where: { id: string } }) {
      const store = getStore();
      const found = store.rumah.find((r) => r.id === args.where.id);
      return found ? { ...found } : null;
    },
    async count(args?: { where?: FilterRecord }) {
      const store = getStore();
      return store.rumah.filter((r) => matchRumah(r, args?.where, store)).length;
    },
    async create(args: { data: { id?: string; blok: string; nomor: string } }) {
      const store = getStore();
      const now = new Date();
      const item: MemoryRumah = {
        id: args.data.id ?? randomUUID(),
        blok: args.data.blok,
        nomor: args.data.nomor,
        createdAt: now,
        updatedAt: now,
      };
      store.rumah.push(item);
      return { ...item };
    },
    async update(args: { where: { id: string }; data: { blok?: string; nomor?: string } }) {
      const store = getStore();
      const idx = store.rumah.findIndex((r) => r.id === args.where.id);
      if (idx === -1) throw new Error('Rumah not found');
      const existing = store.rumah[idx];
      const updated: MemoryRumah = {
        ...existing,
        blok: args.data.blok ?? existing.blok,
        nomor: args.data.nomor ?? existing.nomor,
        updatedAt: new Date(),
      };
      store.rumah[idx] = updated;
      return { ...updated };
    },
    async delete(args: { where: { id: string } }) {
      const store = getStore();
      const idx = store.rumah.findIndex((r) => r.id === args.where.id);
      if (idx === -1) throw new Error('Rumah not found');
      const [deleted] = store.rumah.splice(idx, 1);
      store.users.forEach((u) => {
        if (u.rumahId === deleted.id) u.rumahId = null;
      });
      return { ...deleted };
    },
    async deleteMany(args?: { where?: FilterRecord }) {
      const store = getStore();
      const before = store.rumah.length;
      store.rumah = store.rumah.filter((r) => !matchRumah(r, args?.where, store));
      return { count: before - store.rumah.length };
    },
  },

  user: {
    async findUnique(args: { where: { id?: string; email?: string }; select?: FilterRecord; include?: FilterRecord }) {
      const store = getStore();
      const found = store.users.find((u) => {
        if (args.where.id && u.id === args.where.id) return true;
        if (args.where.email && u.email?.toLowerCase() === args.where.email.toLowerCase()) return true;
        return false;
      });
      if (!found) return null;
      return attachUserRelations(found, args.include, store);
    },
    async findMany(args?: { where?: FilterRecord; include?: FilterRecord; orderBy?: FilterRecord; take?: number }) {
      const store = getStore();
      let list = store.users.filter((u) => matchUser(u, args?.where, store));
      const sortDir = args?.orderBy?.createdAt === 'asc' ? 1 : -1;
      list.sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime()) * sortDir);
      if (typeof args?.take === 'number') {
        list = list.slice(0, args.take);
      }
      return list.map((u) => attachUserRelations(u, args?.include, store));
    },
    async count(args?: { where?: FilterRecord }) {
      const store = getStore();
      return store.users.filter((u) => matchUser(u, args?.where, store)).length;
    },
    async create(args: { data: Partial<MemoryUser> & { role?: Role } }) {
      const store = getStore();
      const now = new Date();
      const newUser: MemoryUser = {
        id: args.data.id ?? randomUUID(),
        name: args.data.name ?? null,
        email: args.data.email ?? null,
        emailVerified: null,
        image: null,
        password: args.data.password ?? null,
        role: (args.data.role ?? 'WARGA') as Role,
        unitNumber: args.data.unitNumber ?? null,
        rumahId: args.data.rumahId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      store.users.push(newUser);
      return { ...newUser };
    },
    async update(args: { where: { id: string }; data: Partial<MemoryUser>; include?: FilterRecord }) {
      const store = getStore();
      const idx = store.users.findIndex((u) => u.id === args.where.id);
      if (idx === -1) throw new Error('User not found');
      const existing = store.users[idx];
      const updated: MemoryUser = {
        ...existing,
        ...args.data,
        updatedAt: new Date(),
      };
      store.users[idx] = updated;
      return attachUserRelations(updated, args.include, store);
    },
    async delete(args: { where: { id: string } }) {
      const store = getStore();
      const idx = store.users.findIndex((u) => u.id === args.where.id);
      if (idx === -1) throw new Error('User not found');
      const [deleted] = store.users.splice(idx, 1);
      return { ...deleted };
    },
    async deleteMany(args?: { where?: FilterRecord }) {
      const store = getStore();
      const before = store.users.length;
      store.users = store.users.filter((u) => !matchUser(u, args?.where, store));
      return { count: before - store.users.length };
    },
  },

  package: {
    async findMany(args?: {
      where?: FilterRecord;
      include?: FilterRecord;
      select?: FilterRecord;
      orderBy?: FilterRecord;
      take?: number;
    }) {
      const store = getStore();
      let list = store.packages.filter((p) => matchPackage(p, args?.where));
      const sortDir = args?.orderBy?.receivedAt === 'asc' ? 1 : -1;
      list.sort((a, b) => (a.receivedAt.getTime() - b.receivedAt.getTime()) * sortDir);
      if (typeof args?.take === 'number') {
        list = list.slice(0, args.take);
      }
      return list.map((p) => {
        const result: Record<string, unknown> = { ...p };
        if (args?.include?.security) {
          const sec = store.users.find((u) => u.id === p.securityId);
          result.security = sec ? { name: sec.name } : null;
        }
        if (args?.include?.warga) {
          const wg = p.wargaId ? store.users.find((u) => u.id === p.wargaId) ?? null : null;
          result.warga = wg ? { ...wg } : null;
        }
        return result;
      });
    },
    async groupBy(args: { by: string[]; where?: FilterRecord; _count?: FilterRecord }) {
      const store = getStore();
      const filtered = store.packages.filter((p) => matchPackage(p, args.where));
      const keyField = args.by[0] as keyof MemoryPackage;
      const groups = new Map<unknown, number>();
      filtered.forEach((p) => {
        const key = p[keyField];
        groups.set(key, (groups.get(key) ?? 0) + 1);
      });
      return Array.from(groups.entries()).map(([keyValue, count]) => ({
        [keyField]: keyValue,
        _count: { _all: count, id: count },
      }));
    },
    async aggregate(args: { where?: FilterRecord; _sum?: FilterRecord }) {
      const store = getStore();
      const filtered = store.packages.filter((p) => matchPackage(p, args.where));
      const penaltySum = filtered.reduce((acc, p) => acc + (p.penaltyAmount || 0), 0);
      return {
        _sum: {
          penaltyAmount: penaltySum,
        },
      };
    },
    async count(args?: { where?: FilterRecord }) {
      const store = getStore();
      return store.packages.filter((p) => matchPackage(p, args?.where)).length;
    },
    async create(args: { data: Partial<MemoryPackage> & { courierName: string; recipientName: string; unitNumber: string; securityId: string } }) {
      const store = getStore();
      // Validate foreign keys for data integrity
      const secExists = store.users.some((u) => u.id === args.data.securityId);
      if (!secExists) {
        throw new Error(`Foreign key constraint failed on field: securityId (${args.data.securityId})`);
      }
      if (args.data.wargaId) {
        const wargaExists = store.users.some((u) => u.id === args.data.wargaId);
        if (!wargaExists) {
          throw new Error(`Foreign key constraint failed on field: wargaId (${args.data.wargaId})`);
        }
      }
      const item: MemoryPackage = {
        id: args.data.id ?? randomUUID(),
        trackingNumber: args.data.trackingNumber ?? null,
        courierName: args.data.courierName,
        recipientName: args.data.recipientName,
        unitNumber: args.data.unitNumber,
        status: (args.data.status ?? 'RECEIVED_BY_SECURITY') as PackageStatus,
        receivedAt: args.data.receivedAt ? new Date(args.data.receivedAt) : new Date(),
        pickedUpAt: args.data.pickedUpAt ? new Date(args.data.pickedUpAt) : null,
        pickedUpBy: args.data.pickedUpBy ?? null,
        penaltyAmount: args.data.penaltyAmount ?? 0,
        penaltyPaid: args.data.penaltyPaid ?? false,
        wargaId: args.data.wargaId ?? null,
        securityId: args.data.securityId,
      };
      store.packages.unshift(item);
      return { ...item };
    },
    async createMany(args: { data: Array<Partial<MemoryPackage> & { courierName: string; recipientName: string; unitNumber: string; securityId: string }> }) {
      let count = 0;
      for (const d of args.data) {
        await memoryPrisma.package.create({ data: d });
        count++;
      }
      return { count };
    },
    async update(args: { where: { id: string }; data: Partial<MemoryPackage> }) {
      const store = getStore();
      const idx = store.packages.findIndex((p) => p.id === args.where.id);
      if (idx === -1) throw new Error('Package not found');
      const existing = store.packages[idx];
      const updated: MemoryPackage = {
        ...existing,
        ...args.data,
      };
      store.packages[idx] = updated;
      return { ...updated };
    },
    async updateMany(args: { where?: FilterRecord; data: Partial<MemoryPackage> }) {
      const store = getStore();
      let count = 0;
      store.packages = store.packages.map((p) => {
        if (matchPackage(p, args.where)) {
          count++;
          return { ...p, ...args.data };
        }
        return p;
      });
      return { count };
    },
    async delete(args: { where: { id: string } }) {
      const store = getStore();
      const idx = store.packages.findIndex((p) => p.id === args.where.id);
      if (idx === -1) throw new Error('Package not found');
      const [deleted] = store.packages.splice(idx, 1);
      return { ...deleted };
    },
    async deleteMany(args?: { where?: FilterRecord }) {
      const store = getStore();
      const before = store.packages.length;
      store.packages = store.packages.filter((p) => !matchPackage(p, args?.where));
      return { count: before - store.packages.length };
    },
  },

  activityLog: {
    async create(args: {
      data: {
        action: string;
        entityType: string;
        entityId: string;
        details?: string | null;
        userId?: string | null;
      };
    }) {
      const store = getStore();
      const log: MemoryActivityLog = {
        id: randomUUID(),
        action: args.data.action,
        entityType: args.data.entityType,
        entityId: args.data.entityId,
        details: args.data.details ?? null,
        userId: args.data.userId ?? null,
        createdAt: new Date(),
      };
      store.activityLogs.unshift(log);
      return { ...log };
    },
    async findMany(args?: {
      where?: FilterRecord;
      take?: number;
      skip?: number;
      orderBy?: FilterRecord;
      include?: FilterRecord;
    }) {
      const store = getStore();
      let list = store.activityLogs.filter((l) => {
        if (!args?.where) return true;
        if (args.where.entityType && l.entityType !== args.where.entityType) return false;
        if (args.where.entityId && l.entityId !== args.where.entityId) return false;
        return true;
      });
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const skip = args?.skip ?? 0;
      const take = args?.take ?? list.length;
      list = list.slice(skip, skip + take);
      return list.map((l) => {
        const res: Record<string, unknown> = { ...l };
        if (args?.include?.user) {
          const u = l.userId ? store.users.find((usr) => usr.id === l.userId) : null;
          res.user = u ? { name: u.name, email: u.email, role: u.role } : null;
        }
        return res;
      });
    },
    async deleteMany() {
      const store = getStore();
      const count = store.activityLogs.length;
      store.activityLogs = [];
      return { count };
    },
  },
};
