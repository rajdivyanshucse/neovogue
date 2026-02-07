-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('customer', 'designer', 'delivery_partner', 'admin');

-- Create user roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create designer profiles table
CREATE TABLE public.designer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    bio TEXT,
    portfolio_url TEXT,
    specialties TEXT[],
    price_range_min INTEGER DEFAULT 500,
    price_range_max INTEGER DEFAULT 5000,
    experience_years INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    total_projects INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on designer_profiles
ALTER TABLE public.designer_profiles ENABLE ROW LEVEL SECURITY;

-- Create redesign requests table
CREATE TABLE public.redesign_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    designer_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    style_preference TEXT CHECK (style_preference IN ('modern', 'traditional', 'fusion', 'custom')),
    budget_min INTEGER,
    budget_max INTEGER,
    timeline_weeks INTEGER DEFAULT 2,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'in_progress', 'pickup_scheduled', 'picked_up', 'redesigning', 'ready', 'delivery_scheduled', 'delivered', 'completed', 'cancelled')),
    pickup_address TEXT,
    delivery_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on redesign_requests
ALTER TABLE public.redesign_requests ENABLE ROW LEVEL SECURITY;

-- Create dress images table
CREATE TABLE public.dress_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.redesign_requests(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'original' CHECK (image_type IN ('original', 'progress', 'final')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dress_images
ALTER TABLE public.dress_images ENABLE ROW LEVEL SECURITY;

-- Create quotations table
CREATE TABLE public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.redesign_requests(id) ON DELETE CASCADE NOT NULL,
    designer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    estimated_days INTEGER DEFAULT 14,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Create messages table for chat
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.redesign_requests(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for designer_profiles
CREATE POLICY "Designer profiles are viewable by everyone"
ON public.designer_profiles FOR SELECT
USING (true);

CREATE POLICY "Designers can update their own profile"
ON public.designer_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Designers can insert their own profile"
ON public.designer_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for redesign_requests
CREATE POLICY "Customers can view their own requests"
ON public.redesign_requests FOR SELECT
USING (auth.uid() = customer_id OR auth.uid() = designer_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Designers can view pending requests"
ON public.redesign_requests FOR SELECT
USING (status = 'pending' AND public.has_role(auth.uid(), 'designer'));

CREATE POLICY "Customers can create requests"
ON public.redesign_requests FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers and designers can update requests"
ON public.redesign_requests FOR UPDATE
USING (auth.uid() = customer_id OR auth.uid() = designer_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for dress_images
CREATE POLICY "Images viewable by request participants"
ON public.dress_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE r.id = request_id
    AND (r.customer_id = auth.uid() OR r.designer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Customers can upload images"
ON public.dress_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE r.id = request_id
    AND (r.customer_id = auth.uid() OR r.designer_id = auth.uid())
  )
);

-- RLS Policies for quotations
CREATE POLICY "Quotations viewable by participants"
ON public.quotations FOR SELECT
USING (
  designer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE r.id = request_id AND r.customer_id = auth.uid()
  )
);

CREATE POLICY "Designers can create quotations"
ON public.quotations FOR INSERT
WITH CHECK (designer_id = auth.uid() AND public.has_role(auth.uid(), 'designer'));

CREATE POLICY "Quotation status can be updated"
ON public.quotations FOR UPDATE
USING (
  designer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE r.id = request_id AND r.customer_id = auth.uid()
  )
);

-- RLS Policies for messages
CREATE POLICY "Messages viewable by participants"
ON public.messages FOR SELECT
USING (
  sender_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE r.id = request_id
    AND (r.customer_id = auth.uid() OR r.designer_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.redesign_requests r
    WHERE r.id = request_id
    AND (r.customer_id = auth.uid() OR r.designer_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create storage bucket for dress images
INSERT INTO storage.buckets (id, name, public) VALUES ('dress-images', 'dress-images', true);

-- Storage policies
CREATE POLICY "Anyone can view dress images"
ON storage.objects FOR SELECT
USING (bucket_id = 'dress-images');

CREATE POLICY "Authenticated users can upload dress images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dress-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dress-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'dress-images' AND auth.uid()::text = (storage.foldername(name))[1]);