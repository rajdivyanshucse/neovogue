import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerDashboardLayout } from '@/components/dashboard/CustomerDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

interface RequestWithMessages {
  id: string;
  title: string;
  status: string | null;
  designer_id: string | null;
  last_message?: string;
  last_message_time?: string;
}

export default function CustomerMessages() {
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
      // Fetch requests that have a designer assigned (active conversations)
      const { data: requestsData } = await supabase
        .from('redesign_requests')
        .select('id, title, status, designer_id')
        .eq('customer_id', user?.id)
        .not('designer_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (requestsData) {
        // For each request, get the latest message
        const requestsWithMessages = await Promise.all(
          requestsData.map(async (request) => {
            const { data: messages } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('request_id', request.id)
              .order('created_at', { ascending: false })
              .limit(1);

            return {
              ...request,
              last_message: messages?.[0]?.content,
              last_message_time: messages?.[0]?.created_at,
            };
          })
        );

        setRequests(requestsWithMessages);
      }
    } catch (error) {
      logError('CustomerMessages.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerDashboardLayout title="Messages" subtitle="Chat with your designers">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : requests.length === 0 ? (
        <Card className="card-luxury">
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">No active conversations</h3>
            <p className="text-muted-foreground mb-4">
              Once a designer accepts your request, you can chat with them here.
            </p>
            <Link to="/dashboard/new-request">
              <Badge className="cursor-pointer">Create New Request</Badge>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Link key={request.id} to={`/dashboard/orders/${request.id}`}>
              <Card className="card-luxury hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{request.title}</h4>
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
    </CustomerDashboardLayout>
  );
}
