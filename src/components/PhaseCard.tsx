'use client'
import { useState } from 'react'
import type { Phase } from '@/data/phases'
import type { TenantSession } from '@/lib/store'
import { calcPhaseProgress, getVisibleTasks } from '@/lib/progress'

const PHASE_COLORS: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  p0: { ring: 'border-indigo-200 dark:border-indigo-800', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' },
  p1: { ring: 'border-violet-200 dark:border-violet-800', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' },
  p2: { ring: 'border-teal-200 dark:border-teal-800', bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300' },
  p3: { ring: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
  p4: { ring: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' },
  p5: { ring: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' },
}

interface Props {
  phase: Phase
  index: number
  session: TenantSession
  onToggle: (taskId: string) => void
}

export function PhaseCard({ phase, index, session, onToggle }: Props) {
  const [expanded, setExpanded] = useState(true)
  const visiblePhases = getVisibleTasks(session.license)
  const ph = visiblePhases.find(p => p.id === phase.id)!
  const { done, total, pct } = calcPhaseProgress(phase.id, session)
  const allDone = done === total && total > 0
  const col = PHASE_COLORS[phase.id] || PHASE_COLORS.p0

  return (
    <div className={`rounded-2xl border ${allDone ? 'border-green-200 dark:border-green-800' : col.ring} bg-white dark:bg-gray-900 overflow-hidden transition-all`}>
      {/* Phase header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 p-4 ${allDone ? 'bg-green-50 dark:bg-green-950/20' : col.bg} text-left`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${allDone ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : col.badge}`}>
          {allDone ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (index + 1)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${allDone ? 'text-green-700 dark:text-green-300' : col.text}`}>
            {phase.label}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1 rounded-full bg-white/60 dark:bg-black/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-current opacity-60'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${allDone ? 'text-green-600 dark:text-green-400' : col.text} opacity-80`}>
              {done}/{total}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform ${allDone ? 'text-green-500' : col.text} opacity-60 ${expanded ? '' : '-rotate-90'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <>
          {/* Info banner */}
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{phase.info}</p>
          </div>

          {/* Tasks */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {ph.tasks.map(task => {
              const checked = !!session.checks[task.id]
              const isE5Only = task.tags.length === 1 && task.tags[0] === 'e5'
              return (
                <button
                  key={task.id}
                  onClick={() => onToggle(task.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${checked ? 'opacity-70' : ''}`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                    checked
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className={`text-sm font-medium leading-snug ${checked ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}>
                        {task.title}
                      </p>
                      {isE5Only && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 flex-shrink-0">
                          E5
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{task.desc}</p>
                    {task.path && (
                      <p className="mt-1 text-xs font-mono text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md inline-block">
                        {task.path}
                      </p>
                    )}
                    {task.tip && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <svg className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-amber-600 dark:text-amber-400">{task.tip}</p>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
