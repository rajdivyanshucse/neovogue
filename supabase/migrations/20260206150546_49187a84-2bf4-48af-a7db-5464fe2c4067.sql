-- Make the dress-images bucket private to prevent public access
UPDATE storage.buckets 
SET public = false 
WHERE id = 'dress-images';

-- Drop the public access policy if it exists
DROP POLICY IF EXISTS "Anyone can view dress images" ON storage.objects;

-- Add policy: Authenticated users can view images related to their requests
CREATE POLICY "Request participants can view images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dress-images' AND (
    -- Users can view images in their own folder
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Admins can view all images
    public.has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Designers can view portfolio images (stored in their folder)
    public.has_role(auth.uid(), 'designer'::app_role)
  )
);
