import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BlogList } from '@/components/blog/BlogList'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; tag?: string; q?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return {
    title: t('blog_title'),
    description: t('blog_description'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { fr: '/fr/blog', ar: '/ar/مدونة' },
    },
  }
}

async function getData(locale: string, searchParams: Awaited<Props['searchParams']>) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1', 10)
  const pageSize = 12
  const from = (page - 1) * pageSize

  let query = supabase
    .from('articles')
    .select(`
      id, slug, title, excerpt, cover_url, cover_alt,
      is_premium, is_featured, language, reading_time, views, likes,
      published_at, category_id,
      category:categories(id, name_en, name_ar, slug, color),
          tags:article_tags(tag:tags(id, name_en, name_ar, slug))
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('language', locale)

  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,excerpt.ilike.%${searchParams.q}%`)
  }

  query = query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)

  const { data, count } = await query

  const articles = (data || []).map((a: any) => ({
    ...a,
    tags: a.tags?.map((t: any) => t.tag) ?? [],
  }))

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_en, name_ar, slug, color')
    .order('sort_order')

  return {
    articles,
    categories: categories || [],
    total: count || 0,
    page,
    pageSize,
  }
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const { articles, categories, total, page, pageSize } = await getData(locale, sp)
  const t = await getTranslations({ locale, namespace: 'blog' })

  return (
    <>
      <Navbar locale={locale} />
      <main className="pt-20">
        {/* Hero banner */}
        <div className="relative py-20 text-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
              {locale === 'ar' ? (
                <>
                  <span className="text-cosmic">المدونة</span> الروحية
                </>
              ) : (
                <>
                  The <span className="text-cosmic">Spiritual</span> Blog
                </>
              )}
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              {locale === 'ar' ? 'توجيه وصحوة وتواصل في رحلتك نحو الوحدة' : t('subtitle')}
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <BlogList
            initialArticles={articles}
            categories={categories}
            total={total}
            page={page}
            pageSize={pageSize}
            locale={locale as 'en' | 'ar'}
          />
        </Suspense>
      </main>
      <Footer locale={locale} />
    </>
  )
}
