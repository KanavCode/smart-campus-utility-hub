import { motion } from 'framer-motion';
import { Brain, Zap, Shield } from 'lucide-react';
import TiltCard from '@/components/animations/TiltCard';

const features = [
  {
    icon: Brain,
    title: 'Intelligent Allocation',
    description: 'ML-powered elective allocation ensures fair distribution based on student preferences and academic performance.',
    gradient: 'from-primary/20 to-accent/20',
  },
  {
    icon: Zap,
    title: 'AI Conflict Resolution',
    description: 'Automatic detection and resolution of scheduling conflicts in real-time, optimizing resource utilization.',
    gradient: 'from-accent/20 to-primary/20',
  },
  {
    icon: Shield,
    title: 'Secure & Scalable',
    description: 'Enterprise-grade security with end-to-end encryption and cloud infrastructure that scales with your campus.',
    gradient: 'from-primary/20 via-accent/20 to-primary/20',
  },
];

export default function SmartCore() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring' }}
      className="py-20 px-4 relative overflow-hidden"
    >
      {/* Animated Network Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary" opacity="0.3" />
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            {/* Animated connecting lines */}
            {[...Array(5)].map((_, i) => (
              <motion.line
                key={i}
                x1={`${10 + i * 20}%`}
                y1="10%"
                x2={`${20 + i * 15}%`}
                y2="90%"
                stroke="url(#gradient)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  repeatDelay: 1,
                }}
              />
            ))}
          </motion.g>
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4"
          >
            <span className="text-primary font-semibold">AI-Powered Core</span>
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">The "Smart" in Smart Campus</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on cutting-edge AI and cloud infrastructure to deliver intelligent, secure, and scalable solutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <TiltCard className="h-full">
                <div className={`glass p-8 rounded-2xl h-full relative overflow-hidden group hover:glow-accent transition-all duration-300`}>
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6"
                    >
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                    {/* Hover Effect Line */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      className="h-0.5 bg-gradient-to-r from-primary to-accent mt-4"
                    />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '256-bit', label: 'Encryption' },
            { value: '<50ms', label: 'Response Time' },
            { value: 'ISO 27001', label: 'Certified' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass px-6 py-4 rounded-lg"
            >
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
