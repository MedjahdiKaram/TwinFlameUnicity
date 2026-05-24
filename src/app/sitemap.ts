import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { slug: string; language: string; updated_at: string }[] = []
  let categories: { slug: string; updated_at: string }[] = []

  try {
    const supabase = await createClient()

    // Fetch published articles
    const { data: articlesData } = await supabase
      .from('articles')
      .select('slug, language, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('slug, updated_at')

    articles = articlesData ?? []
    categories = categoriesData ?? []
  } catch {
    // Supabase unavailable during build — return static pages only
  }

  const staticPages = [
    { url: `${BASE_URL}/fr`, lastModified: new Date() },
    { url: `${BASE_URL}/ar`, lastModified: new Date() },
    { url: `${BASE_URL}/fr/blog`, lastModified: new Date() },
    { url: `${BASE_URL}/ar/مدونة`, lastModified: new Date() },
    { url: `${BASE_URL}/fr/a-propos`, lastModified: new Date() },
    { url: `${BASE_URL}/ar/من-نحن`, lastModified: new Date() },
    { url: `${BASE_URL}/fr/contact`, lastModified: new Date() },
    { url: `${BASE_URL}/ar/تواصل`, lastModified: new Date() },
    { url: `${BASE_URL}/fr/categories`, lastModified: new Date() },
    { url: `${BASE_URL}/ar/تصنيفات`, lastModified: new Date() },
  ]

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/${article.language}/${article.language === 'fr' ? 'blog' : 'مدونة'}/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${BASE_URL}/fr/categories/${cat.slug}`,
      lastModified: new Date(cat.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/ar/تصنيفات/${cat.slug}`,
      lastModified: new Date(cat.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ])

  return [
    ...staticPages.map((p) => ({ ...p, changeFrequency: 'monthly' as const, priority: 1.0 })),
    ...articleUrls,
    ...categoryUrls,
  ]
}
