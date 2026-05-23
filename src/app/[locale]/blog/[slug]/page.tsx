import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArticleDetail } from '@/components/blog/ArticleDetail'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, meta_title, meta_description, og_image, cover_url')
    .eq('slug', slug)
    .single()

  if (!article) return {}

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || '',
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      images: [{ url: article.og_image || article.cover_url || '' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const supabase = await createClient()

  // Fetch article with relations
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!articles_author_id_fkey(id, pseudo, first_name, last_name, avatar_url, bio),
      category:categories(id, name_fr, name_ar, slug, color),
      tags:article_tags(tag:tags(id, name_fr, name_ar, slug)),
      images:article_images(id, url, alt, sort_order)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  // Increment views (fire & forget)
  supabase.rpc('increment_article_views', { article_slug: slug }).then(() => {})

  const normalizedArticle = {
    ...article,
    tags: article.tags?.map((t: any) => t.tag) ?? [],
  }

  // Related articles
  const { data: related } = await supabase
    .from('articles')
    .select(`
      id, slug, title, excerpt, cover_url, cover_alt,
      is_premium, is_featured, language, reading_time, views, likes,
      published_at, category_id,
      category:categories(id, name_fr, name_ar, slug, color),
      tags:article_tags(tag:tags(id, name_fr, name_ar, slug))
    `)
    .eq('status', 'published')
    .eq('language', locale)
    .eq('category_id', article.category_id || '')
    .neq('id', article.id)
    .limit(3)

  const relatedArticles = (related || []).map((a: any) => ({
    ...a,
    tags: a.tags?.map((t: any) => t.tag) ?? [],
  }))

  return (
    <>
      <Navbar locale={locale} />
      <main className="pt-20">
        <ArticleDetail
          article={normalizedArticle}
          related={relatedArticles}
          locale={locale as 'fr' | 'ar'}
        />
      </main>
      <Footer locale={locale} />
    </>
  )
}
