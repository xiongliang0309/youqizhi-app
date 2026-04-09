import 'dotenv/config'
import fetch, { Headers, Request, Response } from 'cross-fetch'
import { createClient } from '@supabase/supabase-js'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { global: { fetch } })

async function run() {
  const { data, error } = await supabase.from('science_questions').select('count', { count: 'exact' })
  if (error) console.error(error)
  else console.log(data)
}
run()
