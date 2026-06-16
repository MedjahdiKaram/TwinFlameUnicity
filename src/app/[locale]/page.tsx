import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/hero/HeroSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { BlogPreviewSection } from '@/components/home/BlogPreviewSection'
import { QuizBanner } from '@/components/home/QuizBanner'
import { JourneyTimeline } from '@/components/home/JourneyTimeline'
import { createAdminClient } from '@/lib/supabase/server'
import type { ArticleCard } from '@/types/database.types'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return {
    title: t('default_title'),
    description: t('default_description'),
  }
}

async function getLatestArticles(locale: string): Promise<ArticleCard[]> {
  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('articles')
      .select(`
        id, slug, title, excerpt, cover_url, cover_alt,
        is_vip, is_featured, language, reading_time, views, likes,
        published_at, category_id,
          category:categories(id, name_en, name_ar, slug, color),
          tags:article_tags(tag:tags(id, name_en, name_ar, slug)),
        author:profiles!articles_author_id_fkey(id, pseudo, first_name, last_name, avatar_url)
      `)
      .eq('status', 'published')
      .eq('language', locale)
      .order('published_at', { ascending: false })
      .limit(7)

    if (!data) return []

    // Flatten nested tags
    return data.map((a: any) => ({
      ...a,
      tags: a.tags?.map((t: any) => t.tag) ?? [],
    })) as ArticleCard[]
  } catch {
    return []
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const articles = await getLatestArticles(locale)

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <HeroSection />
        <ServicesSection locale={locale as 'en' | 'ar'} />
        <Suspense fallback={null}>
          <BlogPreviewSection articles={articles} locale={locale as 'en' | 'ar'} />
        </Suspense>
        <QuizBanner />
        <JourneyTimeline />
      </main>
      <Footer locale={locale} />
    </>
  )
}
