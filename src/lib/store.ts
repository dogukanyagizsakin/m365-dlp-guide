'use client'
import { useState, useEffect, useCallback } from 'react'
import type { LicenseType } from '@/data/phases'

export interface TenantSession {
  tenant: string
  email: string
  license: LicenseType
  checks: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'dlp_guide_tenants'

function loadAll(): Record<string, TenantSession> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, TenantSession>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function useStore() {
  const [sessions, setSessions] = useState<Record<string, TenantSession>>({})
  const [current, setCurrent] = useState<TenantSession | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSessions(loadAll())
    setLoaded(true)
  }, [])

  const createSession = useCallback((tenant: string, email: string, license: LicenseType) => {
    const existing = loadAll()[tenant]
    if (existing) {
      setCurrent(existing)
      return existing
    }
    const s: TenantSession = {
      tenant, email, license, checks: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const all = loadAll()
    all[tenant] = s
    saveAll(all)
    setSessions({ ...all })
    setCurrent(s)
    return s
  }, [])

  const loadSession = useCallback((tenant: string) => {
    const all = loadAll()
    const s = all[tenant]
    if (s) setCurrent(s)
    return s || null
  }, [])

  const toggleCheck = useCallback((taskId: string) => {
    if (!current) return
    const updated: TenantSession = {
      ...current,
      checks: { ...current.checks, [taskId]: !current.checks[taskId] },
      updatedAt: new Date().toISOString(),
    }
    const all = loadAll()
    all[current.tenant] = updated
    saveAll(all)
    setSessions({ ...all })
    setCurrent(updated)
  }, [current])

  const resetSession = useCallback(() => {
    if (!current) return
    const updated: TenantSession = { ...current, checks: {}, updatedAt: new Date().toISOString() }
    const all = loadAll()
    all[current.tenant] = updated
    saveAll(all)
    setSessions({ ...all })
    setCurrent(updated)
  }, [current])

  const deleteSession = useCallback((tenant: string) => {
    const all = loadAll()
    delete all[tenant]
    saveAll(all)
    setSessions({ ...all })
    if (current?.tenant === tenant) setCurrent(null)
  }, [current])

  return { sessions, current, loaded, createSession, loadSession, toggleCheck, resetSession, deleteSession, setCurrent }
}
