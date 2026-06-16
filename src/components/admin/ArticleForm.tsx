'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Save, Globe, Crown, Star, Tag, FolderOpen, Upload, ImageIcon, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { articleSchema, type ArticleInput } from '@/lib/validations/article'
import { createClient } from '@/lib/supabase/client'
import { slugify, estimateReadingTime } from '@/lib/utils'
import type { InsertTables, UpdateTables } from '@/types/database.types'
import { generateMetadata, generateImageNanoBanana } from '@/lib/ai'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
  categories: { id: string; name_en: string; name_ar: string }[]
  tags: { id: string; name_en: string; name_ar: string }[]
  authorId: string
  locale: 'en' | 'ar'
  initialData?: Partial<ArticleInput> & { id?: string; selected_tags?: string[] }
}

export function ArticleForm({ categories, tags, authorId, locale, initialData }: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [content, setContent] = useState(initialData?.content || '')
  const [contentError, setContentError] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.selected_tags || [])
  const [error, setError] = useState('')
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient() as any

  const [localCategories, setLocalCategories] = useState(categories)
  const [localTags, setLocalTags] = useState(tags)

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name_en: '',
    name_ar: '',
    slug: '',
    color: '#9333ea',
    description_en: '',
    description_ar: '',
  })
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [newTag, setNewTag] = useState({
    name_en: '',
    name_ar: '',
    slug: '',
  })
  const [tagSubmitting, setTagSubmitting] = useState(false)
  const [tagError, setTagError] = useState('')

  const handleCategoryNameENChange = (val: string) => {
    setNewCategory((prev) => ({
      ...prev,
      name_en: val,
      slug: slugify(val),
    }))
  }

  const handleTagNameENChange = (val: string) => {
    setNewTag((prev) => ({
      ...prev,
      name_en: val,
      slug: slugify(val),
    }))
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError('')
    if (!newCategory.name_en || !newCategory.name_ar || !newCategory.slug) {
      setCategoryError('English name, Arabic name and slug are required.')
      return
    }
    setCategorySubmitting(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name_en: newCategory.name_en,
          name_ar: newCategory.name_ar,
          slug: newCategory.slug,
          color: newCategory.color || '#9333ea',
          description_en: newCategory.description_en || null,
          description_ar: newCategory.description_ar || null,
        })
        .select()
      setNewCategory({
        name_en: '',
        name_ar: '',
        slug: '',
        color: '#9333ea',
        description_en: '',
        description_ar: '',
      })
    } catch (err: any) {
      setCategoryError(err.message || 'Une erreur est survenue lors de la création de la catégorie.')
    } finally {
      setCategorySubmitting(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    setTagError('')
    if (!newTag.name_en || !newTag.name_ar || !newTag.slug) {
      setTagError('English name, Arabic name and slug are required.')
      return
    }
    setTagSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          name_en: newTag.name_en,
          name_ar: newTag.name_ar,
          slug: newTag.slug,
        })

      setLocalTags((prev) => [...prev, data].sort((a, b) => a.name_en.localeCompare(b.name_en)))
      setSelectedTags((prev) => [...prev, data.id])
      toast({ title: 'Tag created!', description: `Tag "${data.name_en}" has been added and selected.` })
      setIsTagModalOpen(false)
      setNewTag({
        name_en: '',
        name_ar: '',
        slug: '',
      })
    } catch (err: any) {
      setTagError(err.message || 'Une erreur est survenue lors de la création du tag.')
    } finally {
      setTagSubmitting(false)
    }
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingCover(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from('covers')
        .upload(filePath, file)

      if (error) {
        console.error('Upload error:', error)
        alert("Erreur lors du telechargement de l'image.")
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(data.path)

      setValue('cover_url', publicUrl)
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploadingCover(false)
      if (coverInputRef.current) {
        coverInputRef.current.value = ''
      }
    }
  }

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      language: initialData?.language || locale,
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || 'placeholder', // content géré via état TipTap
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
  const [nanoPrompt, setNanoPrompt] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false)

  // Prefill nanoPrompt with title if empty
  useEffect(() => {
    if (title && !nanoPrompt) {
      setNanoPrompt(title)
    }
  }, [title, nanoPrompt])

  const handleNanoBananaImage = async () => {
    const savedAi = localStorage.getItem('twinflame_ai_settings')
    if (!savedAi) {
      toast({ title: 'Configuration requise', description: "Veuillez configurer la clé API NanoBanana dans l'onglet IA des paramètres.", variant: 'destructive' })
      return
    }

    let aiConfig
    try {
      aiConfig = JSON.parse(savedAi)
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de lire les paramètres IA.', variant: 'destructive' })
      return
    }

    if (!aiConfig.nanoBananaKey) {
      toast({ title: 'Configuration requise', description: "Veuillez configurer la clé API NanoBanana dans l'onglet IA des paramètres.", variant: 'destructive' })
      return
    }

    setIsGeneratingImage(true)
    try {
      const promptToUse = nanoPrompt || title || 'Illustration spirituelle abstraite'
      const imageUrl = await generateImageNanoBanana({
        nanoBananaKey: aiConfig.nanoBananaKey,
        nanoBananaUrl: aiConfig.nanoBananaUrl || 'https://api.nanobanana.com/v1/images/generations',
        nanoBananaModel: aiConfig.nanoBananaModel || 'nano-banana-v1'
      }, promptToUse)

      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const fileExt = 'png'
        const fileName = `nanobanana_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { data, error: uploadErr } = await supabase.storage
          .from('covers')
          .upload(filePath, blob, { contentType: 'image/png' })

        if (uploadErr) {
          setValue('cover_url', imageUrl)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('covers')
            .getPublicUrl(data.path)
          setValue('cover_url', publicUrl)
        }
      } catch (uploadErr) {
        setValue('cover_url', imageUrl)
      }

      toast({ title: 'Image générée !', description: "L'image a été créée avec succès par NanoBanana." })
    } catch (err: any) {
      toast({ title: 'Erreur de génération', description: err?.message || 'Une erreur est survenue.', variant: 'destructive' })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleGenerateSEO = async () => {
    const savedAi = localStorage.getItem('twinflame_ai_settings')
    if (!savedAi) {
      toast({ title: 'Configuration requise', description: "Veuillez configurer les paramètres de l'IA dans l'onglet IA des paramètres.", variant: 'destructive' })
      return
    }

    let aiConfig
    try {
      aiConfig = JSON.parse(savedAi)
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de lire les paramètres IA.', variant: 'destructive' })
      return
    }

    if (!aiConfig.apiKey) {
      toast({ title: 'Clé API manquante', description: 'Veuillez configurer votre clé API IA dans les paramètres.', variant: 'destructive' })
      return
    }

    if (!title) {
      toast({ title: 'Titre requis', description: "Veuillez d'abord saisir un titre pour l'article.", variant: 'destructive' })
      return
    }

    setIsGeneratingSEO(true)
    try {
      const cleanContent = content ? content.replace(/<[^>]*>/g, '').trim() : ''
      const seoData = await generateMetadata({
        provider: aiConfig.provider,
        model: aiConfig.model,
        apiKey: aiConfig.apiKey,
        temperature: aiConfig.temperature ?? 0.7
      }, title, cleanContent)

      if (seoData.meta_title) setValue('meta_title', seoData.meta_title)
      if (seoData.meta_description) setValue('meta_description', seoData.meta_description)
      if (seoData.excerpt) setValue('excerpt', seoData.excerpt)

      toast({ title: 'SEO généré !', description: 'Méta-titre, description et résumé mis à jour.' })
    } catch (err: any) {
      toast({ title: 'Erreur de génération', description: err?.message || 'Une erreur est survenue.', variant: 'destructive' })
    } finally {
      setIsGeneratingSEO(false)
    }
  }

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
    setContentError('')

    // Validation manuelle du contenu TipTap
    const rawContent = content.replace(/<[^>]*>/g, '').trim()
    if (!rawContent) {
      setContentError('Le contenu est requis')
      return
    }

    setIsPending(true)
    try {
      // Construire le payload avec les types exacts de la DB (undefined → null)
      const basePayload: InsertTables<'articles'> = {
        title: data.title,
        slug: data.slug,
        language: data.language,
        excerpt: data.excerpt || null,
        content,
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        status: data.status,
        is_premium: data.is_premium,
        is_featured: data.is_featured,
        category_id: data.category_id || null,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        og_image: data.og_image || null,
        reading_time: estimateReadingTime(content),
        author_id: authorId,
      }

      let articleId = initialData?.id

      if (articleId) {
        const { error } = await supabase
          .from('articles')
          .update(basePayload)
          .eq('id', articleId)
        if (error) throw error
      } else {
        const { data: created, error } = await supabase
          .from('articles')
          .insert(basePayload)
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

      router.push('/admin/articles')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur s\'est produite'
      setError(msg)
    } finally {
      setIsPending(false)
    }
  }

  const onFormError = (errs: Record<string, unknown>) => {
    const first = Object.values(errs)[0] as { message?: string } | undefined
    setError(first?.message || 'Veuillez corriger les erreurs du formulaire')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
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
              onChange={(value) => {
                setContent(value)
                setContentError('')
              }}
              placeholder="Rédigez votre article spirituel..."
            />
            {contentError && <p className="text-red-400 text-xs mt-2">{contentError}</p>}
          </div>

          {/* SEO */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">SEO</h3>
              <button
                type="button"
                onClick={handleGenerateSEO}
                disabled={isGeneratingSEO || !title}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 disabled:opacity-50 transition-all duration-300 flex items-center gap-1.5 shadow-glow-sm"
              >
                {isGeneratingSEO ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>🤖 Générer par IA</span>
                )}
              </button>
            </div>
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Langue
              </label>
              <select {...register('language')} className="input-cosmic">
                <option value="en">English</option>
                <option value="ar">العربية</option>
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
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Image de couverture</h3>
            <div className="flex flex-col gap-3">
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} ref={coverInputRef} />
              <button 
                type="button" 
                onClick={() => coverInputRef.current?.click()} 
                disabled={isUploadingCover}
                className="btn-cosmic flex items-center justify-center gap-2"
              >
                {isUploadingCover ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploadingCover ? 'Téléchargement...' : 'Uploader une image'}
              </button>
              
              {watch('cover_url') && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group mt-2">
                  <img src={watch('cover_url')} alt="Cover preview" className="object-cover w-full h-full" />
                </div>
              )}

              <input {...register('cover_url')} placeholder="URL de l'image (optionnel)" className="input-cosmic text-sm" />
              <input {...register('cover_alt')} placeholder="Texte alternatif" className="input-cosmic text-sm" />

              {/* NanoBanana Image Generator */}
              <div className="pt-3 border-t border-white/10 mt-2 space-y-2">
                <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider">NanoBanana Image AI</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Prompt d'image (ex: Un volcan sous les étoiles...)"
                    value={nanoPrompt}
                    onChange={e => setNanoPrompt(e.target.value)}
                    className="input-cosmic text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleNanoBananaImage}
                    disabled={isGeneratingImage || !title}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 disabled:opacity-50 transition-all duration-300 shadow-glow-sm"
                  >
                    {isGeneratingImage ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>🖼️ Générer via NanoBanana</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-white/60 uppercase tracking-wider">
                <FolderOpen className="w-4 h-4" /> Catégorie
              </label>
              <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-1 rounded-md bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/30 transition-all text-white/60 hover:text-white"
                  title="Ajouter une catégorie"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle Catégorie</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4 text-left">
                    {categoryError && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                        {categoryError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Name (EN) *</label>
                        <input
                          type="text"
                          required
                          value={newCategory.name_en}
                          onChange={(e) => handleCategoryNameENChange(e.target.value)}
                          className="input-cosmic text-sm w-full"
                          placeholder="ex: Twin Flame"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Nom (AR) *</label>
                        <input
                          type="text"
                          required
                          value={newCategory.name_ar}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name_ar: e.target.value }))}
                          className="input-cosmic text-sm w-full"
                          placeholder="ex: التوأم اللهبي"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Slug *</label>
                      <input
                        type="text"
                        required
                        value={newCategory.slug}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                        className="input-cosmic text-sm font-mono w-full"
                        placeholder="ex: flamme-jumelle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Couleur</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          className="input-cosmic text-sm font-mono w-full"
                          placeholder="#9333ea"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Description (EN)</label>
                      <input
                        type="text"
                        value={newCategory.description_en}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description_en: e.target.value }))}
                        className="input-cosmic text-sm w-full"
                        placeholder="Description in English..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Description (AR)</label>
                      <input
                        type="text"
                        value={newCategory.description_ar}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description_ar: e.target.value }))}
                        className="input-cosmic text-sm w-full"
                        placeholder="الوصف باللغة العربية..."
                        dir="rtl"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={categorySubmitting}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-all duration-300 shadow-glow-sm"
                      >
                        {categorySubmitting ? 'Création...' : 'Créer'}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <select {...register('category_id')} className="input-cosmic">
              <option value="">— Aucune —</option>
              {localCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'ar' ? cat.name_ar : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-white/60 uppercase tracking-wider">
                <Tag className="w-4 h-4" /> Tags
              </label>
              <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
                <button
                  type="button"
                  onClick={() => setIsTagModalOpen(true)}
                  className="p-1 rounded-md bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/30 transition-all text-white/60 hover:text-white"
                  title="Ajouter un tag"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau Tag</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTag} className="space-y-4 text-left">
                    {tagError && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                        {tagError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Name (EN) *</label>
                        <input
                          type="text"
                          required
                          value={newTag.name_en}
                          onChange={(e) => handleTagNameENChange(e.target.value)}
                          className="input-cosmic text-sm w-full"
                          placeholder="ex: Numerology"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Nom (AR) *</label>
                        <input
                          type="text"
                          required
                          value={newTag.name_ar}
                          onChange={(e) => setNewTag(prev => ({ ...prev, name_ar: e.target.value }))}
                          className="input-cosmic text-sm w-full"
                          placeholder="ex: علم الأعداد"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Slug *</label>
                      <input
                        type="text"
                        required
                        value={newTag.slug}
                        onChange={(e) => setNewTag(prev => ({ ...prev, slug: e.target.value }))}
                        className="input-cosmic text-sm font-mono w-full"
                        placeholder="ex: numerologie"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsTagModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={tagSubmitting}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-all duration-300 shadow-glow-sm"
                      >
                        {tagSubmitting ? 'Création...' : 'Créer'}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-2">
              {localTags.map((tag) => (
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
                  #{locale === 'ar' ? tag.name_ar : tag.name_en}
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
