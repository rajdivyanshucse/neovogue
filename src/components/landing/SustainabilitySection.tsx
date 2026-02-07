import { motion } from 'framer-motion';
import { Leaf, Recycle, Droplets, TreeDeciduous } from 'lucide-react';
import { useEffect, useState } from 'react';

const stats = [
  {
    icon: Recycle,
    value: 25000,
    suffix: '+',
    label: 'Garments Saved from Landfills',
  },
  {
    icon: Droplets,
    value: 1.2,
    suffix: 'M',
    label: 'Liters of Water Saved',
  },
  {
    icon: Leaf,
    value: 450,
    suffix: 'T',
    label: 'CO₂ Emissions Prevented',
  },
  {
    icon: TreeDeciduous,
    value: 8500,
    suffix: '+',
    label: 'Trees Worth of Impact',
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const displayValue = value >= 100 ? Math.floor(count).toLocaleString() : count.toFixed(1);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

export function SustainabilitySection() {
  return (
    <section id="sustainability" className="py-24 bg-accent text-accent-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            Our Environmental Impact
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Fashion That Heals the <span className="text-primary">Planet</span>
          </h2>
          <p className="text-lg text-accent-foreground/70 max-w-2xl mx-auto">
            Every redesigned dress is a step towards a more sustainable future. 
            Here's the impact our community has made together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 rounded-xl bg-accent-foreground/5 border border-accent-foreground/10"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <stat.icon className="w-8 h-8 text-success" />
              </div>
              <div className="text-4xl md:text-5xl font-serif font-bold mb-2 text-primary">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-accent-foreground/70">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}