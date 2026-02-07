import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

interface RequestWithMessages {
  id: string;
  title: string;
  status: string | null;
  customer_id: string;
  last_message?: string;
  last_message_time?: string;
  customer_name?: string;
}

export default function DesignerMessages() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestWithMessages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequestsWithMessages();
    }
  }, [user]);

  const fetchRequestsWithMessages = async () => {
    try {
      // Fetch requests assigned to this designer
      const { data: requestsData } = await supabase
        .from('redesign_requests')
        .select('id, title, status, customer_id')
        .eq('designer_id', user?.id)
        .order('updated_at', { ascending: false });

      if (requestsData) {
        // For each request, get the latest message and customer name
        const requestsWithMessages = await Promise.all(
          requestsData.map(async (request) => {
            const [messagesResult, profileResult] = await Promise.all([
              supabase
                .from('messages')
                .select('content, created_at')
                .eq('request_id', request.id)
                .order('created_at', { ascending: false })
                .limit(1),
              supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', request.customer_id)
                .single(),
            ]);

            return {
              ...request,
              last_message: messagesResult.data?.[0]?.content,
              last_message_time: messagesResult.data?.[0]?.created_at,
              customer_name: profileResult.data?.full_name || 'Customer',
            };
          })
        );

        setRequests(requestsWithMessages);
      }
    } catch (error) {
      logError('DesignerMessages.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DesignerDashboardLayout title="Messages" subtitle="Chat with your clients">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : requests.length === 0 ? (
        <Card className="card-luxury">
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">No active conversations</h3>
            <p className="text-muted-foreground">
              Once you're assigned to a project, you can chat with customers here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Link key={request.id} to={`/designer/requests/${request.id}`}>
              <Card className="card-luxury hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{request.title}</h4>
                      <p className="text-xs text-muted-foreground mb-1">
                        Client: {request.customer_name}
                      </p>
                      {request.last_message ? (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {request.last_message}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {request.last_message_time && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.last_message_time).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant="secondary" className="capitalize">
                      {request.status}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DesignerDashboardLayout>
  );
}
