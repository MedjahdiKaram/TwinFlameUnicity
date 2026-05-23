import { createClient } from '@/lib/supabase/server'
import { AdminMediaClient } from '@/components/admin/AdminMediaClient'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const supabase = await createClient()

  const { data: mediaFiles } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Médiathèque</h1>
        <p className="text-white/50 mt-1">{mediaFiles?.length ?? 0} fichier(s)</p>
      </div>
      <AdminMediaClient initialMedia={mediaFiles || []} />
    </div>
  )
}
