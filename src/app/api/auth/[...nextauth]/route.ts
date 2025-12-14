import NextAuth, { AuthOptions } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

const scopes = [
    "user-read-email",
    "user-read-private", // Added for broader access
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-library-read"
].join(" ")

export const authOptions: AuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: {
                // FORCE the consent dialog to fix stale token issues
                // and add show_dialog: true to break the auto-login loop
                params: {
                    scope: 'user-read-email user-read-private playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private',
                    show_dialog: 'true'
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = account.expires_at
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            return session
        },
    },
    pages: {
        signIn: '/',
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
