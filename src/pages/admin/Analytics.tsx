import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, ClipboardList, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';

interface AnalyticsData {
  totalRevenue: number;
  monthlyOrders: number;
  averageOrderValue: number;
  customerGrowth: number;
  designerGrowth: number;
  completionRate: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    monthlyOrders: 0,
    averageOrderValue: 0,
    customerGrowth: 0,
    designerGrowth: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        { data: earnings },
        { count: monthlyOrdersCount },
        { count: completedCount },
        { count: totalOrdersCount },
        { count: newCustomers },
        { count: newDesigners },
      ] = await Promise.all([
        supabase.from('designer_earnings').select('amount'),
        supabase
          .from('redesign_requests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('redesign_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase.from('redesign_requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('designer_profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),
      ]);

      const totalRevenue = earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const completionRate = totalOrdersCount ? ((completedCount || 0) / totalOrdersCount) * 100 : 0;
      const avgOrderValue = monthlyOrdersCount ? totalRevenue / monthlyOrdersCount : 0;

      setAnalytics({
        totalRevenue,
        monthlyOrders: monthlyOrdersCount || 0,
        averageOrderValue: avgOrderValue,
        customerGrowth: newCustomers || 0,
        designerGrowth: newDesigners || 0,
        completionRate: Math.round(completionRate),
      });
    } catch (error) {
      logError('Analytics.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const analyticsCards = [
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      description: 'All-time platform revenue',
    },
    {
      icon: ClipboardList,
      label: 'Monthly Orders',
      value: analytics.monthlyOrders,
      description: 'Orders in the last 30 days',
    },
    {
      icon: TrendingUp,
      label: 'Avg Order Value',
      value: `₹${Math.round(analytics.averageOrderValue).toLocaleString()}`,
      description: 'Average transaction amount',
    },
    {
      icon: Users,
      label: 'New Customers',
      value: `+${analytics.customerGrowth}`,
      description: 'Last 30 days',
    },
    {
      icon: Users,
      label: 'New Designers',
      value: `+${analytics.designerGrowth}`,
      description: 'Last 30 days',
    },
    {
      icon: BarChart3,
      label: 'Completion Rate',
      value: `${analytics.completionRate}%`,
      description: 'Orders completed successfully',
    },
  ];

  return (
    <AdminDashboardLayout title="Analytics" subtitle="Platform performance and insights">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsCards.map((card, index) => (
              <Card key={index} className="card-luxury">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <card.icon className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Overview */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Order Completion Rate</span>
                    <span className="font-semibold">{analytics.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-500"
                      style={{ width: `${analytics.completionRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Platform Growth</span>
                    <span className="font-semibold">
                      {analytics.customerGrowth + analytics.designerGrowth} new users
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
