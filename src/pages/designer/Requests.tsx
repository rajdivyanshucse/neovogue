import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, IndianRupee, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RedesignRequest {
  id: string;
  title: string;
  description: string | null;
  style_preference: string | null;
  budget_min: number | null;
  budget_max: number | null;
  timeline_weeks: number | null;
  status: string | null;
  created_at: string;
  customer_id: string;
}

export default function Requests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<RedesignRequest[]>([]);
  const [myProjects, setMyProjects] = useState<RedesignRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      // Fetch all pending requests (available for designers)
      const { data: pending } = await supabase
        .from('redesign_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch designer's own projects
      const { data: projects } = await supabase
        .from('redesign_requests')
        .select('*')
        .eq('designer_id', user?.id)
        .order('created_at', { ascending: false });

      setPendingRequests(pending || []);
      setMyProjects(projects || []);
    } catch (error) {
      logError('DesignerRequests.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'quoted':
        return <Badge className="bg-blue-100 text-blue-700">Quoted</Badge>;
      case 'accepted':
        return <Badge className="bg-primary/10 text-primary">Accepted</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-100 text-purple-700">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RequestCard = ({ request, showActions = true }: { request: RedesignRequest; showActions?: boolean }) => (
    <div className="card-luxury rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif font-semibold text-lg">{request.title}</h3>
          <p className="text-sm text-muted-foreground capitalize">{request.style_preference}</p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      {request.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{request.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <IndianRupee className="w-4 h-4" />
          <span>₹{request.budget_min?.toLocaleString()} - ₹{request.budget_max?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{request.timeline_weeks} weeks</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(request.created_at).toLocaleDateString()}
        </span>
        {showActions && (
          <Link to={`/designer/requests/${request.id}`}>
            <Button size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View & Quote
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <DesignerDashboardLayout title="Redesign Requests" subtitle="Browse and manage redesign projects">
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="available">
            Available Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="my-projects">
            My Projects ({myProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-16 card-luxury rounded-xl">
              <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground">Check back later for new redesign opportunities</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-projects">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : myProjects.length === 0 ? (
            <div className="text-center py-16 card-luxury rounded-xl">
              <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground">Start by quoting on available requests</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((request) => (
                <RequestCard key={request.id} request={request} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DesignerDashboardLayout>
  );
}
