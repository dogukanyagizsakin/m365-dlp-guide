import type { Tenant, TaskCheck, TaskNote } from '@/types'
import { getVisibleTasks } from './progress'
import { PHASES } from '@/data/phases'

const PHASE_COLORS: Record<string, [number, number, number]> = {
  p0: [99, 102, 241],
  p1: [139, 92, 246],
  p2: [20, 184, 166],
  p3: [245, 158, 11],
  p4: [249, 115, 22],
  p5: [34, 197, 94],
}

export async function exportToPDF(
  tenant: Tenant,
  checks: TaskCheck[],
  notes: TaskNote[]
) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const checkMap: Record<string, boolean> = {}
  checks.forEach(c => { checkMap[c.task_id] = c.checked })
  const noteMap: Record<string, string> = {}
  notes.forEach(n => { noteMap[n.task_id] = n.note })

  const phases = getVisibleTasks(tenant.license)
  let total = 0, done = 0
  phases.forEach(ph => ph.tasks.forEach(t => { total++; if (checkMap[t.id]) done++ }))
  const pct = total > 0 ? Math.round(done / total * 100) : 0
  const licLabel: Record<string, string> = { e3: 'M365 E3', e5: 'M365 E5', bp: 'Business Premium' }
  const date = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })

  // Header
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, 210, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('M365 DLP Yapilandirma Raporu', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${tenant.name}  |  ${licLabel[tenant.license]}  |  ${date}`, 14, 22)
  doc.text(`Ilerleme: ${done}/${total} gorev (${pct}%)`, 14, 28)

  // Progress bar
  doc.setFillColor(255, 255, 255, 0.3)
  doc.rect(130, 20, 66, 5, 'F')
  doc.setFillColor(255, 255, 255)
  doc.rect(130, 20, Math.max(1, 66 * pct / 100), 5, 'F')

  let y = 40

  // Phase summaries
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('Ozet', 14, y)
  y += 6

  const summaryData = phases.map((ph, i) => {
    const pd = ph.tasks.filter(t => checkMap[t.id]).length
    const pt = ph.tasks.length
    return [`${i + 1}. ${ph.label}`, `${pd}/${pt}`, `${Math.round(pd / pt * 100)}%`, pd === pt ? 'Tamamlandi' : pd > 0 ? 'Devam ediyor' : 'Baslanmadi']
  })

  autoTable(doc, {
    startY: y,
    head: [['Asama', 'Gorevler', 'Yuzde', 'Durum']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' } },
    margin: { left: 14, right: 14 },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // Per-phase task tables
  phases.forEach((ph, i) => {
    const color = PHASE_COLORS[ph.id] || [100, 100, 100]
    if (y > 250) { doc.addPage(); y = 14 }

    doc.setFillColor(color[0], color[1], color[2])
    doc.rect(14, y, 182, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}. ${ph.label}`, 17, y + 4.5)
    y += 9

    const rows = ph.tasks.map(t => {
      const checked = checkMap[t.id] ? '✓' : '○'
      const note = noteMap[t.id] ? `Not: ${noteMap[t.id].slice(0, 60)}${noteMap[t.id].length > 60 ? '...' : ''}` : ''
      return [checked, t.title, note]
    })

    autoTable(doc, {
      startY: y,
      head: [['', 'Gorev', 'Not']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [245, 245, 245], textColor: [80, 80, 80], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 110 },
        2: { cellWidth: 64, textColor: [120, 120, 120] },
      },
      margin: { left: 14, right: 14 },
    })

    y = (doc as any).lastAutoTable.finalY + 8
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(`UnifyTech M365 DLP Rehberi  |  Sayfa ${i}/${pageCount}`, 14, 290)
  }

  doc.save(`DLP-Raporu-${tenant.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
