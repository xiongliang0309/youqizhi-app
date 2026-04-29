import dotenv from 'dotenv';
dotenv.config();
const key = process.env.VITE_SUPABASE_ANON_KEY;
const url = process.env.VITE_SUPABASE_URL;

async function run() {
  let res = await fetch(url + '/rest/v1/songs?select=*&limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  console.log("Songs:", await res.text());
  
  res = await fetch(url + '/rest/v1/poems?select=*&limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  console.log("Poems:", await res.text());
  
  res = await fetch(url + '/rest/v1/language_words?select=*&limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  console.log("Words:", await res.text());
}
run();