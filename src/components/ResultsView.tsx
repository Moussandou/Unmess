import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Music, Disc, Calendar, Play, Pause, AlertCircle } from 'lucide-react'
import { ClusterResult, TrackData } from '@/lib/analysis'

interface ResultsViewProps {
    clusters: ClusterResult[]
    onClustersUpdate?: (clusters: ClusterResult[]) => void
}

export default function ResultsView({ clusters, onClustersUpdate }: ResultsViewProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
    const [localClusters, setLocalClusters] = useState<ClusterResult[]>(clusters)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handlePlay = (trackId: string, url: string | null) => {
        if (!url) return;

        if (playingTrackId === trackId) {
            // Pause
            audioRef.current?.pause();
            setPlayingTrackId(null);
        } else {
            // Play new
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(url);
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.error("Audio play error", e));
            setPlayingTrackId(trackId);

            // Auto cleanup when ended
            audioRef.current.onended = () => setPlayingTrackId(null);
        }
    }

    const handleRenameCluster = (index: number, newLabel: string) => {
        const updatedClusters = [...localClusters];
        updatedClusters[index] = { ...updatedClusters[index], label: newLabel };
        setLocalClusters(updatedClusters);
        onClustersUpdate?.(updatedClusters);
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
            <div className="glass p-8 rounded-3xl border border-white/5 bg-black/40 text-left">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Résultats de l'Analyse</h2>
                        <p className="text-gray-400 mt-1">
                            {localClusters.reduce((acc, c) => acc + c.tracks.length, 0)} titres classés en {localClusters.length} groupes
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {localClusters.map((cluster, i) => (
                        <ClusterCard
                            key={i}
                            cluster={cluster}
                            index={i}
                            isExpanded={expandedIndex === i}
                            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
                            playingTrackId={playingTrackId}
                            onPlay={handlePlay}
                            onRename={(newLabel) => handleRenameCluster(i, newLabel)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function ClusterCard({ cluster, index, isExpanded, onToggle, playingTrackId, onPlay, onRename }: {
    cluster: ClusterResult,
    index: number,
    isExpanded: boolean,
    onToggle: () => void,
    playingTrackId: string | null,
    onPlay: (id: string, url: string | null) => void,
    onRename: (newLabel: string) => void
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(cluster.label || `Groupe ${index + 1}`);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartEdit = () => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const handleSaveEdit = () => {
        if (editValue.trim()) {
            onRename(editValue.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            setEditValue(cluster.label || `Groupe ${index + 1}`);
            setIsEditing(false);
        }
    };

    return (
        <motion.div
            layout
            className={`
                rounded-2xl border transition-all duration-300 overflow-hidden
                ${isExpanded
                    ? 'bg-white/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }
            `}
        >
            <button
                onClick={onToggle}
                className="w-full p-5 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                        ${isExpanded ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}
                    `}>
                        {index + 1}
                    </div>
                    <div>
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xl font-bold bg-white/10 text-white px-3 py-1 rounded-lg border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-white">
                                    {cluster.label || `Groupe ${index + 1}`}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEdit();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-purple-400 transition-colors"
                                    title="Renommer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Disc className="w-3 h-3" /> {cluster.tracks.length} titres
                        </p>
                    </div>
                </div>

                <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-white/20 text-white' : 'text-gray-500'}`}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5"
                    >
                        <div className="h-px w-full bg-white/5 mb-4" />

                        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {cluster.tracks.map((track) => {
                                const isPlaying = playingTrackId === track.id;
                                const hasPreview = !!track.previewUrl;

                                return (
                                    <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {/* Album Art with Play Button Overlay */}
                                            <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-all cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); onPlay(track.id, track.previewUrl || null); }}>

                                                {track.image ? (
                                                    <img src={track.image} alt={track.album} className={`w-full h-full object-cover transition-opacity ${isPlaying ? 'opacity-50' : 'group-hover:opacity-50'}`} />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                        <Music className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}

                                                <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                                    {isPlaying ? (
                                                        <Pause className="w-4 h-4 text-white fill-current" />
                                                    ) : hasPreview ? (
                                                        <Play className="w-4 h-4 text-white fill-current" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-purple-400' : 'text-white'}`}>{track.name}</p>
                                                    {!hasPreview && <span className="text-[10px] text-gray-600 border border-gray-700 px-1 rounded">No Audio</span>}
                                                </div>
                                                <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0 ml-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {track.releaseYear}
                                            </span>
                                            {track.genres && track.genres.length > 0 && (
                                                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                                    {track.genres[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-3">
                            {/* Future Export Buttons */}
                            {/* <button className="px-4 py-2 text-sm bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-colors">
                                 Exporter vers Spotify
                             </button> */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isExpanded && (
                <div className="px-5 pb-5 pt-0">
                    <p className="text-xs text-gray-500 truncate pl-[4.5rem]">
                        {cluster.tracks.slice(0, 5).map(t => t.artist).join(', ')}...
                    </p>
                </div>
            )}
        </motion.div>
    )
}
