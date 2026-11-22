import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null

/**
 * Isolated client for the email-confirmation callback.
 * It may read the session from the confirmation URL, but never persists it
 * into the browser that opened the email link.
 */
export const confirmationSupabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: true,
      },
    })
  : null
