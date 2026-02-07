import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Earning {
  id: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: string | null;
  paid_at: string | null;
  created_at: string;
  redesign_requests: {
    title: string;
  } | null;
}

export default function Earnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pending: 0,
    paid: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user]);

  const fetchEarnings = async () => {
    const { data, error } = await supabase
      .from('designer_earnings')
      .select(`
        *,
        redesign_requests (
          title
        )
      `)
      .eq('designer_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEarnings(data);

      const totalEarned = data.reduce((sum, e) => sum + e.net_amount, 0);
      const pending = data.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.net_amount, 0);
      const paid = data.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.net_amount, 0);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = data
        .filter((e) => new Date(e.created_at) >= startOfMonth)
        .reduce((sum, e) => sum + e.net_amount, 0);

      setStats({ totalEarned, pending, paid, thisMonth });
    }
    setLoading(false);
  };

  return (
    <DesignerDashboardLayout title="Earnings" subtitle="Track your income and payments">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif font-bold">₹{stats.totalEarned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif font-bold">₹{stats.thisMonth.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-xs text-success mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Current month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif font-bold text-yellow-600">₹{stats.pending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Out</CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif font-bold text-success">₹{stats.paid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings List */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="font-serif">Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : earnings.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No earnings yet</p>
              <p className="text-sm text-muted-foreground">Complete projects to start earning</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      earning.status === 'paid' ? 'bg-success/10' : 'bg-yellow-100'
                    }`}>
                      {earning.status === 'paid' ? (
                        <ArrowUpRight className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{earning.redesign_requests?.title || 'Project'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold">₹{earning.net_amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Fee: ₹{earning.platform_fee.toLocaleString()}
                      </span>
                      <Badge
                        variant={earning.status === 'paid' ? 'default' : 'secondary'}
                        className={earning.status === 'paid' ? 'bg-success/10 text-success' : ''}
                      >
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DesignerDashboardLayout>
  );
}
