import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role } = useAuth();

  const getDashboardLink = () => {
    switch (role) {
      case 'designer':
        return '/designer';
      case 'delivery_partner':
        return '/delivery';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold tracking-tight">
              Neo<span className="text-gradient-gold">Vogue</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/designers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Designers
            </Link>
            <Link to="/#sustainability" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sustainability
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link to={getDashboardLink()}>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                to="/#how-it-works"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium py-2"
              >
                How It Works
              </Link>
              <Link
                to="/designers"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium py-2"
              >
                Designers
              </Link>
              <Link
                to="/#sustainability"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium py-2"
              >
                Sustainability
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <Link to={getDashboardLink()} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-accent text-accent-foreground">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}