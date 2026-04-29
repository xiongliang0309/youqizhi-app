import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('language_words').select('*').limit(2);
  console.log("language_words error:", error);
  console.log("language_words data:", data);

  const { data: data2, error: error2 } = await supabase.from('poems').select('*').limit(2);
  console.log("poems error:", error2);
  console.log("poems data:", data2);
}
main().catch(console.error);
