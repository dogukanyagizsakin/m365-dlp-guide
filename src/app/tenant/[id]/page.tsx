import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { TenantClient } from '@/components/checklist/TenantClient'

export default async function TenantPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('dlp_tenants')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!tenant) redirect('/dashboard')

  return <TenantClient tenant={tenant} />
}
