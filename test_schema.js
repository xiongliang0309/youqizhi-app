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
supabase.from('science_questions').select('*').limit(1).then(res => {
  if (res.data && res.data.length > 0) {
    console.log(Object.keys(res.data[0]))
  }
})
