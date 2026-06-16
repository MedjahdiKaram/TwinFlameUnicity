'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle, XCircle, Trash2, Shield, User, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { createUserAction } from '@/server/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  pseudo: string | null
  gender: string | null
  role: 'admin' | 'user' | 'visitor'
  status: 'pending' | 'active' | 'disabled'
  is_vip: boolean
  created_at: string
  avatar_url: string | null
}

interface Props {
  users: UserProfile[]
  locale: 'en' | 'ar'
}

const STATUS_CONFIG = {
  active: { color: 'text-green-400 bg-green-400/10 border-green-400/30', label: 'Active' },
  pending: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'Pending' },
  disabled: { color: 'text-red-400 bg-red-400/10 border-red-400/30', label: 'Disabled' },
}

export function AdminUsersTable({ users: initialUsers, locale }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'disabled'>('all')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user' | 'visitor'>('user')
  const [status, setStatus] = useState<'pending' | 'active' | 'disabled'>('active')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('prefer_not_to_say')

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !role) {
      toast({
        title: 'Error',
        description: 'Please fill in the required fields.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('role', role)
      formData.append('status', status)
      formData.append('first_name', firstName)
      formData.append('last_name', lastName)
      formData.append('pseudo', pseudo)
      formData.append('gender', gender)

      const result = await createUserAction(formData)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.success && result.user) {
        toast({
          title: 'Success',
          description: 'User created successfully.',
        })
        
        // Append the new user to state
        setUsers((prev) => [result.user as UserProfile, ...prev])
        
        // Close modal and reset form
        setIsAddOpen(false)
        setEmail('')
        setPassword('')
        setRole('user')
        setStatus('active')
        setFirstName('')
        setLastName('')
        setPseudo('')
        setGender('prefer_not_to_say')
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'An error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.pseudo?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchStatus
  })

  const updateStatus = async (userId: string, newStatus: UserProfile['status']) => {
    const supabase = createClient() as any
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Permanently delete this user?')) return
    const supabase = createClient() as any
    await supabase.from('profiles').delete().eq('id', userId)
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, username..."
            className="input-cosmic ps-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'active', 'disabled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              {s === 'pending' && users.filter((u) => u.status === 'pending').length > 0 && (
                <span className="ms-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                  {users.filter((u) => u.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ms-auto">
          <span className="text-xs text-white/30">{filtered.length} users</span>
          <Button onClick={() => setIsAddOpen(true)} variant="glow" size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add user
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start px-5 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Pseudo</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Pseudo</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Email</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Role</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/20 text-sm">
                    No users
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => {
                  const status = STATUS_CONFIG[user.status]
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs text-purple-300 font-semibold flex-shrink-0">
                              {(user.pseudo || user.first_name || user.email || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-white/80 font-medium">
                              {`${user.first_name || ''} ${user.last_name || ''}`.trim() || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/50">{user.pseudo || '—'}</td>
                      <td className="px-4 py-4 text-sm text-white/50">{user.email}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`flex items-center gap-1 text-xs font-medium w-fit ${user.role === 'admin' ? 'text-purple-300' : 'text-white/40'}`}>
                            {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {user.role}
                          </span>
                          {user.is_vip && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                              VIP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-white/30">
                        {formatDate(user.created_at, locale, 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(user.id, 'active')}
                              title="Activate"
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => updateStatus(user.id, 'disabled')}
                              title="Deactivate"
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user.status === 'disabled' && (
                            <button
                              onClick={() => updateStatus(user.id, 'active')}
                              title="Reactivate"
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              const supabase = createClient() as any
                              await supabase.from('profiles').update({ is_vip: !user.is_vip }).eq('id', user.id)
                              setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_vip: !user.is_vip } : u))
                            }}
                            title={user.is_vip ? "Remove VIP" : "Make VIP"}
                            className={`p-1.5 rounded-lg transition-colors ${user.is_vip ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/40 hover:bg-amber-500/20 hover:text-amber-400'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" className="lucide lucide-crown"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Add new user
            </DialogTitle>
            <DialogDescription>
              Create a user account and configure their information and access role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="firstName" className="text-white/70">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="lastName" className="text-white/70">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="pseudo" className="text-white/70">Username <span className="text-purple-400">*</span></Label>
                <Input
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="jeandupont"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="gender" className="text-white/70">Gender</Label>
                <Select value={gender} onValueChange={(val: any) => setGender(val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/70">Email Address <span className="text-purple-400">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              />
            </div>

            <div className="space-y-1.5 relative">
                <Label htmlFor="password" className="text-white/70">Password <span className="text-purple-400">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="role" className="text-white/70">Role <span className="text-purple-400">*</span></Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="status" className="text-white/70">Status <span className="text-purple-400">*</span></Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create user
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
