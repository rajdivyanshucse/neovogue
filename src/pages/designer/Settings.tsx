import { useState, useEffect } from 'react';
import { User, Mail, Palette, IndianRupee, Save, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DesignerDashboardLayout } from '@/components/dashboard/DesignerDashboardLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';
import { designerProfileSchema } from '@/lib/validation';

interface DesignerProfile {
  bio: string | null;
  specialties: string[] | null;
  experience_years: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  portfolio_url: string | null;
}

const SPECIALTY_OPTIONS = [
  'Traditional',
  'Contemporary',
  'Bohemian',
  'Minimalist',
  'Vintage',
  'Avant-garde',
  'Bridal',
  'Streetwear',
];

export default function DesignerSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DesignerProfile>({
    bio: '',
    specialties: [],
    experience_years: 0,
    price_range_min: 500,
    price_range_max: 5000,
    portfolio_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('designer_profiles')
        .select('bio, specialties, experience_years, price_range_min, price_range_max, portfolio_url')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfile({
          bio: data.bio || '',
          specialties: data.specialties || [],
          experience_years: data.experience_years || 0,
          price_range_min: data.price_range_min || 500,
          price_range_max: data.price_range_max || 5000,
          portfolio_url: data.portfolio_url || '',
        });
      }
    } catch (error) {
      logError('DesignerSettings.fetchProfile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const validation = designerProfileSchema.safeParse({
      bio: profile.bio,
      experience_years: profile.experience_years || 0,
      price_range_min: profile.price_range_min || 500,
      price_range_max: profile.price_range_max || 5000,
      portfolio_url: profile.portfolio_url,
    });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('designer_profiles')
        .update({
          bio: profile.bio,
          specialties: profile.specialties,
          experience_years: profile.experience_years,
          price_range_min: profile.price_range_min,
          price_range_max: profile.price_range_max,
          portfolio_url: profile.portfolio_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      logError('DesignerSettings.save', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    const current = profile.specialties || [];
    if (current.includes(specialty)) {
      setProfile({
        ...profile,
        specialties: current.filter((s) => s !== specialty),
      });
    } else {
      setProfile({
        ...profile,
        specialties: [...current, specialty],
      });
    }
  };

  return (
    <DesignerDashboardLayout title="Settings" subtitle="Manage your designer profile">
      <div className="max-w-2xl space-y-6">
        {/* Theme Settings */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how NeoVogue looks on your device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle>Designer Profile</CardTitle>
            <CardDescription>Update your professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell customers about your design philosophy..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Specialties
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant={profile.specialties?.includes(specialty) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    value={profile.experience_years || 0}
                    onChange={(e) =>
                      setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_price" className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" />
                      Min Price (₹)
                    </Label>
                    <Input
                      id="min_price"
                      type="number"
                      value={profile.price_range_min || 500}
                      onChange={(e) =>
                        setProfile({ ...profile, price_range_min: parseInt(e.target.value) || 500 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_price">Max Price (₹)</Label>
                    <Input
                      id="max_price"
                      type="number"
                      value={profile.price_range_max || 5000}
                      onChange={(e) =>
                        setProfile({ ...profile, price_range_max: parseInt(e.target.value) || 5000 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">External Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    value={profile.portfolio_url || ''}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DesignerDashboardLayout>
  );
}
