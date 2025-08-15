
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.SUPABASE_URL')
}
if (!supabaseKey) {
  throw new Error('Missing env.SUPABASE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
