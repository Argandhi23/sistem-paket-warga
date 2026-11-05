import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

import prisma from "./prisma";
import { isRateLimited, recordFailedAttempt, clearRateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const forwardedFor = req?.headers?.["x-forwarded-for"];
        const ip = typeof forwardedFor === "string" ? forwardedFor.split(",")[0] : "unknown_ip";

        // 🛡️ HARDENING SDPR-67: Cek apakah IP sedang di-banned
        if (isRateLimited(ip)) {
          throw new Error("Terlalu banyak percobaan gagal. Silakan coba lagi dalam 15 menit.");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        // 🛡️ Anti-Enumeration + Record Kegagalan
        if (!user || !user.password) {
          recordFailedAttempt(ip);
          throw new Error("Kredensial tidak valid");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        // 🛡️ Anti-Enumeration + Record Kegagalan
        if (!isPasswordValid) {
          recordFailedAttempt(ip);
          throw new Error("Kredensial tidak valid");
        }

        clearRateLimit(ip);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          unitNumber: user.unitNumber ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unitNumber = user.unitNumber ?? null;
      } else if (token.unitNumber === undefined && token.role === "WARGA" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { unitNumber: true },
        });
        token.unitNumber = dbUser?.unitNumber ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.unitNumber = token.unitNumber ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
