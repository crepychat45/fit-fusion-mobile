DROP POLICY IF EXISTS "Public read access" ON storage.objects;

CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'fitusion.data'
  AND auth.uid()::text = (storage.foldername(name))[1]
);