import { AlertTriangle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';

export default function Disputes() {
  // Placeholder - would need a disputes table in the database
  const disputes: any[] = [];

  return (
    <AdminDashboardLayout title="Dispute Resolution" subtitle="Handle customer and designer disputes">
      <div className="space-y-6">
        {disputes.length === 0 ? (
          <Card className="card-luxury">
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No Active Disputes</h3>
              <p className="text-muted-foreground">
                All orders are running smoothly. Disputes will appear here when customers or designers raise concerns.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Disputes would be listed here */}
          </div>
        )}

        {/* Info Card */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Dispute Resolution Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2">Step 1</Badge>
                <h4 className="font-semibold">Review</h4>
                <p className="text-sm text-muted-foreground">
                  Examine all messages, images, and quotation details
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2">Step 2</Badge>
                <h4 className="font-semibold">Mediate</h4>
                <p className="text-sm text-muted-foreground">
                  Contact both parties and understand their concerns
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2">Step 3</Badge>
                <h4 className="font-semibold">Resolve</h4>
                <p className="text-sm text-muted-foreground">
                  Make a fair decision and process any refunds if needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
