import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { Tag } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Tags | TwinFlameUnicity' : 'الوسوم | TwinFlameUnicity',
  }
}

export default async function TagsPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const isAr = locale === 'ar'

  const { data: tags } = await supabase
    .from('tags')
    .select('*, article_tags(count)')
    .order('name_fr')

  return (
    <main className="min-h-screen bg-cosmic-gradient pt-24 pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white font-display mb-3">
            {isAr ? 'الوسوم' : 'Tags'}
          </h1>
          <p className="text-white/50">
            {isAr ? 'تصفح المقالات حسب الوسم' : 'Parcourez les articles par thématique'}
          </p>
        </div>

        {!tags || tags.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Tag className="w-10 h-10 mx-auto mb-3" />
            <p>{isAr ? 'لا توجد وسوم بعد' : 'Aucun tag pour l\'instant'}</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map(tag => {
              const count = (tag.article_tags as unknown as { count: number }[])?.[0]?.count ?? 0
              const name = isAr ? tag.name_ar : tag.name_fr
              const size = count > 10 ? 'text-xl' : count > 5 ? 'text-base' : 'text-sm'

              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className={`group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-400/40 transition-all duration-200 ${size}`}
                >
                  <Tag className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 group-hover:text-purple-200 font-medium" dir={isAr ? 'rtl' : 'ltr'}>
                    {name}
                  </span>
                  {count > 0 && (
                    <span className="text-purple-500 text-xs">({count})</span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
