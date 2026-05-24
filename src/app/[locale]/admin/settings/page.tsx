'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Bell, Shield, Palette, Brain } from 'lucide-react'
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

  const [aiSettings, setAiSettings] = useState({
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    temperature: 0.7,
    nanoBananaKey: '',
    nanoBananaUrl: 'https://api.nanobanana.com/v1/images/generations',
    nanoBananaModel: 'nano-banana-v1',
  })

  useEffect(() => {
    const saved = localStorage.getItem('twinflame_settings')
    if (saved) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }))
      } catch (e) {
        console.error('Error parsing settings', e)
      }
    }
    const savedAi = localStorage.getItem('twinflame_ai_settings')
    if (savedAi) {
      try {
        setAiSettings(prev => ({ ...prev, ...JSON.parse(savedAi) }))
      } catch (e) {
        console.error('Error parsing AI settings', e)
      }
    }
  }, [])

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    localStorage.setItem('twinflame_settings', JSON.stringify(settings))
    localStorage.setItem('twinflame_ai_settings', JSON.stringify(aiSettings))
    setSaving(false)
    toast({ title: 'Paramètres sauvegardés' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-white/50 mt-1">Configuration globale du site et de l&apos;intelligence artificielle</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap gap-1 bg-black/40 p-1 border border-white/10 rounded-xl max-w-fit">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" /> Général
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Palette className="w-4 h-4" /> Contenu
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="w-4 h-4" /> Intelligence Artificielle
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

        <TabsContent value="ai">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-semibold text-white text-lg">Configuration de l&apos;IA</h2>
              <p className="text-white/40 text-xs mt-1">Configurez le fournisseur d&apos;IA par défaut pour la génération de résumés et méta-données.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Fournisseur IA</Label>
                <select
                  value={aiSettings.provider}
                  onChange={e => {
                    const prov = e.target.value
                    let model = 'gpt-4o'
                    if (prov === 'gemini') model = 'gemini-1.5-flash'
                    if (prov === 'claude') model = 'claude-3.5-sonnet'
                    setAiSettings(s => ({ ...s, provider: prov, model }))
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-600/50 text-sm"
                >
                  <option value="openai" className="bg-slate-950">OpenAI</option>
                  <option value="gemini" className="bg-slate-950">Google Gemini</option>
                  <option value="claude" className="bg-slate-950">Anthropic Claude</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Modèle par défaut</Label>
                <select
                  value={aiSettings.model}
                  onChange={e => setAiSettings(s => ({ ...s, model: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-600/50 text-sm"
                >
                  {aiSettings.provider === 'openai' && (
                    <>
                      <option value="gpt-4o" className="bg-slate-955">gpt-4o (Défaut)</option>
                      <option value="gpt-4o-mini" className="bg-slate-955">gpt-4o-mini</option>
                      <option value="gpt-4-turbo" className="bg-slate-955">gpt-4-turbo</option>
                    </>
                  )}
                  {aiSettings.provider === 'gemini' && (
                    <>
                      <option value="gemini-1.5-flash" className="bg-slate-955">gemini-1.5-flash (Défaut)</option>
                      <option value="gemini-1.5-pro" className="bg-slate-955">gemini-1.5-pro</option>
                    </>
                  )}
                  {aiSettings.provider === 'claude' && (
                    <>
                      <option value="claude-3.5-sonnet" className="bg-slate-955">claude-3.5-sonnet (Défaut)</option>
                      <option value="claude-3-opus" className="bg-slate-955">claude-3-opus</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Clé API</Label>
                <Input
                  type="password"
                  placeholder={`Clé API pour ${aiSettings.provider === 'openai' ? 'OpenAI' : aiSettings.provider === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}`}
                  value={aiSettings.apiKey}
                  onChange={e => setAiSettings(s => ({ ...s, apiKey: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between text-sm">
                  <Label>Température de créativité ({aiSettings.temperature})</Label>
                  <span className="text-white/40 text-xs">
                    {aiSettings.temperature <= 0.3 ? 'Précis' : aiSettings.temperature >= 0.8 ? 'Créatif' : 'Équilibré'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={e => setAiSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-600 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-5">
              <div>
                <h3 className="font-semibold text-white text-md">Génération d&apos;images — NanoBanana</h3>
                <p className="text-white/40 text-xs mt-1">Configurez les paramètres de l&apos;API NanoBanana pour la création automatique d&apos;images d&apos;articles.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Clé API NanoBanana</Label>
                  <Input
                    type="password"
                    placeholder="Clé API NanoBanana"
                    value={aiSettings.nanoBananaKey}
                    onChange={e => setAiSettings(s => ({ ...s, nanoBananaKey: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL de l&apos;API NanoBanana</Label>
                  <Input
                    placeholder="https://api.nanobanana.com/v1/images/generations"
                    value={aiSettings.nanoBananaUrl}
                    onChange={e => setAiSettings(s => ({ ...s, nanoBananaUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Modèle d&apos;image par défaut</Label>
                  <Input
                    placeholder="nano-banana-v1"
                    value={aiSettings.nanoBananaModel}
                    onChange={e => setAiSettings(s => ({ ...s, nanoBananaModel: e.target.value }))}
                  />
                </div>
              </div>
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
