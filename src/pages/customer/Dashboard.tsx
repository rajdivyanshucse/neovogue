import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';
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
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RedesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
  });

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
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRequests(data);
      
      // Calculate stats
      const total = data.length;
      const inProgress = data.filter((r) => 
        !['completed', 'cancelled', 'pending'].includes(r.status)
      ).length;
      const completed = data.filter((r) => r.status === 'completed').length;
      
      setStats({ total, inProgress, completed });
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

  return (
    <CustomerDashboardLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-serif font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-serif font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-serif font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link to="/dashboard/new-request">
          <div className="card-luxury rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">Start New Redesign</h3>
              <p className="text-muted-foreground">Upload your dress and find a designer</p>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/impact">
          <div className="card-luxury rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">Your Impact</h3>
              <p className="text-muted-foreground">See how you're helping the planet</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card-luxury rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-semibold">Recent Orders</h2>
          <Link to="/dashboard/orders">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No redesign requests yet</p>
            <Link to="/dashboard/new-request">
              <Button>Start Your First Request</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <h4 className="font-medium">{request.title}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {request.style_preference} • {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}