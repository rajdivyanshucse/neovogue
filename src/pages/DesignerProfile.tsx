import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, ArrowLeft, CheckCircle2, Palette, Scissors, Heart } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

interface DesignerData {
  id: string;
  user_id: string;
  bio: string | null;
  specialties: string[] | null;
  rating: number | null;
  experience_years: number | null;
  total_projects: number | null;
  is_verified: boolean | null;
  price_range_min: number | null;
  price_range_max: number | null;
}

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  before_image_url: string | null;
  after_image_url: string;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
}

export default function DesignerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [designer, setDesigner] = useState<DesignerData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (id) {
      fetchDesignerData();
    }
  }, [id]);

  const fetchDesignerData = async () => {
    try {
      const [designerResult, profileResult, portfolioResult] = await Promise.all([
        supabase
          .from('designer_profiles')
          .select('*')
          .eq('user_id', id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name, avatar_url, city')
          .eq('user_id', id)
          .single(),
        supabase
          .from('portfolio_items')
          .select('*')
          .eq('designer_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (designerResult.data) setDesigner(designerResult.data);
      if (profileResult.data) setProfile(profileResult.data);
      if (portfolioResult.data) setPortfolio(portfolioResult.data);
    } catch (error) {
      logError('DesignerProfile.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-4xl animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="flex gap-8">
              <div className="w-32 h-32 rounded-full bg-muted" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4 text-center">
          <h1 className="text-2xl font-serif mb-4">Designer Not Found</h1>
          <Link to="/designers">
            <Button>Browse All Designers</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const featuredItems = portfolio.filter((item) => item.is_featured);
  const categories = [...new Set(portfolio.map((item) => item.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back Link */}
          <Link
            to="/designers"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Designers
          </Link>

          {/* Designer Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxury rounded-2xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile?.full_name || 'Designer'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-primary">
                      {profile?.full_name?.[0] || 'D'}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-serif font-bold">
                        {profile?.full_name || 'Designer'}
                      </h1>
                      {designer.is_verified && (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      )}
                    </div>
                    {profile?.city && (
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {profile.city}
                      </div>
                    )}
                  </div>

                  {user && (
                    <Link to="/dashboard/new-request">
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Request Redesign
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-semibold text-lg">{designer.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-muted-foreground">Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg">{designer.experience_years || 0}+</span>
                    <span className="text-muted-foreground">Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg">{designer.total_projects || 0}</span>
                    <span className="text-muted-foreground">Projects Completed</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground mt-6">
                  {designer.bio || 'Passionate fashion redesign specialist dedicated to sustainable fashion and bringing new life to cherished garments.'}
                </p>

                {/* Specialties */}
                {designer.specialties && designer.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {designer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price Range</span>
                    <span className="font-semibold text-lg">
                      ₹{designer.price_range_min || 500} - ₹{designer.price_range_max || 5000}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-serif font-bold mb-6">Portfolio</h2>

            {portfolio.length === 0 ? (
              <div className="card-luxury rounded-xl p-12 text-center">
                <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No portfolio items yet.</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Work</TabsTrigger>
                  {featuredItems.length > 0 && (
                    <TabsTrigger value="featured">Featured</TabsTrigger>
                  )}
                  {categories.map((cat) => (
                    <TabsTrigger key={cat} value={cat || ''}>
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <PortfolioGrid items={portfolio} onSelect={setSelectedItem} />
                </TabsContent>

                {featuredItems.length > 0 && (
                  <TabsContent value="featured">
                    <PortfolioGrid items={featuredItems} onSelect={setSelectedItem} />
                  </TabsContent>
                )}

                {categories.map((cat) => (
                  <TabsContent key={cat} value={cat || ''}>
                    <PortfolioGrid
                      items={portfolio.filter((item) => item.category === cat)}
                      onSelect={setSelectedItem}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </motion.div>
        </div>
      </section>

      {/* Portfolio Item Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {selectedItem.before_image_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Before</p>
                    <img
                      src={selectedItem.before_image_url}
                      alt="Before"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">After</p>
                  <img
                    src={selectedItem.after_image_url}
                    alt="After"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-serif font-semibold">{selectedItem.title}</h3>
                {selectedItem.description && (
                  <p className="text-muted-foreground mt-2">{selectedItem.description}</p>
                )}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedItem.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function PortfolioGrid({
  items,
  onSelect,
}: {
  items: PortfolioItem[];
  onSelect: (item: PortfolioItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer group"
          onClick={() => onSelect(item)}
        >
          <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
            <img
              src={item.after_image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="font-medium text-sm">{item.title}</span>
            </div>
            {item.is_featured && (
              <div className="absolute top-2 right-2">
                <Heart className="w-5 h-5 text-primary fill-primary" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
