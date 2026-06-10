'use client'
import { useState, useRef, useEffect } from 'react'
import type { useStore } from '@/lib/store'
import { PHASES } from '@/data/phases'
import { calcProgress, calcPhaseProgress, getVisibleTasks } from '@/lib/progress'
import { PhaseCard } from './PhaseCard'

interface Props {
  store: ReturnType<typeof useStore>
  onSummary: () => void
  onBack: () => void
}

const LIC_LABEL: Record<string, string> = { e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }

export function MainScreen({ store, onSummary, onBack }: Props) {
  const { current, toggleCheck } = store
  if (!current) return null

  const [activePhase, setActivePhase] = useState(PHASES[0].id)
  const containerRef = useRef<HTMLDivElement>(null)
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { done, total, pct } = calcProgress(current)
  const visiblePhases = getVisibleTasks(current.license)

  function scrollToPhase(id: string) {
    setActivePhase(id)
    phaseRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Update active phase on scroll
  useEffect(() => {
    const handler = () => {
      let closest = PHASES[0].id
      let minDist = Infinity
      Object.entries(phaseRefs.current).forEach(([id, el]) => {
        if (!el) return
        const dist = Math.abs(el.getBoundingClientRect().top - 120)
        if (dist < minDist) { minDist = dist; closest = id }
      })
      setActivePhase(closest)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold truncate">{current.tenant}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
                  {LIC_LABEL[current.license]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{done}/{total} · {pct}%</span>
              </div>
            </div>
            <button
              onClick={onSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Özet
            </button>
          </div>
        </div>

        {/* Phase nav */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {visiblePhases.map((ph, i) => {
              const { done: pd, total: pt } = calcPhaseProgress(ph.id, current)
              const isDone = pd === pt && pt > 0
              const isActive = activePhase === ph.id
              return (
                <button
                  key={ph.id}
                  onClick={() => scrollToPhase(ph.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                    isDone
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-green-500' : isActive ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  {i + 1}. {ph.shortLabel}
                  {isDone && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-4" ref={containerRef}>
        {visiblePhases.map((ph, i) => (
          <div key={ph.id} ref={el => { phaseRefs.current[ph.id] = el }}>
            <PhaseCard
              phase={ph}
              index={i}
              session={current}
              onToggle={toggleCheck}
            />
          </div>
        ))}
        <div className="h-16" />
      </main>
    </div>
  )
}
