import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Folder } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo/jsonld'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata({
    title: locale === 'fr' ? 'Catégories | TwinFlameUnicity' : 'الفئات | TwinFlameUnicity',
    description: locale === 'fr'
      ? 'Explorez tous les sujets spirituels : flammes jumelles, numérologie, chakras et plus.'
      : 'استكشف جميع الموضوعات الروحية.',
    locale,
    path: '/categories',
  })
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, articles(count)')
    .order('name_fr')

  const isAr = locale === 'ar'

  return (
    <main className="min-h-screen bg-cosmic-gradient pt-24 pb-16">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white font-display mb-3">
            {isAr ? 'الفئات' : 'Catégories'}
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            {isAr
              ? 'اكتشف مجموعة مواضيعنا الروحية'
              : 'Explorez nos thèmes spirituels et trouvez les articles qui résonnent avec votre chemin'}
          </p>
        </div>

        {!categories || categories.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Folder className="w-12 h-12 mx-auto mb-3" />
            <p>{isAr ? 'لا توجد فئات بعد' : 'Aucune catégorie pour l\'instant'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => {
              const articleCount = (cat.articles as unknown as { count: number }[])?.[0]?.count ?? 0
              const name = isAr ? cat.name_ar : cat.name_fr
              const desc = isAr ? cat.description_ar : cat.description_fr

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group block"
                >
                  <div className="h-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-glow">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: cat.color ? `${cat.color}20` : 'rgba(147,51,234,0.15)', color: cat.color || '#a855f7' }}
                      >
                        {cat.icon || '✦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate" dir={isAr ? 'rtl' : 'ltr'}>
                          {name}
                        </h2>
                        {desc && (
                          <p className="text-white/40 text-sm mt-1 line-clamp-2" dir={isAr ? 'rtl' : 'ltr'}>
                            {desc}
                          </p>
                        )}
                        <p className="text-white/30 text-xs mt-2">
                          {articleCount} {isAr ? 'مقالة' : articleCount > 1 ? 'articles' : 'article'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
