export type LicenseType = 'e3' | 'e5' | 'bp'

export interface Tenant {
  id: string
  user_id: string
  name: string
  email: string
  license: LicenseType
  created_at: string
  updated_at: string
}

export interface TaskCheck {
  id: string
  tenant_id: string
  task_id: string
  checked: boolean
  checked_at: string | null
}

export interface TaskNote {
  id: string
  tenant_id: string
  task_id: string
  note: string
  updated_at: string
}

export interface TenantWithProgress extends Tenant {
  done: number
  total: number
  pct: number
}
