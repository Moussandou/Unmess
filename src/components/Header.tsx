'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, User, LayoutDashboard, Sparkles } from 'lucide-react'
import { Space_Grotesk } from 'next/font/google'
import { useState } from 'react'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export default function Header() {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const [isHovered, setIsHovered] = useState(false)

    const isHome = pathname === '/'

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className={`
                max-w-7xl mx-auto rounded-full px-6 py-3 transition-all duration-300
                ${isHome ? 'bg-transparent' : 'bg-black/30 backdrop-blur-md border border-white/10'}
            `}>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-fuchsia-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                            <img src="/logo.png" alt="Unmess" className="w-full h-full object-cover p-1 relative z-10" />
                        </div>
                        <span className={`${spaceGrotesk.className} font-bold text-xl tracking-tight text-white group-hover:text-purple-200 transition-colors`}>
                            Unmess
                        </span>
                    </Link>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-4">
                        {status === 'authenticated' ? (
                            <>
                                {/* Dashboard Link (if not already there) */}
                                {pathname !== '/dashboard' && (
                                    <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                )}

                                {/* User Menu / Logout */}
                                <div className="flex items-center gap-4 bg-white/5 pr-2 pl-4 py-1.5 rounded-full border border-white/5">
                                    <span className="text-sm font-medium text-purple-200 hidden sm:block">
                                        {session.user?.name?.split(' ')[0]}
                                    </span>
                                    <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

                                    {/* Logout Button */}
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="group relative p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                        title="Déconnexion"
                                    >
                                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                                    </button>

                                    {/* Avatar */}
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-purple-500/30" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-purple-300" />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Guest State
                            !isHome && (
                                <button
                                    onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
                                    className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-transform"
                                >
                                    Connexion
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
