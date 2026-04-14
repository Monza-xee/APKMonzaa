import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://PROJECT_URL.supabase.co',
  'API_KEY_LU'
)
