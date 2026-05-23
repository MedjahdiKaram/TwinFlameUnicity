import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { generatePageMetadata } from '@/lib/seo/jsonld'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (!cat) return {}
  return generatePageMetadata({
    title: `${locale === 'fr' ? cat.name_fr : cat.name_ar} | TwinFlameUnicity`,
    description: (locale === 'fr' ? cat.description_fr : cat.description_ar) || '',
    locale,
    path: `/categories/${slug}`,
  })
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  const supabase = await createClient()
  const isAr = locale === 'ar'

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(*), profiles(pseudo, full_name, avatar_url)')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const name = isAr ? category.name_ar : category.name_fr
  const desc = isAr ? category.description_ar : category.description_fr

  return (
    <main className="min-h-screen bg-cosmic-gradient pt-24 pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Back */}
        <Link href="/categories" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'جميع الفئات' : 'Toutes les catégories'}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: category.color ? `${category.color}20` : 'rgba(147,51,234,0.15)', color: category.color || '#a855f7' }}
            >
              {category.icon || '✦'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display" dir={isAr ? 'rtl' : 'ltr'}>{name}</h1>
              {desc && <p className="text-white/50 mt-1" dir={isAr ? 'rtl' : 'ltr'}>{desc}</p>}
            </div>
          </div>
          <p className="text-white/30 text-sm">
            {articles?.length ?? 0} {isAr ? 'مقالة' : 'article(s)'}
          </p>
        </div>

        {/* Articles */}
        {!articles || articles.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p>{isAr ? 'لا توجد مقالات في هذه الفئة بعد' : 'Aucun article dans cette catégorie pour l\'instant'}</p>
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
