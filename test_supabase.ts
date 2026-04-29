import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('language_words').select('id').limit(1);
  console.log("Language words:", data, error);
  const { data: d2, error: e2 } = await supabase.from('poems').select('id').limit(1);
  console.log("Poems:", d2, e2);
}
main();
