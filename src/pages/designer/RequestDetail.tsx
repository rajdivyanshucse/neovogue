import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, IndianRupee, User, Clock, Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { logError } from '@/lib/logger';
import { quotationSchema } from '@/lib/validation';

interface RedesignRequest {
  id: string;
  title: string;
  description: string | null;
  style_preference: string | null;
  budget_min: number | null;
  budget_max: number | null;
  timeline_weeks: number | null;
  status: string | null;
  created_at: string;
  customer_id: string;
  designer_id: string | null;
}

interface DressImage {
  id: string;
  image_url: string;
  image_type: string | null;
}

interface Profile {
  full_name: string | null;
  city: string | null;
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<RedesignRequest | null>(null);
  const [images, setImages] = useState<DressImage[]>([]);
  const [customerProfile, setCustomerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingQuotation, setExistingQuotation] = useState<any>(null);
  
  // Quotation form state
  const [amount, setAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('14');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      // Fetch request
      const { data: requestData, error: requestError } = await supabase
        .from('redesign_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData);

      // Fetch images
      const { data: imagesData } = await supabase
        .from('dress_images')
        .select('*')
        .eq('request_id', id);

      setImages(imagesData || []);

      // Fetch customer profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, city')
        .eq('user_id', requestData.customer_id)
        .single();

      setCustomerProfile(profileData);

      // Check for existing quotation from this designer
      if (user) {
        const { data: quotationData } = await supabase
          .from('quotations')
          .select('*')
          .eq('request_id', id)
          .eq('designer_id', user.id)
          .single();

        setExistingQuotation(quotationData);
      }
    } catch (error) {
      logError('RequestDetail.fetch', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuotation = async () => {
    if (!user || !request) return;

    const validation = quotationSchema.safeParse({
      amount: parseInt(amount) || 0,
      estimatedDays: parseInt(estimatedDays) || 0,
      description: description,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('quotations').insert({
        request_id: request.id,
        designer_id: user.id,
        amount: validation.data.amount,
        estimated_days: validation.data.estimatedDays,
        description: validation.data.description || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Quotation submitted successfully!');
      fetchRequestDetails();
    } catch (error) {
      logError('RequestDetail.submitQuotation', error);
      toast.error('Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'quoted':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Quoted</Badge>;
      case 'accepted':
        return <Badge className="bg-primary/10 text-primary">Accepted</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DesignerDashboardLayout title="Request Details">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DesignerDashboardLayout>
    );
  }

  if (!request) {
    return (
      <DesignerDashboardLayout title="Request Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">The request you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/designer/requests')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Button>
        </div>
      </DesignerDashboardLayout>
    );
  }

  const isAssigned = request.designer_id === user?.id;

  return (
    <DesignerDashboardLayout title="Request Details" subtitle={request.title}>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/designer/requests')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Requests
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info Card */}
          <Card className="card-luxury">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif">{request.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {request.style_preference} Style
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {request.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{request.description}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">
                      ₹{request.budget_min?.toLocaleString()} - ₹{request.budget_max?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="font-semibold">{request.timeline_weeks} weeks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-semibold">{customerProfile?.full_name || 'Anonymous'}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                Submitted on {new Date(request.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Dress Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No images uploaded for this request
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.image_type || 'Dress image'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {image.image_type && (
                        <Badge className="absolute bottom-2 left-2 text-xs">
                          {image.image_type}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Panel - only show if designer is assigned */}
          {isAssigned && request && (
            <ChatPanel
              requestId={request.id}
              customerId={request.customer_id}
              designerId={request.designer_id!}
            />
          )}
        </div>

        {/* Sidebar - Quotation Form */}
        <div className="space-y-6">
          <Card className="card-luxury sticky top-24">
            <CardHeader>
              <CardTitle>Submit Quotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingQuotation ? (
                <div className="text-center py-4">
                  <Badge className="mb-4">Quotation Submitted</Badge>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Amount:</span>{' '}
                      <span className="font-semibold">₹{existingQuotation.amount.toLocaleString()}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Duration:</span>{' '}
                      <span className="font-semibold">{existingQuotation.estimated_days} days</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant="outline" className="capitalize">
                        {existingQuotation.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Quotation Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter your price"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Customer budget: ₹{request.budget_min?.toLocaleString()} - ₹{request.budget_max?.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="days">Estimated Days</Label>
                    <Input
                      id="days"
                      type="number"
                      placeholder="14"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your approach to this redesign..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmitQuotation}
                    disabled={submitting || !amount}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Quotation'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DesignerDashboardLayout>
  );
}
