import { Leaf, Droplets, Recycle, TreeDeciduous } from 'lucide-react';
import { CustomerDashboardLayout } from '@/components/dashboard/CustomerDashboardLayout';
import { motion } from 'framer-motion';

export default function Impact() {
  // Simulated impact data - in production this would be calculated from user's orders
  const impactData = {
    garmentsSaved: 3,
    waterSaved: 2700, // liters
    co2Prevented: 15, // kg
    treesEquivalent: 1.2,
  };

  const impactCards = [
    {
      icon: Recycle,
      value: impactData.garmentsSaved,
      unit: '',
      label: 'Garments Saved from Landfills',
      color: 'text-success bg-success/10',
    },
    {
      icon: Droplets,
      value: impactData.waterSaved.toLocaleString(),
      unit: 'L',
      label: 'Liters of Water Saved',
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: Leaf,
      value: impactData.co2Prevented,
      unit: 'kg',
      label: 'CO₂ Emissions Prevented',
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      icon: TreeDeciduous,
      value: impactData.treesEquivalent,
      unit: '',
      label: 'Trees Worth of Impact',
      color: 'text-green-600 bg-green-600/10',
    },
  ];

  return (
    <CustomerDashboardLayout title="Your Impact" subtitle="See how you're making a difference">
      <div className="max-w-4xl">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury rounded-xl p-8 mb-8 bg-gradient-to-br from-success/10 to-success/5 border-success/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">Sustainability Champion</h2>
              <p className="text-muted-foreground">
                Your fashion choices are making a real impact on the planet
              </p>
            </div>
          </div>
        </motion.div>

        {/* Impact Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {impactCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-luxury rounded-xl p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-serif font-bold mb-1">
                {card.value}
                {card.unit && <span className="text-lg ml-1">{card.unit}</span>}
              </div>
              <p className="text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Did You Know */}
        <div className="card-luxury rounded-xl p-6">
          <h3 className="text-lg font-serif font-semibold mb-4">Did You Know?</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              🌍 The fashion industry is responsible for 10% of global carbon emissions – 
              more than international flights and maritime shipping combined.
            </p>
            <p>
              💧 It takes about 2,700 liters of water to make one cotton t-shirt – 
              that's enough for one person to drink for 2.5 years.
            </p>
            <p>
              ♻️ By choosing to redesign instead of discard, you're part of a movement 
              that's transforming fashion into a force for good.
            </p>
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}