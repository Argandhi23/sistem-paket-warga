import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Menambahkan custom fields ke tipe Session
  interface Session {
    user: {
      id: string;
      role: string;
      unitNumber?: string | null;
    } & DefaultSession["user"];
  }

  // Menambahkan custom fields ke tipe User
  interface User {
    role: string;
    unitNumber?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    unitNumber?: string | null;
  }
}