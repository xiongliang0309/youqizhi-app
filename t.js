const key = process.env.VITE_SUPABASE_ANON_KEY;
const url = process.env.VITE_SUPABASE_URL;
fetch(url + '/rest/v1/songs?select=*&limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } }).then(r => r.text()).then(console.log);
