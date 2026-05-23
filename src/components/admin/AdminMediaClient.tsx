'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Copy, Image as ImageIcon, FileText, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

interface MediaFile {
  id: string
  filename: string  // mapped from 'name'
  url: string
  size: number
  mime_type: string
  created_at: string
}

interface Props {
  initialMedia: MediaFile[]
}

export function AdminMediaClient({ initialMedia }: Props) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `uploads/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('articles')
        .upload(path, file, { contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('articles').getPublicUrl(path)

      const { data: record, error: dbError } = await supabase
        .from('media')
        .insert({
          filename: file.name,
          url: publicUrl,
          size: file.size,
          mime_type: file.type,
          storage_path: path,
          bucket: 'articles',
        })
        .select()
        .single()

      if (dbError) throw dbError

      setMedia(prev => [record, ...prev])
      toast({ title: 'Fichier uploadé', description: file.name })
    } catch (err: unknown) {
      const error = err as Error
      toast({ title: 'Erreur upload', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }

  const deleteMedia = async (item: MediaFile) => {
    setDeletingId(item.id)
    try {
      await supabase.from('media').delete().eq('id', item.id)
      setMedia(prev => prev.filter(m => m.id !== item.id))
      toast({ title: 'Fichier supprimé' })
    } catch {
      toast({ title: 'Erreur suppression', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({ title: 'URL copiée' })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const isImage = (mime: string) => mime.startsWith('image/')

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="glow"
          size="sm"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Upload...' : 'Uploader'}
        </Button>
        <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-purple-600/30 text-purple-300' : 'text-white/40 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-purple-600/30 text-purple-300' : 'text-white/40 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/40 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
        <p className="text-white/40 text-sm">Glissez des fichiers ici ou cliquez pour uploader</p>
        <p className="text-white/25 text-xs mt-1">Images, vidéos, PDF — max 10MB</p>
      </div>

      {/* Media Grid/List */}
      {media.length > 0 && (
        view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {media.map(item => (
              <div key={item.id} className="group relative bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden aspect-square">
                {isImage(item.mime_type) ? (
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <FileText className="w-8 h-8 text-white/30 mb-1" />
                    <p className="text-xs text-white/40 text-center truncate w-full">{item.filename}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(item.url)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMedia(item)} disabled={deletingId === item.id} className="p-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white transition-colors disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{item.filename}</p>
                  <p className="text-xs text-white/50">{formatSize(item.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Fichier</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Taille</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {media.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {isImage(item.mime_type) ? (
                          <img src={item.url} alt={item.filename} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white/40" />
                          </div>
                        )}
                        <span className="text-white/80 truncate max-w-[200px]">{item.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-white/50">{formatSize(item.size)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-white/50">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => copyUrl(item.url)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteMedia(item)} disabled={deletingId === item.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
