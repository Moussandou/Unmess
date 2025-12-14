'use client'

import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAllPlaylistTracks, getAudioFeatures, fetchPlaylist } from "@/lib/spotify"
import { performClustering, TrackData, ClusterResult } from "@/lib/analysis"
import { Loader2, CheckCircle2, Brain, Music, AlertCircle } from "lucide-react"

export default function AnalysisPage() {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const router = useRouter()

    // State
    const [progressStep, setProgressStep] = useState<0 | 1 | 2 | 3>(0) // 0: Init, 1: Tracks, 2: Features, 3: Done
    const [statusMsg, setStatusMsg] = useState("Initialisation...")
    const [totalTracks, setTotalTracks] = useState(0)
    const [clusters, setClusters] = useState<ClusterResult[]>([])
    const [error, setError] = useState<string | null>(null)
    const [playlistName, setPlaylistName] = useState("")

    useEffect(() => {
        if (status === "unauthenticated") return router.push("/")
        if (status !== "authenticated" || !session?.accessToken) return

        const source = searchParams.get('source')
        const id = searchParams.get('id')

        if (source === 'spotify' && id) {
            startAnalysis(id, session.accessToken)
        }
    }, [status, session, searchParams])

    async function startAnalysis(playlistId: string, token: string) {
        try {
            // Step 1: Fetch Playlist Info & Tracks
            setProgressStep(1)
            setStatusMsg("Immobilisation des cibles (Récupération des titres)...")

            const [playlistInfo, tracksRaw] = await Promise.all([
                fetchPlaylist(playlistId, token),
                getAllPlaylistTracks(playlistId, token)
            ])

            setPlaylistName(playlistInfo.name)
            setTotalTracks(tracksRaw.length)

            if (tracksRaw.length === 0) throw new Error("Cette playlist est vide.")

            // Step 2: Fetch Audio Features
            setProgressStep(2)
            setStatusMsg(`Analyse neurale en cours (${tracksRaw.length} titres)...`)

            const trackIds = tracksRaw.map(t => t.id)
            const featuresRaw = await getAudioFeatures(trackIds, token)

            // Merge Data
            const tracks: TrackData[] = tracksRaw.map((t, i) => ({
                id: t.id,
                name: t.name,
                artist: t.artists[0]?.name || 'Unknown',
                features: featuresRaw[i]
            })).filter(t => t.features) // Filter out tracks with no features (local files etc)

            // Step 3: Clustering
            setStatusMsg("Organisation du chaos...")
            // Small delay to let UI breathe
            await new Promise(r => setTimeout(r, 800))

            const results = performClustering(tracks, Math.min(6, Math.max(3, Math.floor(tracks.length / 20)))) // Dynamic K
            setClusters(results)
            setProgressStep(3)

        } catch (err: any) {
            console.error(err)
            setError(err.message || "Une erreur est survenue")
        }
    }

    return (
        <div className="min-h-screen bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            <div className="fixed inset-0 w-full h-full pointer-events-none">
                <div className="noise-bg" />
                <div className="mesh-gradient opacity-30" />
            </div>

            <div className="relative z-10 max-w-2xl w-full">
                {error ? (
                    <div className="glass p-8 rounded-3xl border border-red-500/20 bg-red-500/10 text-red-200">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Erreur Critique</h2>
                        <p>{error}</p>
                        <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            Retour
                        </button>
                    </div>
                ) : progressStep < 3 ? (
                    // Loading State
                    <div className="space-y-8">
                        <div className="w-24 h-24 mx-auto relative">
                            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <Brain className="absolute inset-0 m-auto text-purple-400 w-10 h-10 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{statusMsg}</h2>
                            {playlistName && <p className="text-purple-300">Playlist : {playlistName}</p>}
                        </div>

                        {/* Simple Steps */}
                        <div className="flex justify-center gap-2">
                            <StepIndicator active={progressStep >= 1} />
                            <StepIndicator active={progressStep >= 2} />
                            <StepIndicator active={progressStep >= 3} />
                        </div>
                    </div>
                ) : (
                    // Results Preview (Temporary for Phase 4)
                    <div className="glass p-8 rounded-3xl border border-white/5 bg-black/40 text-left">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Analyse Terminée</h2>
                                <p className="text-gray-400">{totalTracks} titres triés en {clusters.length} clusters</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {clusters.map((cluster, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-purple-300">Groupe {i + 1}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{cluster.tracks.length} titres</span>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        {cluster.tracks.slice(0, 3).map(t => (
                                            <li key={t.id} className="truncate">• {t.name}</li>
                                        ))}
                                        {cluster.tracks.length > 3 && <li className="text-xs italic opacity-50">+{cluster.tracks.length - 3} autres...</li>}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StepIndicator({ active }: { active: boolean }) {
    return (
        <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${active ? 'bg-purple-500' : 'bg-white/10'}`} />
    )
}
