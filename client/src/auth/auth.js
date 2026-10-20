import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

async function refreshIdToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error ?? "Failed to refresh token");

  return {
    idToken: data.id_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in - 60,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      if (Date.now() / 1000 < token.expiresAt) {
        return token;
      }

      try {
        const refreshed = await refreshIdToken(token.refreshToken);
        return {
          ...token,
          idToken: refreshed.idToken,
          expiresAt: refreshed.expiresAt,
        };
      } catch (err) {
        console.error("Failed to refresh Google ID token:", err);
        return { ...token, error: "RefreshTokenError" };
      }
    },

    async session({ session, token }) {
      session.idToken = token.idToken;
      session.error = token.error;
      return session;
    },
  },
});
