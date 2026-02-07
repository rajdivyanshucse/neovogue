import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturedDesigners } from '@/components/landing/FeaturedDesigners';
import { SustainabilitySection } from '@/components/landing/SustainabilitySection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturedDesigners />
      <SustainabilitySection />
      <Footer />
    </div>
  );
};

export default Index;