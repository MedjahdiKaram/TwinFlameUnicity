'use client'

import { useState } from 'react'
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'TwinFlameUnicity',
    siteUrl: 'https://twinflameunicity.com',
    siteDescription: 'Éveillez votre chemin spirituel avec TwinFlameUnicity',
    adminEmail: 'kar.giga@gmail.com',
    postsPerPage: '9',
    allowComments: true,
    moderateComments: true,
    allowRegistration: true,
    maintenanceMode: false,
    analyticsId: '',
  })

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast({ title: 'Paramètres sauvegardés' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-white/50 mt-1">Configuration globale du site</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" /> Général
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Palette className="w-4 h-4" /> Contenu
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" /> Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Informations générales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Nom du site</Label>
                <Input
                  value={settings.siteName}
                  onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL du site</Label>
                <Input
                  value={settings.siteUrl}
                  onChange={e => setSettings(s => ({ ...s, siteUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Input
                  value={settings.siteDescription}
                  onChange={e => setSettings(s => ({ ...s, siteDescription: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email admin</Label>
                <Input
                  type="email"
                  value={settings.adminEmail}
                  onChange={e => setSettings(s => ({ ...s, adminEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Google Analytics ID</Label>
                <Input
                  value={settings.analyticsId}
                  placeholder="G-XXXXXXXXXX"
                  onChange={e => setSettings(s => ({ ...s, analyticsId: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Mode maintenance</p>
                <p className="text-xs text-white/40">Le site affiche une page de maintenance aux visiteurs</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={v => setSettings(s => ({ ...s, maintenanceMode: v }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Contenu & blog</h2>
            <div className="space-y-1.5">
              <Label>Articles par page</Label>
              <Input
                type="number"
                value={settings.postsPerPage}
                onChange={e => setSettings(s => ({ ...s, postsPerPage: e.target.value }))}
                className="max-w-[120px]"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Autoriser les commentaires</p>
                <p className="text-xs text-white/40">Les utilisateurs connectés peuvent commenter</p>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={v => setSettings(s => ({ ...s, allowComments: v }))}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Modérer les commentaires</p>
                <p className="text-xs text-white/40">Les commentaires sont approuvés avant publication</p>
              </div>
              <Switch
                checked={settings.moderateComments}
                onCheckedChange={v => setSettings(s => ({ ...s, moderateComments: v }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Notifications email</h2>
            <p className="text-white/40 text-sm">Configuration des emails bientôt disponible.</p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Inscription & accès</h2>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Autoriser les inscriptions</p>
                <p className="text-xs text-white/40">Nouveaux utilisateurs peuvent créer un compte</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={v => setSettings(s => ({ ...s, allowRegistration: v }))}
              />
            </div>
            <p className="text-xs text-white/30">
              Les nouveaux comptes restent en attente d&apos;activation par l&apos;administrateur.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save} variant="glow" disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}
