import { createClient } from '@/lib/supabase/server'
import { AdminCategoriesClient } from '@/components/admin/AdminCategoriesClient'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, articles(count)')
    .order('name_en')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Catégories</h1>
          <p className="text-white/50 mt-1">{categories?.length ?? 0} catégorie(s)</p>
        </div>
      </div>
      <AdminCategoriesClient initialCategories={categories || []} />
    </div>
  )
}
