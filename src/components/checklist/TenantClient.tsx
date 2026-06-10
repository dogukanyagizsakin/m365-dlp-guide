'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Tenant, TaskCheck, TaskNote } from '@/types'
import { getChecks, getNotes, toggleCheck, upsertNote } from '@/lib/db'
import { getVisibleTasks, calcProgressFromChecks, calcPhaseProgressFromChecks } from '@/lib/progress'
import { PHASES } from '@/data/phases'
import { exportToPDF } from '@/lib/pdf'
import { useRouter } from 'next/navigation'

const LIC: Record<string, string> = { e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }

const PHASE_COLORS: Record<string, { bar: string; badge: string; text: string; bg: string; border: string }> = {
  p0: { bar: 'bg-indigo-500',  badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', text: 'text-indigo-400', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
  p1: { bar: 'bg-violet-500',  badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
  p2: { bar: 'bg-teal-500',    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',       text: 'text-teal-400',   bg: 'bg-teal-500/5',   border: 'border-teal-500/20' },
  p3: { bar: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',    text: 'text-amber-400',  bg: 'bg-amber-500/5',  border: 'border-amber-500/20' },
  p4: { bar: 'bg-orange-500',  badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', text: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
  p5: { bar: 'bg-green-500',   badge: 'bg-green-500/10 text-green-400 border-green-500/20',    text: 'text-green-400',  bg: 'bg-green-500/5',  border: 'border-green-500/20' },
}

export function TenantClient({ tenant }: { tenant: Tenant }) {
  const [checks, setChecks] = useState<TaskCheck[]>([])
  const [notes, setNotes] = useState<TaskNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState('p0')
  const [openNote, setOpenNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const router = useRouter()

  const load = useCallback(async () => {
    const [c, n] = await Promise.all([getChecks(tenant.id), getNotes(tenant.id)])
    setChecks(c); setNotes(n); setLoading(false)
  }, [tenant.id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = () => {
      let closest = PHASES[0].id, minDist = Infinity
      Object.entries(phaseRefs.current).forEach(([id, el]) => {
        if (!el) return
        const dist = Math.abs(el.getBoundingClientRect().top - 140)
        if (dist < minDist) { minDist = dist; closest = id }
      })
      setActivePhase(closest)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleToggle(taskId: string) {
    const current = checks.find(c => c.task_id === taskId && c.checked)
    const newChecked = !current
    setChecks(prev => {
      const existing = prev.find(c => c.task_id === taskId)
      if (existing) return prev.map(c => c.task_id === taskId ? { ...c, checked: newChecked } : c)
      return [...prev, { id: '', tenant_id: tenant.id, task_id: taskId, checked: newChecked, checked_at: null }]
    })
    await toggleCheck(tenant.id, taskId, newChecked)
  }

  async function handleSaveNote(taskId: string) {
    setSavingNote(true)
    await upsertNote(tenant.id, taskId, noteText)
    setNotes(prev => {
      const existing = prev.find(n => n.task_id === taskId)
      if (noteText.trim()) {
        if (existing) return prev.map(n => n.task_id === taskId ? { ...n, note: noteText } : n)
        return [...prev, { id: '', tenant_id: tenant.id, task_id: taskId, note: noteText, updated_at: '' }]
      }
      return prev.filter(n => n.task_id !== taskId)
    })
    setSavingNote(false)
    setOpenNote(null)
  }

  function openNoteFor(taskId: string) {
    const existing = notes.find(n => n.task_id === taskId)
    setNoteText(existing?.note || '')
    setOpenNote(taskId)
  }

  async function handlePDF() {
    setPdfLoading(true)
    try { await exportToPDF(tenant, checks, notes) }
    finally { setPdfLoading(false) }
  }

  const visiblePhases = getVisibleTasks(tenant.license)
  const { done, total, pct } = calcProgressFromChecks(checks, tenant.license)

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2.5">
            <button onClick={() => router.push('/dashboard')}
              className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-white">{tenant.name}</p>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md border font-medium ${
                  { e3: 'bg-blue-500/10 border-blue-500/20 text-blue-400', e5: 'bg-violet-500/10 border-violet-500/20 text-violet-400', bp: 'bg-zinc-700/50 border-zinc-700 text-zinc-400' }[tenant.license]
                }`}>{LIC[tenant.license]}</span>
              </div>
            </div>
            <button
              onClick={handlePDF}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition disabled:opacity-50"
            >
              {pdfLoading ? <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-white animate-spin" /> :
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>}
              PDF
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-zinc-500 flex-shrink-0">{done}/{total} · {pct}%</span>
          </div>
        </div>

        {/* Phase tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {visiblePhases.map((ph, i) => {
              const { done: pd, total: pt } = calcPhaseProgressFromChecks(ph.id, checks, tenant.license)
              const isDone = pd === pt && pt > 0
              const isActive = activePhase === ph.id
              const col = PHASE_COLORS[ph.id]
              return (
                <button key={ph.id}
                  onClick={() => { setActivePhase(ph.id); phaseRefs.current[ph.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 border ${
                    isDone ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : isActive ? `${col.bg} ${col.text} ${col.border}`
                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-green-400' : isActive ? col.bar : 'bg-zinc-700'}`} />
                  {i + 1}. {ph.shortLabel}
                  {isDone && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Checklist */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {visiblePhases.map((ph, i) => {
          const { done: pd, total: pt } = calcPhaseProgressFromChecks(ph.id, checks, tenant.license)
          const isDone = pd === pt && pt > 0
          const col = PHASE_COLORS[ph.id]
          const isCollapsed = collapsed[ph.id]

          return (
            <div key={ph.id} ref={el => { phaseRefs.current[ph.id] = el }}
              className={`rounded-2xl border overflow-hidden transition-all ${isDone ? 'border-green-500/20' : col.border}`}>

              {/* Phase header */}
              <button onClick={() => setCollapsed(c => ({ ...c, [ph.id]: !c[ph.id] }))}
                className={`w-full flex items-center gap-3 p-4 ${isDone ? 'bg-green-500/5' : col.bg} text-left`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDone ? 'bg-green-500/20 text-green-400' : `border ${col.border} ${col.text}`}`}>
                  {isDone ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? 'text-green-400' : col.text}`}>{ph.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-20 h-1 rounded-full bg-zinc-800/60 overflow-hidden">
                      <div className={`h-full rounded-full ${isDone ? 'bg-green-500' : col.bar}`} style={{ width: `${Math.round(pd / pt * 100)}%` }} />
                    </div>
                    <span className={`text-xs ${isDone ? 'text-green-500' : 'text-zinc-500'}`}>{pd}/{pt}</span>
                  </div>
                </div>
                <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isDone ? 'text-green-500' : 'text-zinc-600'} ${isCollapsed ? '-rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isCollapsed && (
                <>
                  <div className="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50">
                    <p className="text-xs text-zinc-500 leading-relaxed">{ph.info}</p>
                  </div>
                  <div className="divide-y divide-zinc-800/50">
                    {ph.tasks.map(task => {
                      const isChecked = !!checks.find(c => c.task_id === task.id && c.checked)
                      const hasNote = !!notes.find(n => n.task_id === task.id)
                      const isE5Only = task.tags.length === 1 && task.tags[0] === 'e5'

                      return (
                        <div key={task.id} className={`transition ${isChecked ? 'opacity-60' : ''}`}>
                          <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-zinc-800/20 cursor-pointer"
                            onClick={() => handleToggle(task.id)}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${isChecked ? 'bg-green-500 border-green-500' : 'border-zinc-600 hover:border-zinc-500'}`}>
                              {isChecked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 flex-wrap">
                                <p className={`text-sm font-medium leading-snug ${isChecked ? 'line-through text-zinc-600' : 'text-zinc-100'}`}>{task.title}</p>
                                {isE5Only && <span className="inline-flex px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 flex-shrink-0">E5</span>}
                                {hasNote && <span className="inline-flex px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-700/50 text-zinc-400 border border-zinc-700 flex-shrink-0">Not var</span>}
                              </div>
                              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{task.desc}</p>
                              {task.path && (
                                <code className="inline-block mt-1 text-[11px] text-zinc-500 bg-zinc-800/60 border border-zinc-700/50 px-2 py-0.5 rounded-md">{task.path}</code>
                              )}
                              {task.tip && (
                                <div className="flex items-start gap-1.5 mt-1.5">
                                  <svg className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <p className="text-[11px] text-amber-600">{task.tip}</p>
                                </div>
                              )}
                            </div>
                            {/* Note btn */}
                            <button
                              onClick={e => { e.stopPropagation(); openNoteFor(task.id) }}
                              className={`flex-shrink-0 p-1.5 rounded-lg transition ${hasNote ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}
                              title="Not ekle"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>

                          {/* Inline note editor */}
                          {openNote === task.id && (
                            <div className="px-4 pb-4 bg-zinc-900/40" onClick={e => e.stopPropagation()}>
                              <textarea
                                autoFocus
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                rows={3}
                                placeholder="Bu görev için notlar..."
                                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                              />
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => handleSaveNote(task.id)} disabled={savingNote}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition disabled:opacity-50">
                                  {savingNote && <div className="w-3 h-3 rounded-full border-2 border-indigo-300 border-t-white animate-spin" />}
                                  Kaydet
                                </button>
                                <button onClick={() => setOpenNote(null)} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-white transition">İptal</button>
                                {hasNote && <button onClick={() => { setNoteText(''); handleSaveNote(task.id) }} className="px-3 py-1.5 text-xs text-red-500 hover:text-red-400 transition ml-auto">Notu sil</button>}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}
        <div className="h-16" />
      </main>
    </div>
  )
}
