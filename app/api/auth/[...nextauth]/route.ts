import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // Ambil instance prisma yang sudah di-singleton-kan di lib/prisma.ts
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Sekarang kita pakai 'prisma' yang sudah di-import di atas
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) return null;

          // Cek apakah password valid
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) return null;

          // Return data user yang bakal masuk ke session
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          };
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };