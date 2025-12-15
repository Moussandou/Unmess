import { Upload, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react'
import { RefObject } from 'react'

interface CSVUploaderProps {
    file: File | null
    error: string | null
    processing: boolean
    onFileSelect: (file: File) => void
    onAnalyze: () => void
    fileInputRef: RefObject<HTMLInputElement | null>
}

export default function CSVUploader({
    file,
    error,
    processing,
    onFileSelect,
    onAnalyze,
    fileInputRef
}: CSVUploaderProps) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv')) {
            onFileSelect(droppedFile)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            onFileSelect(selectedFile)
        }
    }

    return (
        <div className="w-full max-w-xl">
            {!file ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-purple-500/50 transition-colors cursor-pointer text-center"
                >
                    <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Glisse ton CSV ici</h3>
                    <p className="text-gray-400 text-sm mb-4">ou clique pour choisir un fichier</p>
                    <p className="text-xs text-gray-500">
                        Formats supportés : Spotify, Soundiiz, Exportify
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="w-8 h-8 text-green-400" />
                                <div>
                                    <h4 className="font-bold text-white">{file.name}</h4>
                                    <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onFileSelect(null as any)
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                }}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mb-4">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={onAnalyze}
                            disabled={processing}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Analyser cette playlist
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Le fichier CSV doit contenir au minimum une colonne avec des IDs, URIs ou URLs Spotify
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
