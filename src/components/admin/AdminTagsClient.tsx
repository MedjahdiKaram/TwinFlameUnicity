'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

const tagSchema = z.object({
  name_en: z.string().min(1, 'English name required'),
  name_ar: z.string().min(1, 'Nom AR requis'),
  slug: z.string().min(1, 'Slug requis').regex(/^[a-z0-9-]+$/),
})

type TagForm = z.infer<typeof tagSchema>

interface TagItem {
  id: string
  name_en: string
  name_ar: string
  slug: string
}

interface Props {
  initialTags: TagItem[]
}

export function AdminTagsClient({ initialTags }: Props) {
  const [tags, setTags] = useState(initialTags)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<TagForm>({
    resolver: zodResolver(tagSchema),
  })

  const slugify = (str: string) => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const onSubmit = async (data: TagForm) => {
    const { data: created, error } = await supabase.from('tags').insert(data).select().single()
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return }
    setTags(prev => [...prev, created].sort((a, b) => a.name_en.localeCompare(b.name_en)))
    toast({ title: 'Tag créé' })
    setShowForm(false)
    reset()
  }

  const deleteTag = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }) }
    else { setTags(prev => prev.filter(t => t.id !== id)); toast({ title: 'Tag supprimé' }) }
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { reset(); setShowForm(true) }} variant="glow" size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Nouveau tag
        </Button>
      </div>

      {showForm && (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Nouveau tag</h3>
            <button onClick={() => { setShowForm(false); reset() }} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name_en">Name (EN)</Label>
              <Input
                id="name_en"
                {...register('name_en')}
                onChange={e => { register('name_en').onChange(e); setValue('slug', slugify(e.target.value)) }}
                placeholder="Numerology"
              />
              {errors.name_en && <p className="text-red-400 text-xs">{errors.name_en.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name_ar">Nom (AR)</Label>
              <Input id="name_ar" {...register('name_ar')} placeholder="علم الأعداد" dir="rtl" />
              {errors.name_ar && <p className="text-red-400 text-xs">{errors.name_ar.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register('slug')} placeholder="numerologie" />
              {errors.slug && <p className="text-red-400 text-xs">{errors.slug.message}</p>}
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); reset() }}>Cancel</Button>
              <Button type="submit" variant="glow" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {tags.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-16 text-white/30">
            <Tag className="w-8 h-8 mb-2" />
            <p className="text-sm">No tags</p>
          </div>
        ) : tags.map(tag => (
          <div
            key={tag.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-300 text-sm"
          >
            <Tag className="w-3 h-3" />
            <span>{tag.name_en}</span>
            <button
              onClick={() => deleteTag(tag.id)}
              disabled={deletingId === tag.id}
              className="ml-1 text-purple-400/50 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
