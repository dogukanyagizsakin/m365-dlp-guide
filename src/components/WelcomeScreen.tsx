'use client'
import { useState } from 'react'
import type { useStore } from '@/lib/store'
import type { LicenseType } from '@/data/phases'
import { calcProgress } from '@/lib/progress'

interface Props {
  store: ReturnType<typeof useStore>
  onStart: () => void
}

export function WelcomeScreen({ store, onStart }: Props) {
  const [tenant, setTenant] = useState('')
  const [email, setEmail] = useState('')
  const [license, setLicense] = useState<LicenseType>('e3')
  const [error, setError] = useState('')

  const savedList = Object.values(store.sessions).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  function handleStart() {
    if (!tenant.trim()) { setError('Müşteri adı gerekli'); return }
    store.createSession(tenant.trim(), email.trim(), license)
    onStart()
  }

  function handleLoad(t: string) {
    store.loadSession(t)
    onStart()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">M365 DLP Rehberi</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">by UnifyTech</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: New session */}
          <div>
            <h1 className="text-2xl font-semibold mb-1">Yeni müşteri başlat</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Her müşteri için ayrı oturum açarak DLP yapılandırma ilerlemesini takip et.
            </p>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Müşteri / Tenant adı <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Ör: Acme Yazılım A.Ş."
                  value={tenant}
                  onChange={e => { setTenant(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Admin e-posta <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="admin@musteri.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Microsoft 365 lisansı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['e3', 'e5', 'bp'] as LicenseType[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLicense(l)}
                      className={`py-2 rounded-xl border text-sm font-medium transition ${
                        license === l
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {l === 'bp' ? 'Bus. Premium' : `M365 ${l.toUpperCase()}`}
                    </button>
                  ))}
                </div>
                {license === 'e5' && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                    ✓ Trainable classifiers, Endpoint DLP ve Sentinel entegrasyonu aktif
                  </p>
                )}
              </div>

              <button
                onClick={handleStart}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Yapılandırmayı başlat
              </button>
            </div>

            {/* Feature highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: '📋', label: '39 görev', sub: '6 aşama' },
                { icon: '💾', label: 'Otomatik kayıt', sub: 'Tarayıcıda saklanır' },
                { icon: '👥', label: 'Çoklu müşteri', sub: 'Sonsuz oturum' },
                { icon: '📤', label: 'Rapor export', sub: 'Kopyala & paylaş' },
              ].map(f => (
                <div key={f.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                  <p className="text-base mb-0.5">{f.icon}</p>
                  <p className="text-xs font-medium">{f.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Previous sessions */}
          <div>
            <h2 className="text-base font-semibold mb-1">Önceki oturumlar</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {savedList.length === 0 ? 'Henüz kayıtlı oturum yok.' : `${savedList.length} müşteri kaydı`}
            </p>

            {savedList.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
                <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm text-gray-400 dark:text-gray-600">Yeni bir müşteri ekle</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedList.map(s => {
                  const { done, total, pct } = calcProgress(s)
                  const date = new Date(s.updatedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
                  return (
                    <button
                      key={s.tenant}
                      onClick={() => handleLoad(s.tenant)}
                      className="w-full text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {s.tenant.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{s.tenant}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0">{date}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">{done}/{total}</span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                            {s.email || ({ e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }[s.license])}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
