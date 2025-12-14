const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function fetchUserPlaylists(accessToken: string) {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch playlists');
    }

    return res.json();
}

export async function fetchPlaylist(playlistId: string, accessToken: string) {
    const res = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch playlist');
    }

    return res.json();
}

/**
 * Fetches ALL tracks from a playlist, handling pagination automatically.
 */
export async function getAllPlaylistTracks(playlistId: string, accessToken: string) {
    let tracks: any[] = [];
    let nextUrl = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=50`;

    while (nextUrl) {
        const res = await fetch(nextUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!res.ok) throw new Error('Failed to fetch tracks page');

        const data = await res.json();
        tracks = [...tracks, ...data.items];
        nextUrl = data.next;
    }

    // Filter out:
    // 1. Null tracks
    // 2. Local files (is_local: true) - Audio Features API doesn't support them
    // 3. Episodes (type !== 'track')
    return tracks
        .map(item => item.track)
        .filter(t => t && t.id && !t.is_local && t.type === 'track');
}

/**
 * Fetches audio features for a list of track IDs, handling batching (max 100 per call).
 */
export async function getAudioFeatures(trackIds: string[], accessToken: string) {
    const chunks = [];
    // Reduce batch size to 20 to be extremely safe against 414/403
    for (let i = 0; i < trackIds.length; i += 20) {
        chunks.push(trackIds.slice(i, i + 20));
    }

    let allFeatures: any[] = [];

    for (const chunk of chunks) {
        try {
            const url = `${SPOTIFY_API_BASE}/audio-features?ids=${chunk.join(',')}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                console.warn(`Features batch failed (${res.status}). Using defaults for ${chunk.length} tracks.`);
                // Return nulls or defaults to allow process to continue
                const defaults = chunk.map(() => ({
                    acousticness: 0.5, danceability: 0.5, energy: 0.5,
                    instrumentalness: 0, liveness: 0.5, speechiness: 0.5,
                    valence: 0.5, tempo: 120
                }));
                allFeatures = [...allFeatures, ...defaults];
                continue;
            }

            const data = await res.json();
            // Sometimes data.audio_features can contain nulls for specific tracks
            const safeFeatures = data.audio_features.map((f: any) => f || {
                acousticness: 0.5, danceability: 0.5, energy: 0.5,
                instrumentalness: 0, liveness: 0.5, speechiness: 0.5,
                valence: 0.5, tempo: 120
            });
            allFeatures = [...allFeatures, ...safeFeatures];

        } catch (e) {
            console.error("Chunk fetch error:", e);
            const defaults = chunk.map(() => ({
                acousticness: 0.5, danceability: 0.5, energy: 0.5,
                instrumentalness: 0, liveness: 0.5, speechiness: 0.5,
                valence: 0.5, tempo: 120
            }));
            allFeatures = [...allFeatures, ...defaults];
        }
    }

    return allFeatures;
}

/**
 * Fetches Artists details (including GENRES) for a list of Artist IDs.
 * Handles batching (max 50 IDs per request).
 */
export async function getArtists(artistIds: string[], accessToken: string) {
    const uniqueIds = Array.from(new Set(artistIds.filter(id => id))); // Dedup & clean
    const chunks = [];

    for (let i = 0; i < uniqueIds.length; i += 50) {
        chunks.push(uniqueIds.slice(i, i + 50));
    }

    let allArtists: any[] = [];

    for (const chunk of chunks) {
        const url = `${SPOTIFY_API_BASE}/artists?ids=${chunk.join(',')}`;
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                console.warn(`Artists batch failed (${res.status}). Continuing...`);
                continue;
            }

            const data = await res.json();
            allArtists = [...allArtists, ...data.artists];
        } catch (e) {
            console.error("Artist batch fetch error:", e);
        }
    }

    return allArtists;
}

export async function createPlaylist(accessToken: string, userId: string, name: string, description?: string) {
    const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description: description || 'Created by Unmess',
            public: false
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Playlist creation failed: ${JSON.stringify(error)}`);
    }

    return res.json();
}

export async function addTracksToPlaylist(accessToken: string, playlistId: string, trackUris: string[]) {
    // Spotify allows max 100 tracks per request
    const chunks = [];
    for (let i = 0; i < trackUris.length; i += 100) {
        chunks.push(trackUris.slice(i, i + 100));
    }

    for (const chunk of chunks) {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: chunk })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(`Failed to add tracks: ${JSON.stringify(error)}`);
        }
    }

    return true;
}
