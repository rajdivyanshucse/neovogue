-- Fix: Restrict profiles SELECT policy to prevent public data exposure of PII
-- Drop the overly permissive "viewable by everyone" policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Request participants can see each other's profiles (customer ↔ designer)
CREATE POLICY "Request participants can view each others profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE (r.customer_id = auth.uid() OR r.designer_id = auth.uid())
    AND (r.customer_id = profiles.user_id OR r.designer_id = profiles.user_id)
  )
);

-- 3. Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Authenticated users can view profiles of designers (for public designer listing/discovery)
CREATE POLICY "Authenticated users can view designer profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.designer_profiles dp
    WHERE dp.user_id = profiles.user_id
  )
  AND auth.role() = 'authenticated'
);
