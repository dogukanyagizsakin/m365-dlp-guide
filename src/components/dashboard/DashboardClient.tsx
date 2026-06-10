'use client'
import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Tenant } from '@/types'
import type { LicenseType } from '@/data/phases'
import { getTenants, createTenant, deleteTenant } from '@/lib/db'
import { getChecks } from '@/lib/db'
import { calcProgressFromChecks } from '@/lib/progress'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LIC: Record<string, string> = { e3: 'E3', e5: 'E5', bp: 'Biz. Premium' }
const LIC_FULL: Record<string, string> = { e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }

interface TenantCard extends Tenant { done: number; total: number; pct: number }

export function DashboardClient({ user }: { user: User }) {
  const [tenants, setTenants] = useState<TenantCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newLic, setNewLic] = useState<LicenseType>('e3')
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const list = await getTenants(user.id)
    const cards: TenantCard[] = await Promise.all(
      list.map(async t => {
        const checks = await getChecks(t.id)
        const { done, total, pct } = calcProgressFromChecks(checks, t.license)
        return { ...t, done, total, pct }
      })
    )
    setTenants(cards)
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const t = await createTenant(user.id, newName.trim(), newEmail.trim(), newLic)
    if (t) {
      setShowNew(false); setNewName(''); setNewEmail(''); setNewLic('e3')
      await load()
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    await deleteTenant(id)
    setDeleteId(null)
    setTenants(prev => prev.filter(t => t.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const total = tenants.length
  const avgPct = total > 0 ? Math.round(tenants.reduce((a, t) => a + t.pct, 0) / total) : 0
  const completed = tenants.filter(t => t.pct === 100).length

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Topbar */}
      <header className="border-b border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white leading-tight">M365 DLP Rehberi</p>
            <p className="text-xs text-zinc-500 leading-tight">UnifyTech</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-zinc-400 max-w-[120px] truncate">{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {tenants.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Toplam müşteri', value: total, color: 'text-white' },
              { label: 'Ortalama ilerleme', value: `${avgPct}%`, color: 'text-indigo-400' },
              { label: 'Tamamlanan', value: completed, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold">Müşteriler</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{total} tenant · DLP yapılandırma takibi</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni müşteri
          </button>
        </div>

        {/* New tenant modal */}
        {showNew && (
          <div className="mb-5 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">Yeni müşteri ekle</p>
              <button onClick={() => setShowNew(false)} className="text-zinc-500 hover:text-white transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Müşteri adı *</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Acme A.Ş."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Admin e-posta</label>
                <input
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="admin@acme.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Lisans</label>
                <select
                  value={newLic}
                  onChange={e => setNewLic(e.target.value as LicenseType)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="e3">M365 E3</option>
                  <option value="e5">M365 E5</option>
                  <option value="bp">Business Premium</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
              >
                {creating && <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-300 border-t-white animate-spin" />}
                Oluştur
              </button>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Tenant grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-4" />
                <div className="h-1.5 bg-zinc-800 rounded mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-zinc-400 font-medium mb-1">Henüz müşteri yok</p>
            <p className="text-zinc-600 text-sm mb-4">İlk müşteriyi ekleyerek başla</p>
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition"
            >
              Müşteri ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map(t => (
              <div
                key={t.id}
                className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition cursor-pointer relative"
                onClick={() => router.push(`/tenant/${t.id}`)}
              >
                {/* Delete btn */}
                {deleteId === t.id ? (
                  <div className="absolute top-3 right-3 flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDelete(t.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg">Sil</button>
                    <button onClick={() => setDeleteId(null)} className="px-2 py-1 bg-zinc-700 text-white text-xs rounded-lg">İptal</button>
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteId(t.id) }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-base font-semibold text-zinc-300 flex-shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate pr-6">{t.name}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{t.email || LIC_FULL[t.license]}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${t.pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{t.done}/{t.total} görev</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-md border text-[11px] font-medium ${
                        { e3: 'bg-blue-500/10 border-blue-500/20 text-blue-400', e5: 'bg-violet-500/10 border-violet-500/20 text-violet-400', bp: 'bg-zinc-700/50 border-zinc-600 text-zinc-400' }[t.license]
                      }`}>{LIC[t.license]}</span>
                      <span className={`text-xs font-semibold ${t.pct === 100 ? 'text-green-400' : 'text-zinc-400'}`}>{t.pct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
