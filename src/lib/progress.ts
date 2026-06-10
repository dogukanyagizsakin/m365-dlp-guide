import { PHASES } from '@/data/phases'
import type { LicenseType } from '@/data/phases'
import type { TaskCheck } from '@/types'

export function getVisibleTasks(license: LicenseType) {
  return PHASES.map(ph => ({
    ...ph,
    tasks: ph.tasks.filter(t => {
      if (t.tags.length === 1 && t.tags[0] === 'e5' && license !== 'e5') return false
      return true
    })
  }))
}

export function calcProgressFromChecks(checks: TaskCheck[], license: LicenseType) {
  const phases = getVisibleTasks(license)
  let total = 0, done = 0
  phases.forEach(ph => ph.tasks.forEach(t => {
    total++
    if (checks.find(c => c.task_id === t.id && c.checked)) done++
  }))
  return { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0 }
}

export function calcPhaseProgressFromChecks(phaseId: string, checks: TaskCheck[], license: LicenseType) {
  const phases = getVisibleTasks(license)
  const ph = phases.find(p => p.id === phaseId)
  if (!ph) return { total: 0, done: 0, pct: 0 }
  const total = ph.tasks.length
  const done = ph.tasks.filter(t => checks.find(c => c.task_id === t.id && c.checked)).length
  return { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0 }
}