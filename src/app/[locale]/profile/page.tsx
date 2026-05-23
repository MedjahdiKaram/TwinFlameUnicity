import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/profile/ProfileClient'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/connexion`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, pseudo, email, bio, avatar_url, role, status, created_at')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/${locale}/connexion`)

  return (
    <main className="min-h-screen bg-cosmic-gradient pt-24 pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-purple-600/5 blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4">
        <ProfileClient profile={profile} />
      </div>
    </main>
  )
}
