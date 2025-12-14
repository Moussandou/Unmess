import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageTransition from '@/components/PageTransition'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Unmess - Spotify Playlist Organizer',
    description: 'Organize your messy Spotify playlists with AI',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <Header />
                    <PageTransition>
                        <main className="min-h-screen">
                            {children}
                        </main>
                    </PageTransition>
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
