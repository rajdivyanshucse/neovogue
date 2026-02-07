import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Clock, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryDashboardLayout } from '@/components/dashboard/DeliveryDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingAssignments: 0,
    activeDeliveries: 0,
    completedToday: 0,
    totalCompleted: 0,
  });
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch pending assignments
      const { data: pendingData } = await supabase
        .from('delivery_assignments')
        .select('*')
        .eq('delivery_partner_id', user?.id)
        .eq('status', 'pending');

      // Fetch active deliveries (in transit)
      const { data: activeData } = await supabase
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
        .eq('status', 'in_transit');

      // Fetch completed deliveries
      const { data: completedData } = await supabase
        .from('delivery_assignments')
        .select('completed_date')
        .eq('delivery_partner_id', user?.id)
        .eq('status', 'completed');

      const today = new Date().toDateString();
      const completedToday = completedData?.filter(
        (d) => d.completed_date && new Date(d.completed_date).toDateString() === today
      ).length || 0;

      setStats({
        pendingAssignments: pendingData?.length || 0,
        activeDeliveries: activeData?.length || 0,
        completedToday,
        totalCompleted: completedData?.length || 0,
      });

      setActiveAssignments(activeData || []);
    } catch (error) {
      logError('DeliveryDashboard.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeliveryDashboardLayout title="Delivery Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-serif font-bold">{stats.pendingAssignments}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-serif font-bold">{stats.activeDeliveries}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-serif font-bold">{stats.completedToday}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-serif font-bold">{stats.totalCompleted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link to="/delivery/assignments">
          <div className="card-luxury rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">View Assignments</h3>
              <p className="text-muted-foreground">Check new pickup and delivery tasks</p>
            </div>
          </div>
        </Link>

        <Link to="/delivery/active">
          <div className="card-luxury rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <Truck className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold mb-1">Active Deliveries</h3>
              <p className="text-muted-foreground">Track and update in-transit orders</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Active Assignments */}
      <div className="card-luxury rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-semibold">Active Deliveries</h2>
          <Link to="/delivery/active">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : activeAssignments.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No active deliveries</p>
            <Link to="/delivery/assignments">
              <Button>Check Assignments</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{assignment.redesign_requests?.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="capitalize">{assignment.assignment_type}</span>
                      {assignment.scheduled_date && (
                        <>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(assignment.scheduled_date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Link to={`/delivery/active/${assignment.id}`}>
                  <Button size="sm">Update Status</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryDashboardLayout>
  );
}
