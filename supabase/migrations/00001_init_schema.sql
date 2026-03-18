-- Create poems table
CREATE TABLE IF NOT EXISTS public.poems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT[] NOT NULL,
    image TEXT,
    audio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    content TEXT[] NOT NULL,
    icon TEXT,
    audio TEXT,
    cover TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on poems" 
    ON public.poems FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access on songs" 
    ON public.songs FOR SELECT 
    USING (true);

-- Create policies to allow authenticated users (like our seed script) to insert data
-- For simplicity in development, we'll allow insert for now, but in production this should be restricted
CREATE POLICY "Allow insert for all" 
    ON public.poems FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow insert for all" 
    ON public.songs FOR INSERT 
    WITH CHECK (true);

-- Create indexes for common searches
CREATE INDEX IF NOT EXISTS idx_poems_title ON public.poems USING btree (title);
CREATE INDEX IF NOT EXISTS idx_poems_author ON public.poems USING btree (author);
CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs USING btree (title);
CREATE INDEX IF NOT EXISTS idx_songs_author ON public.songs USING btree (author);
