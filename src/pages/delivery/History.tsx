import { useEffect, useState } from 'react';
import { CheckCircle, Calendar, MapPin, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeliveryDashboardLayout } from '@/components/dashboard/DeliveryDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoryItem {
  id: string;
  assignment_type: string;
  status: string;
  scheduled_date: string | null;
  completed_date: string | null;
  created_at: string;
  redesign_requests: {
    title: string;
    pickup_address: string | null;
    delivery_address: string | null;
  } | null;
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        redesign_requests (
          title,
          pickup_address,
          delivery_address
        )
      `)
      .eq('delivery_partner_id', user?.id)
      .eq('status', 'completed')
      .order('completed_date', { ascending: false });

    if (!error && data) {
      setHistory(data);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const thisMonth = data.filter(
        (d) => d.completed_date && new Date(d.completed_date) >= startOfMonth
      ).length;

      const thisWeek = data.filter(
        (d) => d.completed_date && new Date(d.completed_date) >= startOfWeek
      ).length;

      setStats({
        total: data.length,
        thisMonth,
        thisWeek,
      });
    }
    setLoading(false);
  };

  return (
    <DeliveryDashboardLayout title="Delivery History" subtitle="View your completed deliveries">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="card-luxury">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-success">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-serif font-bold">{stats.thisMonth}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-serif font-bold">{stats.thisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 card-luxury rounded-xl">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">No delivery history</h3>
          <p className="text-muted-foreground">Complete deliveries to build your history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.redesign_requests?.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline" className="capitalize">
                          {item.assignment_type}
                        </Badge>
                        {item.assignment_type === 'pickup' && item.redesign_requests?.pickup_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.redesign_requests.pickup_address.substring(0, 30)}...
                          </span>
                        )}
                        {item.assignment_type === 'delivery' && item.redesign_requests?.delivery_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.redesign_requests.delivery_address.substring(0, 30)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-success/10 text-success">Completed</Badge>
                    {item.completed_date && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.completed_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DeliveryDashboardLayout>
  );
}
