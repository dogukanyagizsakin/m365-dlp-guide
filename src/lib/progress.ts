import { PHASES } from '@/data/phases'
import type { LicenseType } from '@/data/phases'
import type { TenantSession } from './store'

export function getVisibleTasks(license: LicenseType) {
  return PHASES.map(ph => ({
    ...ph,
    tasks: ph.tasks.filter(t => {
      if (t.tags.length === 1 && t.tags[0] === 'e5' && license !== 'e5') return false
      return true
    })
  }))
}

export function calcProgress(session: TenantSession) {
  const phases = getVisibleTasks(session.license)
  let total = 0, done = 0
  phases.forEach(ph => {
    ph.tasks.forEach(t => {
      total++
      if (session.checks[t.id]) done++
    })
  })
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function calcPhaseProgress(phaseId: string, session: TenantSession) {
  const phases = getVisibleTasks(session.license)
  const ph = phases.find(p => p.id === phaseId)
  if (!ph) return { total: 0, done: 0, pct: 0 }
  const total = ph.tasks.length
  const done = ph.tasks.filter(t => session.checks[t.id]).length
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function generateReport(session: TenantSession): string {
  const phases = getVisibleTasks(session.license)
  const { done, total } = calcProgress(session)
  const lic = { e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }[session.license]
  const date = new Date(session.updatedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })

  let txt = `╔══════════════════════════════════════════════════╗\n`
  txt += `║     Microsoft 365 DLP Yapılandırma Raporu       ║\n`
  txt += `╚══════════════════════════════════════════════════╝\n\n`
  txt += `Müşteri  : ${session.tenant}\n`
  txt += `Admin    : ${session.email || '-'}\n`
  txt += `Lisans   : ${lic}\n`
  txt += `Tarih    : ${date}\n`
  txt += `İlerleme : ${done}/${total} görev (${Math.round(done / total * 100)}%)\n\n`
  txt += `──────────────────────────────────────────────────\n\n`

  phases.forEach(ph => {
    const phdone = ph.tasks.filter(t => session.checks[t.id]).length
    txt += `▸ ${ph.label.toUpperCase()} (${phdone}/${ph.tasks.length})\n`
    ph.tasks.forEach(t => {
      txt += `  ${session.checks[t.id] ? '[✓]' : '[ ]'} ${t.title}\n`
    })
    txt += '\n'
  })
  return txt
}
