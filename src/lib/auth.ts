import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Menghubungkan NextAuth dengan Prisma
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt", // Kita pakai JWT karena menggunakan Credentials (email/password)
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        // Cari user di database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Email tidak terdaftar atau password salah");
        }

        // Cek kecocokan password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        // Kembalikan data user untuk disimpan di sesi
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
    // Menyimpan data ke dalam token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unitNumber = user.unitNumber;
      }
      return token;
    },
    // Menyalin data dari token JWT ke Sesi yang bisa diakses Frontend
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