import { useEffect, useState } from 'react';
import { Users, ClipboardList, IndianRupee, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';

interface Stats {
  totalUsers: number;
  totalRequests: number;
  activeRequests: number;
  totalEarnings: number;
  pendingDisputes: number;
  verifiedDesigners: number;
}

interface RecentActivity {
  id: string;
  type: 'request' | 'user' | 'quotation';
  description: string;
  time: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRequests: 0,
    activeRequests: 0,
    totalEarnings: 0,
    pendingDisputes: 0,
    verifiedDesigners: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: requestsCount },
        { count: activeCount },
        { data: earningsData },
        { count: designersCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('redesign_requests').select('*', { count: 'exact', head: true }),
        supabase.from('redesign_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
        supabase.from('designer_earnings').select('amount'),
        supabase.from('designer_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      ]);

      const totalEarnings = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalRequests: requestsCount || 0,
        activeRequests: activeCount || 0,
        totalEarnings,
        pendingDisputes: 0, // Would need a disputes table
        verifiedDesigners: designersCount || 0,
      });

      // Fetch recent requests for activity
      const { data: requests } = await supabase
        .from('redesign_requests')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (requests) {
        setRecentActivity(
          requests.map((r) => ({
            id: r.id,
            type: 'request' as const,
            description: `New request: ${r.title}`,
            time: new Date(r.created_at).toLocaleDateString(),
          }))
        );
      }
    } catch (error) {
      logError('AdminDashboard.fetchStats', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-primary' },
    { icon: ClipboardList, label: 'Total Requests', value: stats.totalRequests, color: 'text-primary' },
    { icon: TrendingUp, label: 'Active Requests', value: stats.activeRequests, color: 'text-success' },
    { icon: IndianRupee, label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, color: 'text-primary' },
    { icon: Users, label: 'Verified Designers', value: stats.verifiedDesigners, color: 'text-primary' },
    { icon: AlertTriangle, label: 'Pending Disputes', value: stats.pendingDisputes, color: 'text-destructive' },
  ];

  return (
    <AdminDashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="card-luxury">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize">
                          {activity.type}
                        </Badge>
                        <span className="text-sm">{activity.description}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
