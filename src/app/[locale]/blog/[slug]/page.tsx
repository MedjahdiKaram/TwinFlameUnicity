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
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select(`
      title, excerpt, meta_title, meta_description, og_image, cover_url, 
      published_at, updated_at,
      author:profiles!articles_author_id_fkey(pseudo, first_name, last_name),
      category:categories(name_en, name_ar),
      tags:article_tags(tag:tags(name_en, name_ar))
    `)
    .eq('slug', decodedSlug)
    .single()

  if (!article) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'
  const isAr = locale === 'ar'
  const categoryName = isAr ? (article as any).category?.name_ar : (article as any).category?.name_en
  const tagList = (article as any).tags?.map((t: any) => isAr ? t.tag?.name_ar : t.tag?.name_en).filter(Boolean) || []
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
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()

  // Get current user and profile for VIP check
  const { data: { user } } = await supabase.auth.getUser()
  let isVipUser = false
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_vip, role').eq('id', user.id).single()
    isVipUser = profile?.is_vip || false
    isAdmin = profile?.role === 'admin'
  }

  // Fetch article with relations
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!articles_author_id_fkey(id, pseudo, first_name, last_name, avatar_url, bio),
      category:categories(id, name_en, name_ar, slug, color),
      tags:article_tags(tag:tags(id, name_en, name_ar, slug)),
      images:article_images(id, url, alt, sort_order)
    `)
    .eq('slug', decodedSlug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  // Increment views (fire & forget)
  supabase.rpc('increment_article_views', { article_slug: decodedSlug }).then(() => {})

  const normalizedArticle = {
    ...article,
    tags: article.tags?.map((t: any) => t.tag) ?? [],
  }

  // Related articles
  const { data: related } = await supabase
    .from('articles')
    .select(`
      id, slug, title, excerpt, cover_url, cover_alt,
      is_vip, is_featured, language, reading_time, views, likes,
      published_at, category_id,
      category:categories(id, name_en, name_ar, slug, color),
      tags:article_tags(tag:tags(id, name_en, name_ar, slug))
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
  const canonicalUrl = `${siteUrl}/${locale}/${locale === 'en' ? 'blog' : 'مدونة'}/${decodedSlug}`

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
          locale={locale as 'en' | 'ar'}
          isVipUser={isVipUser}
          isAdmin={isAdmin}
          user={user}
        />
      </main>
      <Footer locale={locale} />
    </>
  )
}
