import { useEffect, useState } from 'react';
import { Truck, MapPin, Phone, CheckCircle, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeliveryDashboardLayout } from '@/components/dashboard/DeliveryDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActiveDelivery {
  id: string;
  request_id: string;
  assignment_type: string;
  status: string;
  scheduled_date: string | null;
  notes: string | null;
  created_at: string;
  redesign_requests: {
    title: string;
    pickup_address: string | null;
    delivery_address: string | null;
  } | null;
}

export default function ActiveDeliveries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveDeliveries();
    }
  }, [user]);

  const fetchActiveDeliveries = async () => {
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
      .eq('status', 'in_transit')
      .order('scheduled_date', { ascending: true });

    if (!error && data) {
      setDeliveries(data);
    }
    setLoading(false);
  };

  const completeDelivery = async (deliveryId: string) => {
    const { error } = await supabase
      .from('delivery_assignments')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Completed!', description: 'Delivery marked as complete' });
      fetchActiveDeliveries();
    }
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <DeliveryDashboardLayout title="Active Deliveries" subtitle="Track and complete in-transit orders">
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-16 card-luxury rounded-xl">
          <Truck className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">No active deliveries</h3>
          <p className="text-muted-foreground">All caught up! Check assignments for new tasks.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="card-luxury overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{delivery.redesign_requests?.title}</CardTitle>
                      <Badge variant="outline" className="capitalize mt-1">
                        {delivery.assignment_type}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    <Clock className="w-3 h-3 mr-1" />
                    In Transit
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pickup Location */}
                  {delivery.assignment_type === 'pickup' && delivery.redesign_requests?.pickup_address && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Pickup Location
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {delivery.redesign_requests.pickup_address}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMaps(delivery.redesign_requests!.pickup_address!)}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  )}

                  {/* Delivery Location */}
                  {delivery.assignment_type === 'delivery' && delivery.redesign_requests?.delivery_address && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-success" />
                        Delivery Location
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {delivery.redesign_requests.delivery_address}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMaps(delivery.redesign_requests!.delivery_address!)}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  )}

                  {/* Scheduled Date */}
                  {delivery.scheduled_date && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Scheduled
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(delivery.scheduled_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {delivery.notes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Notes:</span> {delivery.notes}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => completeDelivery(delivery.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DeliveryDashboardLayout>
  );
}
