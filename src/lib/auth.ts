import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "./prisma"
import { Adapter } from "next-auth/adapters"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [

    ...(process.env.AUTO_LOGIN === 'true' ? [
      CredentialsProvider({
        name: "Automatic Login",
        credentials: {},
        async authorize() {
          // Always return a mock user when auto-login is enabled
          // Upsert the user in the database so foreign keys (like creating a Tribute) won't fail
          const user = await prisma.user.upsert({
            where: { email: "dev@example.com" },
            update: {},
            create: {
              email: "dev@example.com",
              name: "Dev User",
            },
          });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }
      })
    ] : []),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),

  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub
      }
      if (session?.user && token.id) {
        session.user.id = token.id as string;
      }
      return session
    },
  },
}
