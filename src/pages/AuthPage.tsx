import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { z } from 'zod';


type AppRole = 'customer' | 'designer' | 'delivery_partner' | 'admin';


const slideImages = [
  { id: 1, src: `${import.meta.env.BASE_URL}assets/image5.jpg`, title: 'Sustainable Silk' },
  { id: 2, src: `${import.meta.env.BASE_URL}assets/image2.jpg`, title: 'Upcycled Detail' },
  { id: 3, src: `${import.meta.env.BASE_URL}assets/image3.jpg`, title: 'Nature & Fabric' },
  { id: 4, src: `${import.meta.env.BASE_URL}assets/image4.jpg`, title: 'Craft & Connection' },
  { id: 5, src: `${import.meta.env.BASE_URL}assets/image1.jpg`, title: 'Craft & Connection' },
  // { id: 6, src: `${import.meta.env.BASE_URL}assets/image6.jpg`, title: 'Craft & Connection' },

];

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const roles: { value: AppRole; label: string; description: string }[] = [
  { value: 'customer', label: 'Customer', description: 'Get your dresses redesigned' },
  { value: 'designer', label: 'Designer', description: 'Offer your design services' },
  { value: 'delivery_partner', label: 'Delivery Partner', description: 'Handle pickups & deliveries' },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, signUp, signIn } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<AppRole>('customer');
  const [currentSlide, setCurrentSlide] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && role) {
      const dashboardPath = role === 'designer' ? '/designer' : 
                           role === 'delivery_partner' ? '/delivery' : 
                           role === 'admin' ? '/admin' : '/dashboard';
      navigate(dashboardPath);
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'signup') {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, selectedRole, formData.fullName);
        if (error) {
          toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            {mode === 'signup' ? 'Join NeoVogue' : 'Welcome Back'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {mode === 'signup' && (
              <>
                <div className="space-y-3">
                  <Label>I want to join as</Label>
                  <div className="grid gap-3">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setSelectedRole(r.value)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedRole === r.value ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="font-medium">{r.label}</div>
                        <div className="text-sm text-muted-foreground">{r.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="mt-4 text-primary w-full text-center">
             {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </motion.div>
      </div>

      {/* Right Panel - Visual Slideshow */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-zinc-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={slideImages[currentSlide].id}
            src={slideImages[currentSlide].src}
            alt={slideImages[currentSlide].title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => console.error("Image load failed:", slideImages[currentSlide].src)}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-black/00 z-10" /> 

        <div className="relative z-20 text-center text-white px-12">
           <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <span className="text-3xl font-bold">NV</span>
           </div>
           <h2 className="text-4xl font-serif font-bold mb-4">Sustainable Fashion Reimagined</h2>
           <p className="text-white/100">Join the movement toward ethical style.</p>
           
           <div className="flex gap-2 mt-8 justify-center">
            {slideImages.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all ${currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/30"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}