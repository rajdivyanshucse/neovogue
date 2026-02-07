import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, ArrowRight, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';

interface DesignerWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  specialties: string[] | null;
  rating: number | null;
  experience_years: number | null;
  total_projects: number | null;
  is_verified: boolean | null;
  is_available: boolean | null;
  price_range_min: number | null;
  price_range_max: number | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
  portfolio_items?: {
    id: string;
    after_image_url: string;
    title: string;
  }[];
}

export default function Designers() {
  const [designers, setDesigners] = useState<DesignerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [specialty, setSpecialty] = useState('all');

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      const { data: designerProfiles, error } = await supabase
        .from('designer_profiles')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true);

      if (error) throw error;

      // Fetch profiles and portfolio for each designer
      const designersWithDetails = await Promise.all(
        (designerProfiles || []).map(async (designer) => {
          const [profileResult, portfolioResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name, avatar_url, city')
              .eq('user_id', designer.user_id)
              .single(),
            supabase
              .from('portfolio_items')
              .select('id, after_image_url, title')
              .eq('designer_id', designer.user_id)
              .limit(4),
          ]);

          return {
            ...designer,
            profile: profileResult.data,
            portfolio_items: portfolioResult.data || [],
          };
        })
      );

      setDesigners(designersWithDetails);
    } catch (error) {
      logError('Designers.fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigners = designers
    .filter((d) => {
      const nameMatch = d.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const bioMatch = d.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      const specialtyMatch =
        specialty === 'all' ||
        d.specialties?.some((s) => s.toLowerCase().includes(specialty.toLowerCase()));
      return (nameMatch || bioMatch) && specialtyMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.experience_years || 0) - (a.experience_years || 0);
      if (sortBy === 'projects') return (b.total_projects || 0) - (a.total_projects || 0);
      return 0;
    });

  const allSpecialties = [...new Set(designers.flatMap((d) => d.specialties || []))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Meet Our <span className="text-gradient-gold">Designers</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover talented artisans who transform forgotten garments into stunning, sustainable fashion pieces.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search designers by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {allSpecialties.map((s) => (
                  <SelectItem key={s} value={s.toLowerCase()}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="projects">Most Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Designers Grid */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-luxury rounded-xl p-6 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
                  <div className="h-5 bg-muted rounded w-2/3 mx-auto mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4" />
                  <div className="h-16 bg-muted rounded mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-muted rounded" />
                    <div className="aspect-square bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDesigners.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No designers found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setSpecialty('all'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDesigners.map((designer, index) => (
                <motion.div
                  key={designer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link to={`/designers/${designer.user_id}`}>
                    <div className="card-luxury rounded-xl p-6 h-full hover:shadow-lg transition-all group">
                      {/* Designer Header */}
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-3 overflow-hidden">
                          {designer.profile?.avatar_url ? (
                            <img
                              src={designer.profile.avatar_url}
                              alt={designer.profile?.full_name || 'Designer'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-serif text-primary">
                              {designer.profile?.full_name?.[0] || 'D'}
                            </div>
                          )}
                        </div>
                        <h3 className="font-serif font-semibold text-lg group-hover:text-primary transition-colors">
                          {designer.profile?.full_name || 'Designer'}
                        </h3>
                        {designer.profile?.city && (
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {designer.profile.city}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          <span className="font-medium">{designer.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{designer.experience_years || 0}+ years</span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {designer.bio || 'Expert fashion redesign specialist bringing new life to your wardrobe.'}
                      </p>

                      {/* Specialties */}
                      {designer.specialties && designer.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {designer.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Portfolio Preview */}
                      {designer.portfolio_items && designer.portfolio_items.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {designer.portfolio_items.slice(0, 4).map((item) => (
                            <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                              <img
                                src={item.after_image_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price Range */}
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Starting from</span>
                        <span className="font-semibold text-primary">
                          ₹{designer.price_range_min || 500}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
