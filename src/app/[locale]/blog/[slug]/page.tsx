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
    .select(`
      title, excerpt, meta_title, meta_description, og_image, cover_url, 
      published_at, updated_at,
      author:profiles!articles_author_id_fkey(pseudo, first_name, last_name),
      category:categories(name_fr, name_ar),
      tags:article_tags(tag:tags(name_fr, name_ar))
    `)
    .eq('slug', slug)
    .single()

  if (!article) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'
  const isAr = locale === 'ar'
  const categoryName = isAr ? (article as any).category?.name_ar : (article as any).category?.name_fr
  const tagList = (article as any).tags?.map((t: any) => isAr ? t.tag?.name_ar : t.tag?.name_fr).filter(Boolean) || []
  const authorName = (article as any).author?.pseudo || `${(article as any).author?.first_name || ''} ${(article as any).author?.last_name || ''}`.trim() || 'TwinFlameUnicity'
  const imageUrl = article.og_image || article.cover_url || `${siteUrl}/images/og-default.jpg`
  const canonicalUrl = `${siteUrl}/${locale}/${isAr ? 'مدونة' : 'blog'}/${slug}`

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || '',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ],
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: [authorName],
      section: categoryName || 'Spiritualité',
      tags: tagList,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      images: [imageUrl],
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

  const authorName = article.author?.pseudo || `${article.author?.first_name || ''} ${article.author?.last_name || ''}`.trim() || 'TwinFlameUnicity'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'
  const canonicalUrl = `${siteUrl}/${locale}/${locale === 'fr' ? 'blog' : 'مدونة'}/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': article.title,
    'description': article.meta_description || article.excerpt || '',
    'image': article.cover_url || `${siteUrl}/images/og-default.jpg`,
    'datePublished': article.published_at || '',
    'dateModified': article.updated_at || '',
    'author': {
      '@type': 'Person',
      'name': authorName,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'TwinFlameUnicity',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/favicon-32x32.png`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
