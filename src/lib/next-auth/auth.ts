import { login } from "@/domains/auth/actions";
import { Permission, Role } from "@/domains/auth/enums";
import type { NextAuthOptions } from "next-auth";
import { getServerSession as getSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const auth = await login({
          email: credentials.email,
          password: credentials.password,
        });
        const permissions: Permission[] = [];

        return {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.name,
          role: Role.member,
          permissions,
          token: auth.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.token = token.token;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Mesmo prazo do JWT da API
  },
};

export async function getServerSession() {
  return getSession(authOptions);
}

export async function getPermissionsFromSession() {
  const session = await getServerSession();
  return session?.user?.permissions || [];
}
