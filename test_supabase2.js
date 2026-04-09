import 'dotenv/config'
import fetch, { Headers, Request, Response } from 'cross-fetch'
import { createClient } from '@supabase/supabase-js'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
supabase.from('jobs').select('*').limit(1).then(console.log).catch(console.error)
