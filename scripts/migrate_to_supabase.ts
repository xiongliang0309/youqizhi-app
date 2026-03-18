import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch, { Headers, Request, Response } from 'cross-fetch';

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: fetch }
});

async function migratePoems() {
    console.log('Migrating poems...');
    const poemsPath = path.join(__dirname, '../src/data/tang_poems_100.json');
    if (!fs.existsSync(poemsPath)) {
        console.log('tang_poems_100.json not found, skipping.');
        return;
    }

    const poemsData = JSON.parse(fs.readFileSync(poemsPath, 'utf-8'));
    
    // Clear existing data first to avoid duplicates if run multiple times
    await supabase.from('poems').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const formattedPoems = poemsData.map((poem: any) => ({
        title: poem.title,
        author: poem.author,
        content: poem.content,
        image: poem.image || '🎍',
        audio: poem.audio || null
    }));

    // Insert in batches of 50 to avoid payload limits
    for (let i = 0; i < formattedPoems.length; i += 50) {
        const batch = formattedPoems.slice(i, i + 50);
        const { error } = await supabase.from('poems').insert(batch);
        if (error) {
            console.error('Error inserting poems batch:', error);
        } else {
            console.log(`Inserted poems ${i} to ${i + batch.length}`);
        }
    }
    console.log('Poems migration completed.');
}

async function migrateSongs() {
    console.log('Migrating songs...');
    const songsPath = path.join(__dirname, '../src/data/beilehu_songs.json');
    if (!fs.existsSync(songsPath)) {
        console.log('beilehu_songs.json not found, skipping.');
        return;
    }

    const songsData = JSON.parse(fs.readFileSync(songsPath, 'utf-8'));
    
    // Clear existing data
    await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const formattedSongs = songsData.map((song: any) => ({
        title: song.t,
        author: song.a,
        content: song.lines,
        icon: song.icon || '🎵',
        audio: song.audio || null,
        cover: song.cover || null
    }));

    // Insert in batches of 50
    for (let i = 0; i < formattedSongs.length; i += 50) {
        const batch = formattedSongs.slice(i, i + 50);
        const { error } = await supabase.from('songs').insert(batch);
        if (error) {
            console.error('Error inserting songs batch:', error);
        } else {
            console.log(`Inserted songs ${i} to ${i + batch.length}`);
        }
    }
    console.log('Songs migration completed.');
}

async function main() {
    console.log('Starting data migration to Supabase...');
    await migratePoems();
    await migrateSongs();
    console.log('All migrations completed successfully!');
}

main().catch(console.error);
