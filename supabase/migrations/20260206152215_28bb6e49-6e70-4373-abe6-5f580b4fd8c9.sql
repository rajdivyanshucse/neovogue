-- Fix 1: Allow admins to update designer_profiles (for verification)
DROP POLICY IF EXISTS "Designers can update their own profile" ON public.designer_profiles;

CREATE POLICY "Designers and admins can update profiles"
ON public.designer_profiles FOR UPDATE
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Replace overly broad storage SELECT policy for designers
DROP POLICY IF EXISTS "Request participants can view images" ON storage.objects;

CREATE POLICY "Participants can view request images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dress-images' AND (
    -- Users can view images in their own folder
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Admins can view all images
    public.has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Designers can only view images for requests they're assigned to
    EXISTS (
      SELECT 1 
      FROM public.redesign_requests r
      WHERE r.designer_id = auth.uid()
        AND (storage.foldername(name))[1] = r.customer_id::text
    )
  )
);