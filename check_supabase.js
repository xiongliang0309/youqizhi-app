import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://okuzkqxjfdihypcvvqen.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdXprcXhqZmRpaHlwY3Z2cWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTYwODcsImV4cCI6MjA4OTM5MjA4N30.nnrptPsIvvJ_ps9f2l6ubPRA58TM9ftRFdhtJOi6TJc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: p } = await supabase.from('poems').select('id').limit(1);
  console.log('poems:', p);
  const { data: s } = await supabase.from('songs').select('id').limit(1);
  console.log('songs:', s);
  const { data: l } = await supabase.from('language_words').select('id').limit(1);
  console.log('language_words:', l);
}
check();