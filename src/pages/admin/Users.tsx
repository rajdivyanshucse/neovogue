import { useEffect, useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  city: string | null;
  created_at: string;
}

interface DesignerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  is_verified: boolean | null;
  total_projects: number | null;
  rating: number | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [designers, setDesigners] = useState<DesignerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersResult, designersResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('designer_profiles').select('*').order('created_at', { ascending: false }),
      ]);

      setUsers(usersResult.data || []);
      
      // Fetch profile names for designers
      if (designersResult.data) {
        const designersWithProfiles = await Promise.all(
          designersResult.data.map(async (designer) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', designer.user_id)
              .single();
            return { ...designer, profile };
          })
        );
        setDesigners(designersWithProfiles);
      }
    } catch (error) {
      logError('UserManagement.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDesigner = async (userId: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from('designer_profiles')
        .update({ is_verified: verify })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(verify ? 'Designer verified successfully' : 'Verification removed');
      fetchUsers();
    } catch (error) {
      logError('UserManagement.verify', error);
      toast.error('Failed to update verification status');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDesigners = designers.filter(
    (designer) =>
      designer.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designer.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminDashboardLayout title="User Management" subtitle="Manage users and verify designers">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all-users">
          <TabsList>
            <TabsTrigger value="all-users">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="designers">Designers ({designers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all-users" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card className="card-luxury">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="card-luxury">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-xs text-muted-foreground">{user.city || 'Unknown'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="designers" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredDesigners.length === 0 ? (
              <Card className="card-luxury">
                <CardContent className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No designers found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDesigners.map((designer) => (
                  <Card key={designer.id} className="card-luxury">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {designer.profile?.full_name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {designer.profile?.full_name || 'Unnamed Designer'}
                            </p>
                            {designer.is_verified && (
                              <Badge className="bg-success/10 text-success">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {designer.bio || 'No bio provided'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Projects: {designer.total_projects || 0}</span>
                            <span>Rating: {designer.rating || 0}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {designer.is_verified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyDesigner(designer.user_id, false)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Remove Verification
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyDesigner(designer.user_id, true)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}
