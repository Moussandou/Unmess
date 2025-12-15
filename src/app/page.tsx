'use client'

import { useEffect, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Music, Brain, Sparkles, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export default function Home() {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const y2 = useTransform(scrollY, [0, 500], [0, -150])

    return (
        <main className="min-h-screen relative overflow-hidden selection:bg-purple-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 w-full h-full pointer-events-none">
                <div className="noise-bg" />
                <div className="mesh-gradient" />
                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: 360
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 100, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/10 blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 min-h-screen flex flex-col">
                {/* Header is global now */}

                {/* Hero Section */}
                <div className="flex-1 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Text Content */}
                    <motion.div
                        style={{ y: y1 }}
                        className="flex-1 text-center lg:text-left space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-purple-300"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>Version Bêta Disponible</span>
                        </motion.div>

                        <h1 className="text-6xl lg:text-8xl font-bold leading-[0.9] tracking-tighter mix-blend-overlay opacity-90">
                            <motion.span
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40"
                            >
                                Organize
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className="block italic font-serif text-purple-400"
                            >
                                The Chaos
                            </motion.span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-lg text-gray-400 max-w-md mx-auto lg:mx-0 leading-relaxed"
                        >
                            Transforme ta playlist fourre-tout en collections thématiques parfaites grâce à notre IA d'analyse audio.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
                                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10">Connecter Spotify</span>
                                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-fuchsia-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <Link
                                href="/dashboard?tab=link"
                                className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium backdrop-blur-sm inline-block"
                            >
                                Coller un lien
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Abstract Visual */}
                    <motion.div
                        style={{ y: y2 }}
                        className="flex-1 relative w-full aspect-square max-w-[500px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            <Image
                                src="/hero-shape.png"
                                alt="Abstract form"
                                width={600}
                                height={600}
                                priority
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </motion.div>

                        {/* Floating Cards Details */}
                        <FloatingCard
                            icon={<Music className="w-4 h-4" />}
                            label="127 Titres"
                            delay={1.2}
                            className="absolute top-10 -left-10"
                        />
                        <FloatingCard
                            icon={<Brain className="w-4 h-4 text-purple-400" />}
                            label="Analysé par IA"
                            delay={1.4}
                            className="absolute bottom-20 -right-4"
                        />
                    </motion.div>
                </div>
            </div>
        </main >
    )
}

function FloatingCard({ icon, label, delay, className }: { icon: React.ReactNode, label: string, delay: number, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8 }}
            className={`glass px-4 py-3 rounded-xl flex items-center gap-3 border border-white/5 bg-black/40 backdrop-blur-md ${className}`}
        >
            <div className="p-2 rounded-lg bg-white/5">
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-200">{label}</span>
        </motion.div>
    )
}
