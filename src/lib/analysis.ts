import { kmeans } from 'ml-kmeans';

export interface TrackData {
    id: string;
    name: string;
    artist: string;
    features: {
        acousticness: number;
        danceability: number;
        energy: number;
        instrumentalness: number;
        liveness: number;
        speechiness: number;
        valence: number;
        tempo: number;
    };
}

export interface ClusterResult {
    clusterIndex: number;
    centroid: number[];
    tracks: TrackData[];
}

/**
 * Normalizes audio features to a 0-1 range (especially tempo).
 */
function normalizeFeatures(features: TrackData['features']): number[] {
    // Tempo is usually 50-200, we map it roughly to 0-1 by dividing by 200
    // Other features are already 0-1
    return [
        features.acousticness,
        features.danceability,
        features.energy,
        features.instrumentalness,
        features.liveness,
        features.speechiness,
        features.valence,
        features.tempo / 200
    ];
}

/**
 * Performs K-Means clustering on the tracks.
 * @param tracks List of tracks with audio features
 * @param k Number of clusters (default 4, or dynamic based on size)
 */
export function performClustering(tracks: TrackData[], k: number = 4): ClusterResult[] {
    if (tracks.length < k) {
        // Fallback if not enough tracks
        return [{ clusterIndex: 0, centroid: [], tracks }];
    }

    const data = tracks.map(t => normalizeFeatures(t.features));

    // Execute K-Means
    const result = kmeans(data, k, { initialization: 'kmeans++' });

    // Group tracks by cluster
    const clusters: ClusterResult[] = Array.from({ length: k }, (_, i) => ({
        clusterIndex: i,
        centroid: result.centroids[i],
        tracks: []
    }));

    result.clusters.forEach((clusterIndex, trackIndex) => {
        clusters[clusterIndex].tracks.push(tracks[trackIndex]);
    });

    return clusters.filter(c => c.tracks.length > 0);
}
