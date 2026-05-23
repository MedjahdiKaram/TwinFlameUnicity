'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Folder, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

const categorySchema = z.object({
  name_fr: z.string().min(2, 'Nom FR requis'),
  name_ar: z.string().min(2, 'Nom AR requis'),
  slug: z.string().min(2, 'Slug requis').regex(/^[a-z0-9-]+$/, 'Slug: lettres minuscules, chiffres et tirets uniquement'),
  description_fr: z.string().optional(),
  description_ar: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type CategoryForm = z.infer<typeof categorySchema>

interface Category {
  id: string
  name_fr: string
  name_ar: string
  slug: string
  description_fr?: string | null
  description_ar?: string | null
  color?: string | null
  icon?: string | null
}

interface Props {
  initialCategories: Category[]
}

export function AdminCategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  })

  const openCreate = () => {
    reset()
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setValue('name_fr', cat.name_fr)
    setValue('name_ar', cat.name_ar)
    setValue('slug', cat.slug)
    setValue('description_fr', cat.description_fr || '')
    setValue('description_ar', cat.description_ar || '')
    setValue('color', cat.color || '')
    setValue('icon', cat.icon || '')
    setEditingId(cat.id)
    setShowForm(true)
  }

  const onSubmit = async (data: CategoryForm) => {
    if (editingId) {
      const { data: updated, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', editingId)
        .select()
        .single()
      if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return }
      setCategories(prev => prev.map(c => c.id === editingId ? updated : c))
      toast({ title: 'Catégorie mise à jour' })
    } else {
      const { data: created, error } = await supabase
        .from('categories')
        .insert(data)
        .select()
        .single()
      if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return }
      setCategories(prev => [...prev, created])
      toast({ title: 'Catégorie créée' })
    }
    setShowForm(false)
    reset()
    setEditingId(null)
  }

  const deleteCategory = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }) }
    else { setCategories(prev => prev.filter(c => c.id !== id)); toast({ title: 'Catégorie supprimée' }) }
    setDeletingId(null)
  }

  const slugify = (str: string) => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} variant="glow" size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Nouvelle catégorie
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">{editingId ? 'Modifier' : 'Nouvelle'} catégorie</h3>
            <button onClick={() => { setShowForm(false); reset() }} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name_fr">Nom (FR)</Label>
              <Input
                id="name_fr"
                {...register('name_fr')}
                onChange={e => { register('name_fr').onChange(e); if (!editingId) setValue('slug', slugify(e.target.value)) }}
                placeholder="Flamme Jumelle"
              />
              {errors.name_fr && <p className="text-red-400 text-xs">{errors.name_fr.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name_ar">Nom (AR)</Label>
              <Input id="name_ar" {...register('name_ar')} placeholder="التوأم اللهبي" dir="rtl" />
              {errors.name_ar && <p className="text-red-400 text-xs">{errors.name_ar.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register('slug')} placeholder="flamme-jumelle" />
              {errors.slug && <p className="text-red-400 text-xs">{errors.slug.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Couleur (ex: #9333ea)</Label>
              <Input id="color" {...register('color')} placeholder="#9333ea" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description_fr">Description (FR)</Label>
              <Input id="description_fr" {...register('description_fr')} placeholder="Articles sur les flammes jumelles..." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description_ar">Description (AR)</Label>
              <Input id="description_ar" {...register('description_ar')} placeholder="مقالات عن التوائم اللهبية..." dir="rtl" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); reset() }}>
                Annuler
              </Button>
              <Button type="submit" variant="glow" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Sauvegarde...' : editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <Folder className="w-8 h-8 mb-2" />
            <p className="text-sm">Aucune catégorie</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 hidden md:table-cell">Couleur</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                      <div>
                        <p className="text-white font-medium">{cat.name_fr}</p>
                        <p className="text-white/40 text-xs" dir="rtl">{cat.name_ar}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <code className="text-purple-300 text-xs bg-purple-500/10 px-1.5 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-white/50">
                    {cat.color || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        disabled={deletingId === cat.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
