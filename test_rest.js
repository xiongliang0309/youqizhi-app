import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function test() {
  const r1 = await fetch(`${url}/rest/v1/poems?select=*&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  console.log("poems status:", r1.status);
  console.log(await r1.text());

  const r2 = await fetch(`${url}/rest/v1/language_words?select=*&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  console.log("language_words status:", r2.status);
  console.log(await r2.text());
}
test();
