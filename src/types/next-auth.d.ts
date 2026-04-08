import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Menambahkan custom fields ke tipe Session
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "SECURITY" | "WARGA";
      unitNumber?: string | null;
    } & DefaultSession["user"];
  }

  // Menambahkan custom fields ke tipe User
  interface User extends DefaultUser {
    id: string;
    role: "ADMIN" | "SECURITY" | "WARGA";
    unitNumber?: string | null;
  }
}

declare module "next-auth/jwt" {
  // Menambahkan custom fields ke tipe JWT
  interface JWT extends DefaultJWT {
    id: string;
    role: "ADMIN" | "SECURITY" | "WARGA";
    unitNumber?: string | null;
  }
}