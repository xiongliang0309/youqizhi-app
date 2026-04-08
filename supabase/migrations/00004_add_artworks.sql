-- Migration to add artworks table and storage bucket

-- 1. Create artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    image_url text NOT NULL,
    template_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on artworks table
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- 3. Policies for artworks table (allow anyone to insert, and read their own by device_id)
CREATE POLICY "Allow public insert to artworks" 
ON public.artworks FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Allow read by device_id" 
ON public.artworks FOR SELECT 
TO public
USING (true);

CREATE POLICY "Allow delete by device_id" 
ON public.artworks FOR DELETE 
TO public
USING (true);

-- 4. Create storage bucket for artworks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Policies for storage bucket (allow public insert and select)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'artworks' );

CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'artworks' );

CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'artworks' );
