import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()
  const { data: tag } = await supabase.from('tags').select('*').eq('slug', decodedSlug).single()
  if (!tag) return {}
  return {
    title: `${locale === 'en' ? tag.name_en : tag.name_ar} | TwinFlameUnicity`,
  }
}

export default async function TagPage({ params }: Props) {
  const { locale, slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()
  const isAr = locale === 'ar'

  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', decodedSlug)
    .single()

  if (!tag) notFound()

  // Get articles for this tag
  const { data: articleTags } = await supabase
    .from('article_tags')
    .select('article_id')
    .eq('tag_id', tag.id)

  const articleIds = articleTags?.map(at => at.article_id) || []

  const { data: articles } = articleIds.length > 0
    ? await supabase
        .from('articles')
        .select('*, categories(*), profiles(pseudo, full_name, avatar_url)')
        .in('id', articleIds)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    : { data: [] }

  const name = isAr ? tag.name_ar : tag.name_en

  return (
    <main className="min-h-screen bg-cosmic-gradient pt-24 pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <Link href="/tags" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-8">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'جميع الوسوم' : 'All tags'}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Tag className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-display" dir={isAr ? 'rtl' : 'ltr'}>
              {name}
            </h1>
            <p className="text-white/30 text-sm">
              {articles?.length ?? 0} {isAr ? 'مقالة' : 'article(s)'}
            </p>
          </div>
        </div>

        {!articles || articles.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p>{isAr ? 'لا توجد مقالات بهذا الوسم بعد' : 'Aucun article avec ce tag pour l\'instant'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
