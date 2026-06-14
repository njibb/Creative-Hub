import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Tambahin check biar prisma client gak kedouble pas hot-reload
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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