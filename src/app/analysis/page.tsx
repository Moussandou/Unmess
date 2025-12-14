'use client'

import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAllPlaylistTracks, getArtists, fetchPlaylist } from "@/lib/spotify"
import { performClustering, TrackData, ClusterResult } from "@/lib/analysis"
import { Loader2, CheckCircle2, Brain, Music, AlertCircle } from "lucide-react"
import ResultsView from "@/components/ResultsView"

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

            // Step 2: Fetch Artist Metadata (Genres & Popularity)
            setProgressStep(2)
            setStatusMsg(`Analyse contextuelle (${tracksRaw.length} titres)...`)

            // Extract all unique Artist IDs
            const allArtistIds = tracksRaw.flatMap(t => t.artists.map((a: any) => a.id)).filter(id => id);
            const artistsData = await getArtists(allArtistIds, token);

            // Create a Map for quick lookup
            const artistMap = new Map(artistsData.map((a: any) => [a.id, a]));

            // Merge Data
            const tracks: TrackData[] = tracksRaw.map((t) => {
                const mainArtistId = t.artists[0]?.id;
                const mainArtist = artistMap.get(mainArtistId);

                // Release Date Parsing (Handling "YYYY", "YYYY-MM", "YYYY-MM-DD")
                const releaseYear = t.album.release_date ? parseInt(t.album.release_date.split('-')[0]) : 2000;

                return {
                    id: t.id,
                    name: t.name,
                    artist: t.artists[0]?.name || 'Unknown',
                    artistIds: t.artists.map((a: any) => a.id),
                    album: t.album.name,
                    releaseYear: releaseYear || 2000,
                    popularity: t.popularity || 0,
                    genres: mainArtist?.genres || [], // The secret sauce 🌶️
                    image: t.album.images?.[0]?.url || t.album.images?.[1]?.url || null,
                    previewUrl: t.preview_url
                };
            });

            // Step 3: Clustering
            setStatusMsg("Organisation temporelle et stylistique...")
            // Small delay to let UI breathe
            await new Promise(r => setTimeout(r, 800))

            // Use Metadata Engine
            // Increased K to max 8 for better granularity
            const results = performClustering(tracks, Math.min(8, Math.max(4, Math.floor(tracks.length / 15))))
            setClusters(results)
            setProgressStep(3)

        } catch (err: any) {
            console.error(err)
            setError(err.message || "Une erreur est survenue");
        }
    }

    return (
        <div className="min-h-screen bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            <div className="fixed inset-0 w-full h-full pointer-events-none">
                <div className="noise-bg" />
                <div className="mesh-gradient opacity-30" />
            </div>

            <div className="relative z-10 max-w-2xl w-full">
                {error === "SPOTIFY_403_ACCESS_DENIED" ? (
                    <div className="glass p-8 rounded-3xl border border-red-500/20 bg-red-500/10 text-left">
                        <div className="flex items-center gap-4 mb-4 text-red-400">
                            <AlertCircle className="w-10 h-10" />
                            <h2 className="text-2xl font-bold">Accès Refusé (403)</h2>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Spotify bloque l'accès aux "Audio Features". C'est une sécurité standard pour les Apps en développement.
                        </p>

                        <div className="bg-black/40 p-6 rounded-xl border border-white/5 space-y-4 mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                🔧 La Solution (à faire 1 seule fois) :
                            </h3>
                            <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
                                <li>Va sur <a href="https://developer.spotify.com/dashboard" target="_blank" className="text-purple-400 underline">Spotify Developer Dashboard</a></li>
                                <li>Vérifie que tu es sur l'app avec le Client ID : <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white text-xs">{process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID_PREVIEW || "718e...c3e1"}</span></li>
                                <li>Va dans <strong>Settings</strong> &rarr; <strong>User Management</strong></li>
                                <li>Ajoute ton email : <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">{session?.user?.email}</span></li>
                                <li>Attends 30s et clique sur <strong>Réessayer</strong></li>
                            </ol>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => window.location.reload()} className="flex-1 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                                Réessayer
                            </button>
                            <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full transition-colors">
                                Retour Dashboard
                            </button>
                        </div>
                    </div>
                ) : error ? (
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

                        <div className="space-y-8 text-center">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{progressMessage}</h2>
                                <p className="text-gray-400">{progressSubMessage}</p>
                            </div>

                            {/* Simple Steps */}
                            <div className="flex justify-center gap-2">
                                <StepIndicator active={progressStep >= 1} />
                                <StepIndicator active={progressStep >= 2} />
                                <StepIndicator active={progressStep >= 3} />
                            </div>
                        </div>
                )}

                        {/* Results Interface */}
                        {progressStep === 3 && clusters && (
                            <ResultsView clusters={clusters} onClustersUpdate={setClusters} />
                        )}
                    </div>
        </div>
            )
}

            function StepIndicator({active}: {active: boolean }) {
    return (
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${active ? 'bg-purple-500' : 'bg-white/10'}`} />
            )
}
