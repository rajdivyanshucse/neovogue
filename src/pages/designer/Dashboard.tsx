import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardList, DollarSign, TrendingUp, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export default function DesignerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeProjects: 0,
    totalEarnings: 0,
    totalProjects: 0,
    rating: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch pending requests (available for quotation)
      const { data: pendingData } = await supabase
        .from('redesign_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch designer's active projects
      const { data: activeData } = await supabase
        .from('redesign_requests')
        .select('*')
        .eq('designer_id', user?.id)
        .not('status', 'in', '("completed","cancelled")')
        .order('created_at', { ascending: false });

      // Fetch completed projects count
      const { data: completedData } = await supabase
        .from('redesign_requests')
        .select('id')
        .eq('designer_id', user?.id)
        .eq('status', 'completed');

      // Fetch designer profile
      const { data: profileData } = await supabase
        .from('designer_profiles')
        .select('rating, total_projects')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('designer_earnings')
        .select('net_amount')
        .eq('designer_id', user?.id)
        .eq('status', 'paid');

      const totalEarnings = earningsData?.reduce((sum, e) => sum + e.net_amount, 0) || 0;

      setStats({
        pendingRequests: pendingData?.length || 0,
        activeProjects: activeData?.length || 0,
        totalEarnings,
        totalProjects: completedData?.length || profileData?.total_projects || 0,
        rating: profileData?.rating || 0,
      });

      setRecentRequests(pendingData || []);
    } catch (error) {
      logError('DesignerDashboard.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-primary bg-primary/10';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <DesignerDashboardLayout title="Designer Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Requests</p>
              <p className="text-2xl font-serif font-bold">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-serif font-bold">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-serif font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-serif font-bold">{stats.rating.toFixed(1)} ⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link to="/designer/requests">
          <div className="card-luxury rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">Browse Requests</h3>
              <p className="text-muted-foreground">Find new redesign projects to work on</p>
            </div>
          </div>
        </Link>

        <Link to="/designer/portfolio">
          <div className="card-luxury rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <Briefcase className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">Manage Portfolio</h3>
              <p className="text-muted-foreground">Showcase your best transformations</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="card-luxury rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-semibold">New Redesign Requests</h2>
          <Link to="/designer/requests">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No new requests available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <h4 className="font-medium">{request.title}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {request.style_preference} • Budget: ₹{request.budget_min?.toLocaleString()} - ₹{request.budget_max?.toLocaleString()}
                  </p>
                </div>
                <Link to={`/designer/requests/${request.id}`}>
                  <Button size="sm" variant="outline">View Details</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DesignerDashboardLayout>
  );
}
