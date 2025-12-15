/**
 * Fetch multiple tracks by IDs (for CSV import)
 */
export async function getTracks(trackIds: string[], accessToken: string): Promise<any[]> {
    const allTracks: any[] = [];
    const BATCH_SIZE = 50; // Spotify allows max 50 tracks per request

    for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
        const chunk = trackIds.slice(i, i + BATCH_SIZE);
        const ids = chunk.join(',');

        try {
            const res = await fetch(`https://api.spotify.com/v1/tracks?ids=${ids}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                console.error(`Failed to fetch tracks batch: ${res.status}`);
                continue; // Skip failed batches
            }

            const data = await res.json();
            allTracks.push(...(data.tracks || []).filter((t: any) => t !== null));
        } catch (error) {
            console.error('Track fetch error:', error);
        }
    }

    return allTracks;
}
