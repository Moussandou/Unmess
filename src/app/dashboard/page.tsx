'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music, Link as LinkIcon, FileSpreadsheet, Search, Loader2 } from "lucide-react"

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'library' | 'link' | 'file'>('library')

    const [playlists, setPlaylists] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated" && activeTab === 'library' && session?.accessToken) {
            setLoading(true)
            fetch(`https://api.spotify.com/v1/me/playlists?limit=20`, {
                headers: { Authorization: `Bearer ${session.accessToken}` }
            })
                .then(res => res.json())
                .then(data => {
                    setPlaylists(data.items || [])
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        }
    }, [status, activeTab, session])

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050508]">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050508] p-6">
            {/* Background Ambience matches Home */}
            <div className="fixed inset-0 w-full h-full pointer-events-none">
                <div className="noise-bg" />
                <div className="mesh-gradient" />
            </div>

            <div className="relative z-10 container mx-auto max-w-5xl pt-10">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold font-sans tracking-tight">
                        Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">{session?.user?.name || "Music Lover"}</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        {session?.user?.image && (
                            <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
                        )}
                    </div>
                </header>

                {/* Input Method Tabs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <MethodCard
                        active={activeTab === 'library'}
                        onClick={() => setActiveTab('library')}
                        icon={<Music />}
                        title="Ma Bibliothèque"
                        desc="Tes playlists Spotify"
                    />
                    <MethodCard
                        active={activeTab === 'link'}
                        onClick={() => setActiveTab('link')}
                        icon={<LinkIcon />}
                        title="Lien Public"
                        desc="Coller une URL"
                    />
                    <MethodCard
                        active={activeTab === 'file'}
                        onClick={() => setActiveTab('file')}
                        icon={<FileSpreadsheet />}
                        title="Fichier CSV"
                        desc="Import manuel"
                    />
                </div>

                {/* Content Area */}
                <div className="glass min-h-[400px] rounded-3xl p-8 border border-white/5 bg-black/20 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'library' && (
                            <motion.div
                                key="library"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    Choisis une playlist source
                                </h2>

                                {loading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {playlists.map(playlist => (
                                            <button
                                                key={playlist.id}
                                                onClick={() => router.push(`/analysis?source=spotify&id=${playlist.id}`)}
                                                className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all text-left"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                                {playlist.images?.[0]?.url && (
                                                    <img src={playlist.images[0].url} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                )}
                                                <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                                                    <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                                                    <p className="text-xs text-gray-400">{playlist.tracks?.total} titres</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'link' && (
                            <motion.div
                                key="link"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center justify-center h-full min-h-[300px]"
                            >
                                <input
                                    type="text"
                                    placeholder="https://open.spotify.com/playlist/..."
                                    className="w-full max-w-lg bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                                />
                            </motion.div>
                        )}

                        {activeTab === 'file' && (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors"
                            >
                                <FileSpreadsheet className="w-12 h-12 text-gray-500 mb-4" />
                                <p className="text-gray-400">Glisse ton fichier CSV ici</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

function MethodCard({ active, onClick, icon, title, desc }: any) {
    return (
        <button
            onClick={onClick}
            className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${active ? 'bg-white/10 border-purple-500/50 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${active ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                {icon}
            </div>
            <h3 className={`text-lg font-bold mb-1 ${active ? 'text-white' : 'text-gray-200'}`}>{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
        </button>
    )
}
