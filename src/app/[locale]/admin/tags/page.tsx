import { createClient } from '@/lib/supabase/server'
import { AdminTagsClient } from '@/components/admin/AdminTagsClient'

export const dynamic = 'force-dynamic'

export default async function AdminTagsPage() {
  const supabase = await createClient()

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name_fr')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tags</h1>
        <p className="text-white/50 mt-1">{tags?.length ?? 0} tag(s)</p>
      </div>
      <AdminTagsClient initialTags={tags || []} />
    </div>
  )
}
