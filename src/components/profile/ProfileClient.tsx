'use client'

import { useState } from 'react'
import { Camera, Save, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { updateProfileAction, logoutAction } from '@/server/actions/auth'
import { toast } from '@/hooks/use-toast'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  pseudo: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  role: string
  status: string
  created_at: string
}

interface Props {
  profile: Profile
}

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  user: 'Membre',
  visitor: 'Visiteur',
}

const statusVariants: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  pending: 'warning',
  disabled: 'secondary',
}

const statusLabels: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  disabled: 'Désactivé',
}

export function ProfileClient({ profile }: Props) {
  const [saving, setSaving] = useState(false)

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  const initials = (fullName || profile.pseudo || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProfileAction(formData)
    setSaving(false)
    if (result?.error) {
      toast({ title: 'Erreur', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Profil mis à jour' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-display">Mon profil</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2 text-white/50 hover:text-white">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </form>
      </div>

      {/* Profile card */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        {/* Avatar + info */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={fullName || profile.pseudo || ''} />
              )}
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors shadow-glow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {fullName || profile.pseudo || 'Utilisateur'}
            </h2>
            <p className="text-white/50 text-sm truncate">@{profile.pseudo}</p>
            <p className="text-white/30 text-sm truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="default">{roleLabels[profile.role] || profile.role}</Badge>
              <Badge variant={statusVariants[profile.status] || 'secondary'}>
                {statusLabels[profile.status] || profile.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={profile.first_name || ''}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={profile.last_name || ''}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="pseudo">Pseudo</Label>
              <Input
                id="pseudo"
                name="pseudo"
                defaultValue={profile.pseudo || ''}
                placeholder="votre-pseudo"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio || ''}
                placeholder="Parlez-nous de vous..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="glow" disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>

      <p className="text-center text-white/25 text-xs">
        Membre depuis{' '}
        {new Date(profile.created_at).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
        })}
      </p>
    </motion.div>
  )
}
