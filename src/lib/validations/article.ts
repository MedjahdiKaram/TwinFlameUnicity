import { z } from 'zod'

export const articleSchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200, 'Le titre est trop long'),
  slug: z
    .string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et -'),
  language: z.enum(['fr', 'ar']),
  excerpt: z.string().max(500, 'L\'extrait est trop long').optional(),
  content: z.string(), // validé manuellement dans ArticleForm (TipTap hors react-hook-form)
  cover_url: z.string().url('URL de couverture invalide').optional().or(z.literal('')),
  cover_alt: z.string().max(200).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  is_premium: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  category_id: z.string().uuid('Catégorie invalide').optional().or(z.literal('')),
  tag_ids: z.array(z.string().uuid()).optional(),
  meta_title: z.string().max(70, 'Le meta title doit faire moins de 70 caractères').optional(),
  meta_description: z.string().max(160, 'La meta description doit faire moins de 160 caractères').optional(),
  og_image: z.string().url().optional().or(z.literal('')),
})

export const categorySchema = z.object({
  name_fr: z.string().min(2).max(100),
  name_ar: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description_fr: z.string().max(500).optional(),
  description_ar: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur HEX invalide'),
  icon: z.string().optional(),
  sort_order: z.number().int().min(0),
})

export const tagSchema = z.object({
  name_fr: z.string().min(2).max(50),
  name_ar: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
})

export const commentSchema = z.object({
  content: z
    .string()
    .min(5, 'Le commentaire doit contenir au moins 5 caractères')
    .max(2000, 'Le commentaire est trop long'),
  parent_id: z.string().uuid().optional(),
})

export type ArticleInput = z.infer<typeof articleSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type TagInput = z.infer<typeof tagSchema>
export type CommentInput = z.infer<typeof commentSchema>
