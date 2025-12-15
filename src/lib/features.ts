import { TrackData, ClusterResult } from './analysis'

/**
 * Extract all tracks by a specific artist
 */
export function extractByArtist(clusters: ClusterResult[], artistName: string): TrackData[] {
    const allTracks = clusters.flatMap(c => c.tracks)
    return allTracks.filter(track =>
        track.artist.toLowerCase() === artistName.toLowerCase() ||
        track.artist.toLowerCase().includes(artistName.toLowerCase())
    )
}

/**
 * Detect duplicates (same name + artist)
 */
export function detectDuplicates(tracks: TrackData[]): TrackData[][] {
    const groups = new Map<string, TrackData[]>()

    tracks.forEach(track => {
        const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(track)
    })

    // Return only groups with 2+ tracks
    return Array.from(groups.values()).filter(group => group.length > 1)
}

/**
 * Remove duplicates keeping most popular
 */
export function removeDuplicates(tracks: TrackData[], keepMostPopular = true): TrackData[] {
    const seen = new Map<string, TrackData>()

    tracks.forEach(track => {
        const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`

        if (!seen.has(key)) {
            seen.set(key, track)
        } else {
            const existing = seen.get(key)!
            if (keepMostPopular && track.popularity > existing.popularity) {
                seen.set(key, track)
            } else if (!keepMostPopular && track.releaseYear > existing.releaseYear) {
                seen.set(key, track)
            }
        }
    })

    return Array.from(seen.values())
}

/**
 * Calculate energy score (0-100) based on metadata
 */
export function calculateEnergy(track: TrackData): number {
    // Heuristic: newer + more popular = higher energy
    const yearComponent = Math.min(100, ((track.releaseYear - 1950) / 75) * 100)
    const popularityComponent = track.popularity

    return Math.round((yearComponent + popularityComponent) / 2)
}

/**
 * Get genre distribution
 */
export function getGenreDistribution(clusters: ClusterResult[]): { genre: string; count: number }[] {
    const genreCount = new Map<string, number>()

    clusters.forEach(cluster => {
        cluster.tracks.forEach(track => {
            track.genres.forEach(genre => {
                genreCount.set(genre, (genreCount.get(genre) || 0) + 1)
            })
        })
    })

    return Array.from(genreCount.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // Top 20
}

/**
 * Find intersection between two playlists
 */
export function findIntersection(tracks1: TrackData[], tracks2: TrackData[]): TrackData[] {
    const ids2 = new Set(tracks2.map(t => t.id))
    return tracks1.filter(t => ids2.has(t.id))
}

/**
 * Find tracks unique to first playlist
 */
export function findDifference(tracks1: TrackData[], tracks2: TrackData[]): TrackData[] {
    const ids2 = new Set(tracks2.map(t => t.id))
    return tracks1.filter(t => !ids2.has(t.id))
}
