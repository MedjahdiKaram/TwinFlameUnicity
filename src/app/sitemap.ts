import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { slug: string; language: string; updated_at: string }[] = []
  let categories: { slug: string; updated_at: string }[] = []
  let tags: { slug: string }[] = []

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

    // Fetch tags
    const { data: tagsData } = await supabase
      .from('tags')
      .select('slug')

    articles = articlesData ?? []
    categories = categoriesData ?? []
    tags = tagsData ?? []
  } catch {
    // Supabase unavailable during build — return static pages only
  }

  // Helper for alternate languages
  const getAlternates = (frPath: string, arPath: string) => ({
    languages: {
      fr: `${BASE_URL}/fr${frPath}`,
      ar: `${BASE_URL}/ar${arPath}`,
    },
  })

  // 1. Homepages (Priority 1.0, daily)
  const homeUrls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/fr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: getAlternates('', ''),
    },
    {
      url: `${BASE_URL}/ar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: getAlternates('', ''),
    },
  ]

  // 2. Blog Indices (Priority 0.9, daily)
  const blogUrls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/fr/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: getAlternates('/blog', '/مدونة'),
    },
    {
      url: `${BASE_URL}/ar/مدونة`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: getAlternates('/blog', '/مدونة'),
    },
  ]

  // 3. Static Pages (Priority 0.7, monthly)
  const staticPages: MetadataRoute.Sitemap = [
    // About
    {
      url: `${BASE_URL}/fr/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/a-propos', '/من-نحن'),
    },
    {
      url: `${BASE_URL}/ar/من-نحن`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/a-propos', '/من-نحن'),
    },
    // Contact
    {
      url: `${BASE_URL}/fr/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/contact', '/تواصل'),
    },
    {
      url: `${BASE_URL}/ar/تواصل`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/contact', '/تواصل'),
    },
    // Categories Index
    {
      url: `${BASE_URL}/fr/categories`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/categories', '/تصنيفات'),
    },
    {
      url: `${BASE_URL}/ar/تصنيفات`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/categories', '/تصنيفات'),
    },
    // Tags Index
    {
      url: `${BASE_URL}/fr/tags`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/tags', '/وسوم'),
    },
    {
      url: `${BASE_URL}/ar/وسوم`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: getAlternates('/tags', '/وسوم'),
    },
  ]

  // 4. Articles (Priority 0.8, weekly)
  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => {
    const isFr = article.language === 'fr'
    const path = isFr ? `/blog/${article.slug}` : `/مدونة/${article.slug}`
    return {
      url: `${BASE_URL}/${article.language}${path}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  })

  // 5. Categories (Priority 0.6, weekly)
  const categoryUrls: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${BASE_URL}/fr/categories/${cat.slug}`,
      lastModified: new Date(cat.updated_at),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: getAlternates(`/categories/${cat.slug}`, `/تصنيفات/${cat.slug}`),
    },
    {
      url: `${BASE_URL}/ar/تصنيفات/${cat.slug}`,
      lastModified: new Date(cat.updated_at),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: getAlternates(`/categories/${cat.slug}`, `/تصنيفات/${cat.slug}`),
    },
  ])

  // 6. Tags (Priority 0.5, weekly)
  const tagUrls: MetadataRoute.Sitemap = tags.flatMap((tag) => [
    {
      url: `${BASE_URL}/fr/tags/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: getAlternates(`/tags/${tag.slug}`, `/وسوم/${tag.slug}`),
    },
    {
      url: `${BASE_URL}/ar/وسوم/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: getAlternates(`/tags/${tag.slug}`, `/وسوم/${tag.slug}`),
    },
  ])

  return [
    ...homeUrls,
    ...blogUrls,
    ...staticPages,
    ...articleUrls,
    ...categoryUrls,
    ...tagUrls,
  ]
}
