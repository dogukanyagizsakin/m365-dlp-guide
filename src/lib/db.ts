import { createClient } from './supabase'
import type { LicenseType } from '@/data/phases'
import type { Tenant, TaskCheck, TaskNote } from '@/types'

export async function getTenants(userId: string): Promise<Tenant[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('dlp_tenants')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return data || []
}

export async function createTenant(userId: string, name: string, email: string, license: LicenseType): Promise<Tenant | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('dlp_tenants')
    .insert({ user_id: userId, name, email, license })
    .select()
    .single()
  return data
}

export async function updateTenant(id: string, fields: Partial<Tenant>) {
  const supabase = createClient()
  await supabase.from('dlp_tenants').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteTenant(id: string) {
  const supabase = createClient()
  await supabase.from('dlp_tenants').delete().eq('id', id)
}

export async function getChecks(tenantId: string): Promise<TaskCheck[]> {
  const supabase = createClient()
  const { data } = await supabase.from('dlp_task_checks').select('*').eq('tenant_id', tenantId)
  return data || []
}

export async function toggleCheck(tenantId: string, taskId: string, checked: boolean) {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('dlp_task_checks')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('task_id', taskId)
    .single()

  if (existing) {
    await supabase.from('dlp_task_checks').update({
      checked,
      checked_at: checked ? new Date().toISOString() : null
    }).eq('id', existing.id)
  } else {
    await supabase.from('dlp_task_checks').insert({
      tenant_id: tenantId,
      task_id: taskId,
      checked,
      checked_at: checked ? new Date().toISOString() : null
    })
  }
  await supabase.from('dlp_tenants').update({ updated_at: new Date().toISOString() }).eq('id', tenantId)
}

export async function getNotes(tenantId: string): Promise<TaskNote[]> {
  const supabase = createClient()
  const { data } = await supabase.from('dlp_task_notes').select('*').eq('tenant_id', tenantId)
  return data || []
}

export async function upsertNote(tenantId: string, taskId: string, note: string) {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('dlp_task_notes')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('task_id', taskId)
    .single()

  if (existing) {
    if (note.trim()) {
      await supabase.from('dlp_task_notes').update({ note, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('dlp_task_notes').delete().eq('id', existing.id)
    }
  } else if (note.trim()) {
    await supabase.from('dlp_task_notes').insert({ tenant_id: tenantId, task_id: taskId, note })
  }
}
