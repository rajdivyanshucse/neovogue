import { motion } from 'framer-motion';
import { Star, BadgeCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import designerAvatar1 from '@/assets/designer-avatar-1.jpg';
import designerAvatar2 from '@/assets/designer-avatar-2.jpg';

const designers = [
  {
    name: 'Aria Chen',
    specialty: 'Modern Minimalist',
    rating: 4.9,
    projects: 156,
    verified: true,
    avatar: designerAvatar1,
  },
  {
    name: 'Marcus Rivera',
    specialty: 'Vintage Revival',
    rating: 4.8,
    projects: 132,
    verified: true,
    avatar: designerAvatar2,
  },
  {
    name: 'Zara Okonkwo',
    specialty: 'Fusion Couture',
    rating: 4.9,
    projects: 98,
    verified: true,
    avatar: designerAvatar1,
  },
  {
    name: 'Elena Volkov',
    specialty: 'Sustainable Luxury',
    rating: 4.7,
    projects: 87,
    verified: true,
    avatar: designerAvatar2,
  },
];

export function FeaturedDesigners() {
  return (
    <section id="designers" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Featured <span className="text-gradient-gold">Designers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Work with the best independent fashion designers, verified for quality and creativity.
            </p>
          </div>
          <Link to="/auth?mode=signup">
            <Button variant="outline" className="gap-2">
              View All Designers
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designers.map((designer, index) => (
            <motion.div
              key={designer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-luxury rounded-xl overflow-hidden group"
            >
              {/* Designer Avatar */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    View Portfolio
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-lg">{designer.name}</h3>
                  {designer.verified && (
                    <BadgeCheck className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{designer.specialty}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">{designer.rating}</span>
                  </div>
                  <span className="text-muted-foreground">{designer.projects} projects</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
