import { useEffect, useState } from 'react';
import { Package, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeliveryDashboardLayout } from '@/components/dashboard/DeliveryDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { logError } from '@/lib/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Assignment {
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

export default function Assignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      // Fetch all pending assignments (available to claim)
      const { data: pending } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          redesign_requests (
            title,
            pickup_address,
            delivery_address
          )
        `)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true });

      // Fetch assignments for this delivery partner
      const { data: mine } = await supabase
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
        .not('status', 'eq', 'completed')
        .order('scheduled_date', { ascending: true });

      setPendingAssignments(pending || []);
      setMyAssignments(mine || []);
    } catch (error) {
      logError('Assignments.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from('delivery_assignments')
      .update({
        delivery_partner_id: user?.id,
        status: 'in_transit',
      })
      .eq('id', assignmentId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Assignment Accepted',
        description: 'You have accepted this delivery assignment',
      });
      fetchAssignments();
    }
  };

  const startDelivery = async (assignmentId: string) => {
    const { error } = await supabase
      .from('delivery_assignments')
      .update({ status: 'in_transit' })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Started', description: 'Delivery marked as in transit' });
      fetchAssignments();
    }
  };

  const completeDelivery = async (assignmentId: string) => {
    const { error } = await supabase
      .from('delivery_assignments')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Completed', description: 'Delivery marked as complete' });
      fetchAssignments();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-700">In Transit</Badge>;
      case 'completed':
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AssignmentCard = ({
    assignment,
    showAccept = false,
  }: {
    assignment: Assignment;
    showAccept?: boolean;
  }) => (
    <div className="card-luxury rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif font-semibold text-lg">
            {assignment.redesign_requests?.title}
          </h3>
          <Badge variant="outline" className="capitalize mt-1">
            {assignment.assignment_type}
          </Badge>
        </div>
        {getStatusBadge(assignment.status)}
      </div>

      <div className="space-y-3 mb-4">
        {assignment.assignment_type === 'pickup' && assignment.redesign_requests?.pickup_address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="text-muted-foreground">Pickup from:</p>
              <p>{assignment.redesign_requests.pickup_address}</p>
            </div>
          </div>
        )}

        {assignment.assignment_type === 'delivery' && assignment.redesign_requests?.delivery_address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-success shrink-0" />
            <div>
              <p className="text-muted-foreground">Deliver to:</p>
              <p>{assignment.redesign_requests.delivery_address}</p>
            </div>
          </div>
        )}

        {assignment.scheduled_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(assignment.scheduled_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {assignment.notes && (
        <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
          <p className="text-muted-foreground">Notes: {assignment.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        {showAccept && (
          <Button onClick={() => acceptAssignment(assignment.id)} className="flex-1">
            Accept Assignment
          </Button>
        )}
        {assignment.status === 'pending' && !showAccept && (
          <Button onClick={() => startDelivery(assignment.id)} className="flex-1">
            Start Delivery
          </Button>
        )}
        {assignment.status === 'in_transit' && (
          <Button onClick={() => completeDelivery(assignment.id)} className="flex-1 bg-success hover:bg-success/90">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <DeliveryDashboardLayout title="Assignments" subtitle="Manage pickup and delivery tasks">
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="available">
            Available ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="my-assignments">
            My Assignments ({myAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : pendingAssignments.length === 0 ? (
            <div className="text-center py-16 card-luxury rounded-xl">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No assignments available</h3>
              <p className="text-muted-foreground">Check back later for new pickup and delivery tasks</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} showAccept />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-assignments">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : myAssignments.length === 0 ? (
            <div className="text-center py-16 card-luxury rounded-xl">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No active assignments</h3>
              <p className="text-muted-foreground">Accept available assignments to get started</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DeliveryDashboardLayout>
  );
}
