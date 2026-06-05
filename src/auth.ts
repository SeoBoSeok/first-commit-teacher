import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createUser,
  findUserByDiscordId,
  findUserByEmail,
  findUserById,
  updateUser,
} from "@/lib/store";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const nextAuthInstance = NextAuth({
  // No DB adapter — JWT only. The lookup helpers in @/lib/store back our user
  // identity so Auth.js can stay stateless while we still persist accounts.
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await findUserByEmail(email);
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Block email/password sign-in until the address has been verified.
        // Auth.js surfaces the thrown message via the CredentialsSignin error.
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.nickname ?? user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Discord, link/create the stored user by Discord providerAccountId.
      if (account?.provider === "discord" && account.providerAccountId) {
        let stored = await findUserByDiscordId(account.providerAccountId);
        if (!stored) {
          // If the same email already has a credentials account, link to it.
          if (user.email) {
            const byEmail = await findUserByEmail(user.email);
            if (byEmail) {
              stored = await updateUser(byEmail.id, {
                discordId: account.providerAccountId,
                image: user.image ?? byEmail.image,
                name: user.name ?? byEmail.name,
              });
            }
          }
          if (!stored) {
            stored = await createUser({
              email: user.email ?? null,
              // OAuth providers (Discord) already verified the email — auto-verify.
              emailVerified: new Date().toISOString(),
              name: user.name ?? null,
              image: user.image ?? null,
              discordId: account.providerAccountId,
              // discord display_name / global_name preferred over username
              nickname:
                (profile as Record<string, unknown> | undefined)?.global_name as string | undefined ??
                user.name ??
                null,
            });
          } else if (!stored.emailVerified) {
            // Existing user logging in via Discord for the first time → mark verified
            stored = (await updateUser(stored.id, {
              emailVerified: new Date().toISOString(),
            })) ?? stored;
          }
        }
        // Stamp the stored id on the user object so jwt() picks it up.
        user.id = stored!.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      if (token.uid) {
        const stored = await findUserById(token.uid as string);
        if (stored) {
          token.nickname = stored.nickname ?? null;
          token.email = stored.email ?? null;
          token.picture = stored.image ?? null;
          if (stored.nickname) token.name = stored.nickname;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
        session.user.nickname = (token.nickname as string | null) ?? null;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth } = nextAuthInstance;
export const { GET, POST } = handlers;
