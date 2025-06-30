-- Sett opp RLS policies for pdf-bank storage bucket

-- Policy 1: Authenticated users can read pdf-bank bucket
CREATE POLICY "Authenticated users can read pdf-bank"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pdf-bank');

-- Policy 2: Authenticated users can upload to pdf-bank bucket
CREATE POLICY "Authenticated users can upload to pdf-bank"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf-bank');

-- Policy 3: Authenticated users can update pdf-bank bucket
CREATE POLICY "Authenticated users can update pdf-bank"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pdf-bank')
WITH CHECK (bucket_id = 'pdf-bank');

-- Policy 4: Authenticated users can delete from pdf-bank bucket
CREATE POLICY "Authenticated users can delete from pdf-bank"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pdf-bank'); 