import { kmeans } from 'ml-kmeans';

export interface TrackData {
    id: string;
    name: string;
    artist: string;
    artistIds: string[];
    album: string;
    releaseYear: number;
    popularity: number;
    genres: string[]; // From Artist API
    image?: string; // Album Artwork
    previewUrl?: string | null; // 30s Audio Preview
}

export interface ClusterResult {
    centroid: number[]; // Now represents [Year, Popularity, ...GenreCategories]
    tracks: TrackData[];
    label?: string; // e.g. "90s Rock"
}

// 1. Define Micro-Genres for Better Resolution (60+ categories)
const MICRO_GENRES = [
    // Pop / Mainstream
    'pop', 'indie pop', 'synth-pop', 'electropop', 'k-pop', 'europop',
    // Rock / Alt
    'rock', 'indie rock', 'alternative', 'punk', 'metal', 'hard rock', 'grunge', 'psychedelic', 'post-punk', 'new wave',
    // Hip Hop / Urban
    'hip hop', 'rap', 'trap', 'drill', 'r&b', 'soul', 'neo-soul', 'funk', 'urban', 'grime',
    // Electronic / Dance
    'electronic', 'house', 'techno', 'trance', 'disco', 'edm', 'dubstep', 'drum and bass', 'ambient', 'synthwave', 'lo-fi',
    // Global / World
    'latin', 'reggaeton', 'afrobeats', 'dancehall', 'salsa', 'french', 'uk', 'german', 'spanish',
    // Mood / Roots
    'jazz', 'blues', 'country', 'folk', 'acoustic', 'classical', 'soundtrack', 'lo-fi', 'chill'
];

/**
 * Converts a list of micro-genres (e.g. "french indie pop") into a One-Hot vector of MICRO_GENRES.
 * Handles overlaps (e.g. "indie pop" triggers both "indie pop" and "pop" indices).
 */
function getGenreVector(trackGenres: string[]): number[] {
    const vector = new Array(MICRO_GENRES.length).fill(0);
    const uniqueTrackGenres = Array.from(new Set(trackGenres.map(g => g.toLowerCase())));

    uniqueTrackGenres.forEach(genre => {
        MICRO_GENRES.forEach((micro, index) => {
            // Precise matching: "trap" should match "trap music" or "atlanta trap"
            if (genre.includes(micro)) {
                vector[index] = 1;
            }
        });
    });

    return vector;
}

/**
 * Normalizes Year (0-1) based on a reasonable range (1960 - CurrentYear).
 */
function normalizeYear(year: number): number {
    const minYear = 1960;
    const maxYear = new Date().getFullYear();
    const clamped = Math.max(minYear, Math.min(year, maxYear));
    return (clamped - minYear) / (maxYear - minYear);
}

/**
 * Normalizes Popularity (0-1).
 */
function normalizePop(pop: number): number {
    return pop / 100;
}

export function performClustering(tracks: TrackData[], k: number): ClusterResult[] {
    if (!tracks.length) return [];

    console.log(`Clustering ${tracks.length} tracks with Granular Metadata Engine...`);

    // 1. Build Feature Vectors
    const vectors = tracks.map(track => {
        // Temporal Weight: 1.0 (Reduced to prevent splitting same-genre tracks just because of date)
        const yearFeat = normalizeYear(track.releaseYear) * 1.0;

        // Popularity: 0.1 (Almost negligible, just to separate huge hits from obscure tracks slightly)
        const popFeat = (track.popularity / 100) * 0.1;

        // Genre Weight: 4.0 (HEAVILY boosted to be the primary factor)
        const genreFeat = getGenreVector(track.genres).map(v => v * 4.0);

        return [yearFeat, popFeat, ...genreFeat];
    });

    // 2. Perform K-Means
    const safeK = Math.min(k, tracks.length);
    const result = kmeans(vectors, safeK, { initialization: 'kmeans++' });

    // 3. Group tracks
    const clusters: ClusterResult[] = Array.from({ length: safeK }, (_, i) => ({
        centroid: result.centroids[i],
        tracks: []
    }));

    result.clusters.forEach((clusterIndex, trackIndex) => {
        if (clusters[clusterIndex]) {
            clusters[clusterIndex].tracks.push(tracks[trackIndex]);
        }
    });

    // 4. Advanced Labeling
    return clusters.filter(c => c.tracks.length > 0).map(cluster => {
        // Avg Year
        const avgYear = cluster.tracks.reduce((sum, t) => sum + t.releaseYear, 0) / cluster.tracks.length;
        const decade = Math.floor(avgYear / 10) * 10;

        // Find dominant Micro-Genres
        const allGenres = cluster.tracks.flatMap(t => t.genres);
        const genreCounts: Record<string, number> = {};

        // Count occurrences of our specific MICRO list
        allGenres.forEach(g => {
            MICRO_GENRES.forEach(micro => {
                if (g.includes(micro)) {
                    genreCounts[micro] = (genreCounts[micro] || 0) + 1;
                }
            });
        });

        // Get Top 2 Genres
        const sortedGenres = Object.entries(genreCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name]) => name);

        const primary = sortedGenres[0] ? sortedGenres[0].charAt(0).toUpperCase() + sortedGenres[0].slice(1) : "Mix";
        const secondary = sortedGenres[1];

        // Format Label
        let label = `${primary}`;
        if (secondary && secondary !== primary && !primary.includes(secondary) && !secondary.includes(primary)) {
            label += ` & ${secondary.charAt(0).toUpperCase() + secondary.slice(1)}`;
        }

        cluster.label = `${label} ${decade}s`;
        return cluster;
    });
}
