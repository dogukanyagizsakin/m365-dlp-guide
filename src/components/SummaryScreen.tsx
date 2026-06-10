'use client'
import { useState } from 'react'
import type { useStore } from '@/lib/store'
import { calcProgress, calcPhaseProgress, getVisibleTasks, generateReport } from '@/lib/progress'
import { PHASES } from '@/data/phases'

interface Props {
  store: ReturnType<typeof useStore>
  onBack: () => void
  onNew: () => void
}

const LIC_LABEL: Record<string, string> = { e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }

const PHASE_COLORS: Record<string, string> = {
  p0: 'bg-indigo-500', p1: 'bg-violet-500', p2: 'bg-teal-500',
  p3: 'bg-amber-500', p4: 'bg-orange-500', p5: 'bg-green-500'
}

export function SummaryScreen({ store, onBack, onNew }: Props) {
  const { current, resetSession, deleteSession } = store
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  if (!current) return null

  const { done, total, pct } = calcProgress(current)
  const phases = getVisibleTasks(current.license)
  const date = new Date(current.updatedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })

  async function handleExport() {
    const txt = generateReport(current!)
    try {
      await navigator.clipboard.writeText(txt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      alert(txt)
    }
  }

  function handleReset() {
    resetSession()
    onBack()
  }

  function handleDelete() {
    deleteSession(current!.tenant)
    onNew()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-sm font-semibold">Yapılandırma özeti</p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Tenant info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {current.tenant.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{current.tenant}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{current.email || LIC_LABEL[current.license]}</p>
              {current.email && <p className="text-xs text-gray-400">{LIC_LABEL[current.license]} · Son güncelleme: {date}</p>}
            </div>
          </div>

          {/* Big progress */}
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-semibold">{pct}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{done} / {total} görev tamamlandı</p>
            </div>
            <div className="flex-1 pb-1.5">
              <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Per-phase breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4">
          <p className="text-sm font-semibold mb-4">Aşama bazında ilerleme</p>
          <div className="space-y-3">
            {phases.map((ph, i) => {
              const { done: pd, total: pt, pct: pp } = calcPhaseProgress(ph.id, current)
              const isDone = pd === pt && pt > 0
              return (
                <div key={ph.id} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500' : PHASE_COLORS[ph.id] || 'bg-gray-400'}`}>
                    {isDone ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 w-36 flex-shrink-0 truncate">{ph.label}</p>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : PHASE_COLORS[ph.id] || 'bg-gray-400'}`}
                      style={{ width: `${pp}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{pd}/{pt}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Incomplete tasks */}
        {done < total && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold mb-3">Tamamlanmayan görevler</p>
            <div className="space-y-1.5">
              {phases.flatMap(ph =>
                ph.tasks
                  .filter(t => !current.checks[t.id])
                  .map(t => (
                    <div key={t.id} className="flex items-start gap-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-1.5" />
                      <div>
                        <p className="text-xs font-medium">{t.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">{ph.label}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kopyalandı!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Raporu kopyala
              </>
            )}
          </button>

          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni müşteri
          </button>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2 text-xs text-gray-400 hover:text-amber-600 transition"
            >
              İlerlemeyi sıfırla
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2 text-xs text-gray-400 hover:text-red-600 transition"
              >
                Müşteriyi sil
              </button>
            ) : (
              <button
                onClick={handleDelete}
                className="flex-1 py-2 text-xs text-red-600 font-medium"
              >
                Emin misin? Sil
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
