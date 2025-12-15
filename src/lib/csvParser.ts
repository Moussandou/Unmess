/**
 * CSV Parser for Spotify Playlist Exports
 * Supports common formats: Spotify official export, Soundiiz, Exportify
 */

interface ParsedTrack {
    spotifyId?: string
    name?: string
    artist?: string
    album?: string
}

export function parsePlaylistCSV(csvContent: string): ParsedTrack[] {
    const lines = csvContent.trim().split('\n')
    if (lines.length === 0) return []

    // Parse header to detect columns
    const header = lines[0].toLowerCase()
    const headers = parseCSVLine(header)

    // Detect column indices
    const idIndex = headers.findIndex(h =>
        h.includes('spotify id') ||
        h.includes('track id') ||
        h.includes('spotify uri') ||
        h.includes('uri')
    )
    const urlIndex = headers.findIndex(h =>
        h.includes('url') ||
        h.includes('spotify url') ||
        h.includes('track url')
    )
    const nameIndex = headers.findIndex(h =>
        h.includes('name') ||
        h.includes('track') ||
        h.includes('title')
    )
    const artistIndex = headers.findIndex(h =>
        h.includes('artist')
    )
    const albumIndex = headers.findIndex(h =>
        h.includes('album')
    )

    const tracks: ParsedTrack[] = []

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = parseCSVLine(line)

        let spotifyId: string | undefined

        // Try to extract Spotify ID
        if (idIndex !== -1 && values[idIndex]) {
            const idValue = values[idIndex].trim()
            // Handle URI format: spotify:track:xxxxx
            if (idValue.startsWith('spotify:track:')) {
                spotifyId = idValue.replace('spotify:track:', '')
            }
            // Handle plain ID
            else if (idValue.length === 22) {
                spotifyId = idValue
            }
        }

        // Fallback: extract from URL
        if (!spotifyId && urlIndex !== -1 && values[urlIndex]) {
            const urlValue = values[urlIndex].trim()
            const match = urlValue.match(/track\/([a-zA-Z0-9]{22})/)
            if (match) {
                spotifyId = match[1]
            }
        }

        // Only add if we have a valid Spotify ID
        if (spotifyId) {
            tracks.push({
                spotifyId,
                name: nameIndex !== -1 ? values[nameIndex]?.trim() : undefined,
                artist: artistIndex !== -1 ? values[artistIndex]?.trim() : undefined,
                album: albumIndex !== -1 ? values[albumIndex]?.trim() : undefined,
            })
        }
    }

    return tracks
}

/**
 * Parse a single CSV line, handling quoted values with commas
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"'
                i++ // Skip next quote
            } else {
                // Toggle quotes
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current)
            current = ''
        } else {
            current += char
        }
    }

    // Add last field
    result.push(current)

    return result.map(f => f.trim())
}

/**
 * Validate CSV content before parsing
 */
export function validateCSV(csvContent: string): { valid: boolean; error?: string } {
    if (!csvContent || csvContent.trim().length === 0) {
        return { valid: false, error: "Le fichier CSV est vide" }
    }

    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
        return { valid: false, error: "Le CSV doit contenir au moins une ligne de données" }
    }

    const header = lines[0].toLowerCase()
    const hasSpotifyColumn =
        header.includes('spotify') ||
        header.includes('uri') ||
        header.includes('url') ||
        header.includes('id')

    if (!hasSpotifyColumn) {
        return {
            valid: false,
            error: "Le CSV ne contient pas de colonne Spotify (ID, URI ou URL)"
        }
    }

    return { valid: true }
}
