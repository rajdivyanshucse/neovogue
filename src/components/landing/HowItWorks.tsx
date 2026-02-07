import { motion } from 'framer-motion';
import { Upload, Palette, Truck, Heart } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Dress',
    description: 'Share photos of the dress you want to transform. Our platform makes it easy to showcase every detail.',
  },
  {
    icon: Palette,
    title: 'Choose Your Designer',
    description: 'Browse portfolios of verified designers. Select one whose style matches your vision and budget.',
  },
  {
    icon: Truck,
    title: 'We Handle Logistics',
    description: 'Our trusted partners pick up your dress, deliver it to the designer, and return it to you safely.',
  },
  {
    icon: Heart,
    title: 'Love Your New Look',
    description: 'Receive your redesigned dress and enjoy a unique piece that tells your sustainability story.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your wardrobe in four simple steps. From upload to delivery, 
            we make sustainable fashion effortless.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}

              <div className="card-luxury rounded-xl p-8 relative z-10 h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-xl font-serif font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}