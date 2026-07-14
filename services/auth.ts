import { supabase } from '@/lib/supabase'

export async function createProfileIfNotExists(user: { id: string; email?: string; user_metadata?: { full_name?: string } }) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!data) {
    await supabase.from('profiles').insert([
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        plan: 'none',
        status: 'inactive',
      },
    ])
  }
}