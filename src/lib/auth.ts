import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

// ✅ FIX: Gunakan relative path (./) alih-alih alias (@/lib/)
import prisma from "./prisma";
import { isRateLimited, recordFailedAttempt, clearRateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" }
      },
      // Tambahkan 'req' sebagai parameter kedua untuk mendapatkan informasi IP
      async authorize(credentials, req) {
        // Ambil IP address pengguna (Biasanya disediakan oleh header Next.js / Vercel)
        const forwardedFor = req?.headers?.["x-forwarded-for"];
        const ip = typeof forwardedFor === "string" ? forwardedFor.split(",")[0] : "unknown_ip";

        // 🛡️ HARDENING SDPR-67: Cek apakah IP sedang di-banned
        if (isRateLimited(ip)) {
          throw new Error("Terlalu banyak percobaan gagal. Silakan coba lagi dalam 15 menit.");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 🛡️ Anti-Enumeration + Record Kegagalan
        if (!user || !user.password) {
          recordFailedAttempt(ip); // Catat IP gagal
          throw new Error("Kredensial tidak valid");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        // 🛡️ Anti-Enumeration + Record Kegagalan
        if (!isPasswordValid) {
          recordFailedAttempt(ip); // Catat IP gagal
          throw new Error("Kredensial tidak valid");
        }

        // 🛡️ Jika berhasil login, bersihkan catatan kegagalannya
        clearRateLimit(ip);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          unitNumber: user.unitNumber,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unitNumber = user.unitNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.unitNumber = token.unitNumber;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};