import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Quotation {
  id: string;
  amount: number;
  description: string | null;
  estimated_days: number | null;
  status: string | null;
  created_at: string;
  request_id: string;
  redesign_requests: {
    title: string;
    style_preference: string | null;
  } | null;
}

export default function Quotations() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user]);

  const fetchQuotations = async () => {
    const { data, error } = await supabase
      .from('quotations')
      .select(`
        *,
        redesign_requests (
          title,
          style_preference
        )
      `)
      .eq('designer_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuotations(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-success/10 text-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: quotations.length,
    pending: quotations.filter((q) => q.status === 'pending').length,
    accepted: quotations.filter((q) => q.status === 'accepted').length,
    rejected: quotations.filter((q) => q.status === 'rejected').length,
  };

  return (
    <DesignerDashboardLayout title="My Quotations" subtitle="Track your quotation submissions">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-luxury rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Sent</p>
          <p className="text-2xl font-serif font-bold">{stats.total}</p>
        </div>
        <div className="card-luxury rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-serif font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="card-luxury rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Accepted</p>
          <p className="text-2xl font-serif font-bold text-success">{stats.accepted}</p>
        </div>
        <div className="card-luxury rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-serif font-bold text-destructive">{stats.rejected}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-16 card-luxury rounded-xl">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">No quotations yet</h3>
          <p className="text-muted-foreground">Start by browsing available requests and sending quotes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <div key={quotation.id} className="card-luxury rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif font-semibold text-lg">
                    {quotation.redesign_requests?.title || 'Unknown Request'}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {quotation.redesign_requests?.style_preference}
                  </p>
                </div>
                {getStatusBadge(quotation.status)}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quote Amount</p>
                    <p className="font-semibold">₹{quotation.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-semibold">{quotation.estimated_days} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-semibold">{new Date(quotation.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {quotation.description && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Your Proposal</p>
                  <p className="text-sm">{quotation.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DesignerDashboardLayout>
  );
}
