'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Save, Globe, Crown, Star, Tag, FolderOpen } from 'lucide-react'
import dynamic from 'next/dynamic'
import { articleSchema, type ArticleInput } from '@/lib/validations/article'
import { createClient } from '@/lib/supabase/client'
import { slugify, estimateReadingTime } from '@/lib/utils'

// Dynamic import to avoid SSR issues with TipTap
const TipTapEditor = dynamic(() => import('./TipTapEditor').then((m) => m.TipTapEditor), {
  ssr: false,
  loading: () => (
    <div className="h-96 border border-white/10 rounded-xl bg-black/20 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

interface Props {
  categories: { id: string; name_fr: string; name_ar: string }[]
  tags: { id: string; name_fr: string; name_ar: string }[]
  authorId: string
  locale: 'fr' | 'ar'
  initialData?: Partial<ArticleInput> & { id?: string; selected_tags?: string[] }
}

export function ArticleForm({ categories, tags, authorId, locale, initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState(initialData?.content || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.selected_tags || [])
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      language: initialData?.language || locale,
      excerpt: initialData?.excerpt || '',
      content: content,
      cover_url: initialData?.cover_url || '',
      cover_alt: initialData?.cover_alt || '',
      status: initialData?.status || 'draft',
      is_premium: initialData?.is_premium ?? false,
      is_featured: initialData?.is_featured ?? false,
      category_id: initialData?.category_id || '',
      meta_title: initialData?.meta_title || '',
      meta_description: initialData?.meta_description || '',
    },
  })

  const title = watch('title')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue('title', v)
    if (!initialData?.id) {
      setValue('slug', slugify(v))
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const onSubmit = async (data: ArticleInput) => {
    setError('')
    const readingTime = estimateReadingTime(content)

    startTransition(async () => {
      try {
        const supabase = createClient()
        const payload = {
          ...data,
          content,
          reading_time: readingTime,
          author_id: authorId,
          category_id: data.category_id || null,
        }

        let articleId = initialData?.id

        if (articleId) {
          const { error } = await supabase
            .from('articles')
            .update(payload)
            .eq('id', articleId)
          if (error) throw error
        } else {
          const { data: created, error } = await supabase
            .from('articles')
            .insert(payload)
            .select('id')
            .single()
          if (error) throw error
          articleId = created.id
        }

        // Sync tags
        if (articleId) {
          await supabase.from('article_tags').delete().eq('article_id', articleId)
          if (selectedTags.length > 0) {
            await supabase.from('article_tags').insert(
              selectedTags.map((tag_id) => ({ article_id: articleId!, tag_id }))
            )
          }
        }

        router.push(`/${locale}/admin/articles`)
        router.refresh()
      } catch (err: any) {
        setError(err?.message || 'Une erreur s\'est produite')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Titre *</label>
              <input
                {...register('title')}
                onChange={handleTitleChange}
                placeholder="Titre de l'article..."
                className="input-cosmic text-lg font-display"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Slug *</label>
              <input {...register('slug')} placeholder="slug-de-larticle" className="input-cosmic font-mono text-sm" />
              {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Extrait</label>
              <textarea
                {...register('excerpt')}
                rows={3}
                placeholder="Résumé de l'article (affiché dans les cartes)..."
                className="input-cosmic resize-none"
              />
            </div>
          </div>

          {/* Editor */}
          <div className="glass-card p-5">
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">Contenu *</label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Rédigez votre article spirituel..."
            />
          </div>

          {/* SEO */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">SEO</h3>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">Meta Title <span className="text-white/20">(max 70)</span></label>
              <input {...register('meta_title')} className="input-cosmic" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">Meta Description <span className="text-white/20">(max 160)</span></label>
              <textarea {...register('meta_description')} rows={2} className="input-cosmic resize-none" />
            </div>
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Publication</h3>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">Statut</label>
              <select {...register('status')} className="input-cosmic">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Langue
              </label>
              <select {...register('language')} className="input-cosmic">
                <option value="fr">🇫🇷 Français</option>
                <option value="ar">🇲🇦 العربية</option>
              </select>
            </div>
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register('is_premium')} type="checkbox" className="w-4 h-4 rounded accent-purple-600" />
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Article Premium
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register('is_featured')} type="checkbox" className="w-4 h-4 rounded accent-purple-600" />
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Star className="w-3.5 h-3.5 text-purple-400" /> Mis en avant
                </span>
              </label>
            </div>
          </div>

          {/* Cover */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Image de couverture</h3>
            <input {...register('cover_url')} placeholder="https://..." className="input-cosmic text-sm" />
            <input {...register('cover_alt')} placeholder="Texte alternatif" className="input-cosmic text-sm" />
          </div>

          {/* Category */}
          <div className="glass-card p-5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              <FolderOpen className="w-4 h-4" /> Catégorie
            </label>
            <select {...register('category_id')} className="input-cosmic">
              <option value="">— Aucune —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'ar' ? cat.name_ar : cat.name_fr}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="glass-card p-5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              <Tag className="w-4 h-4" /> Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all duration-200 ${
                    selectedTags.includes(tag.id)
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-white/40 border border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  #{locale === 'ar' ? tag.name_ar : tag.name_fr}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 transition-all duration-300 shadow-glow"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
