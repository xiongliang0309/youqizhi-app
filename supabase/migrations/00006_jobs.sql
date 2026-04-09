-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Allow public read access on jobs'
    ) THEN
        CREATE POLICY "Allow public read access on jobs"
            ON public.jobs
            FOR SELECT
            USING (true);
    END IF;
END
$$;

-- Create storage bucket for jobs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('jobs', 'jobs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for jobs bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access to jobs bucket'
    ) THEN
        CREATE POLICY "Public Access to jobs bucket"
            ON storage.objects FOR SELECT
            USING ( bucket_id = 'jobs' );
    END IF;
END
$$;
