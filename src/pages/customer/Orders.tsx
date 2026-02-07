import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerDashboardLayout } from '@/components/dashboard/CustomerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface RedesignRequest {
  id: string;
  title: string;
  status: string;
  created_at: string;
  style_preference: string;
  budget_min: number;
  budget_max: number;
}

export default function Orders() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RedesignRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('redesign_requests')
      .select('*')
      .eq('customer_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'pending':
        return 'text-muted-foreground bg-muted';
      case 'cancelled':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <CustomerDashboardLayout title="My Orders" subtitle="Track all your redesign requests">
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="card-luxury rounded-xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Start your sustainable fashion journey today</p>
          <Link to="/dashboard/new-request">
            <Button>Create Your First Request</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="card-luxury rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif font-semibold text-lg">{request.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="capitalize">{request.style_preference} Style</span>
                  <span>₹{request.budget_min} - ₹{request.budget_max}</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link to={`/dashboard/orders/${request.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </CustomerDashboardLayout>
  );
}