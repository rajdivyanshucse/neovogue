import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
 import heroFashion from '@/assets/hero-fashion.jpg';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Sustainable Fashion Revolution
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6"
            >
              Reimagine Your{' '}
              <span className="text-gradient-gold">Wardrobe</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Connect with world-class designers to transform your existing clothes 
              into unique, sustainable fashion pieces. One dress, endless possibilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base px-8">
                  Redesign My Dress
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/#how-it-works">
                <Button variant="outline" size="lg" className="text-base px-8">
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border"
            >
              <div>
                <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Verified Designers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">12K+</div>
                <div className="text-sm text-muted-foreground mt-1">Dresses Redesigned</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">95%</div>
                <div className="text-sm text-muted-foreground mt-1">Happy Customers</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
             <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-2xl">
               <img 
                 src={heroFashion} 
                 alt="Premium Fashion Reimagined" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
               <div className="absolute bottom-6 left-6 right-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
                   <Sparkles className="w-4 h-4 text-primary" />
                   Premium Fashion Reimagined
                 </div>
               </div>
               {/* Decorative Elements */}
               <div className="absolute top-4 right-4 w-20 h-20 border border-primary/30 rounded-full" />
               <div className="absolute bottom-20 left-4 w-16 h-16 border border-primary/20 rounded-full" />
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}