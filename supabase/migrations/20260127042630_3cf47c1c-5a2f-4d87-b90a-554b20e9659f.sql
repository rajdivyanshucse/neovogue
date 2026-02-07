-- Add delivery_partner_id to redesign_requests for order assignments
ALTER TABLE public.redesign_requests 
ADD COLUMN IF NOT EXISTS delivery_partner_id uuid;

-- Add delivery tracking columns
ALTER TABLE public.redesign_requests 
ADD COLUMN IF NOT EXISTS pickup_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivery_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS pickup_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_confirmed boolean DEFAULT false;

-- Create delivery_assignments table for tracking pickups and deliveries
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.redesign_requests(id) ON DELETE CASCADE NOT NULL,
  delivery_partner_id uuid NOT NULL,
  assignment_type text NOT NULL CHECK (assignment_type IN ('pickup', 'delivery')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  scheduled_date timestamp with time zone,
  completed_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on delivery_assignments
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Delivery partners can view their own assignments
CREATE POLICY "Delivery partners can view their assignments"
ON public.delivery_assignments FOR SELECT
USING (
  delivery_partner_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Delivery partners can update their own assignments
CREATE POLICY "Delivery partners can update their assignments"
ON public.delivery_assignments FOR UPDATE
USING (delivery_partner_id = auth.uid());

-- Admins and designers can create assignments
CREATE POLICY "Admins can create assignments"
ON public.delivery_assignments FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'designer'::app_role)
);

-- Add pending assignments view for delivery partners
CREATE POLICY "Delivery partners can view pending assignments"
ON public.delivery_assignments FOR SELECT
USING (
  status = 'pending' AND has_role(auth.uid(), 'delivery_partner'::app_role)
);

-- Create earnings table for designers
CREATE TABLE IF NOT EXISTS public.designer_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL,
  request_id uuid REFERENCES public.redesign_requests(id) ON DELETE CASCADE NOT NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  platform_fee integer NOT NULL DEFAULT 0,
  net_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on designer_earnings
ALTER TABLE public.designer_earnings ENABLE ROW LEVEL SECURITY;

-- Designers can view their own earnings
CREATE POLICY "Designers can view their earnings"
ON public.designer_earnings FOR SELECT
USING (designer_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create portfolio_items table for designer portfolios
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  before_image_url text,
  after_image_url text NOT NULL,
  category text,
  tags text[],
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view portfolio items
CREATE POLICY "Portfolio items are viewable by everyone"
ON public.portfolio_items FOR SELECT
USING (true);

-- Designers can manage their own portfolio
CREATE POLICY "Designers can insert their portfolio items"
ON public.portfolio_items FOR INSERT
WITH CHECK (designer_id = auth.uid() AND has_role(auth.uid(), 'designer'::app_role));

CREATE POLICY "Designers can update their portfolio items"
ON public.portfolio_items FOR UPDATE
USING (designer_id = auth.uid());

CREATE POLICY "Designers can delete their portfolio items"
ON public.portfolio_items FOR DELETE
USING (designer_id = auth.uid());