import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { pageTransition, fadeInUp, fadeInLeft, fadeInRight, staggerContainer, scaleIn } from '../utils/animations';
import { 
  Calendar, Users, BookOpen, TrendingUp, Sparkles, Zap, Shield, 
  Clock, Star, ChevronRight, Award, Target, Rocket 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

/**
 * Enhanced LandingPage Component - Phase 2
 * Premium SaaS-style landing with parallax, animated counters, testimonials
 * Inspired by modern SaaS platforms with premium animations
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  // Animated counter hook for stats
  const useCounter = (end, duration = 2000, inView) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!inView) return;
      let startTime;
      let animationFrame;
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        setCount(Math.floor(end * percentage));
        
        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, inView]);
    
    return count;
  };

  const stats = [
    { label: 'Active Students', value: 5000, suffix: '+', icon: Users, color: 'text-purple-500' },
    { label: 'Campus Events', value: 200, suffix: '+', icon: Calendar, color: 'text-teal-500' },
    { label: 'Course Options', value: 150, suffix: '+', icon: BookOpen, color: 'text-blue-500' },
    { label: 'Success Rate', value: 98, suffix: '%', icon: TrendingUp, color: 'text-green-500' },
  ];

  const features = [
    {
      title: 'Smart Timetable',
      description: 'AI-powered scheduling that adapts to your preferences and academic needs. Never miss a class again.',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      benefits: ['Auto-sync with calendar', 'Conflict detection', 'Smart reminders'],
    },
    {
      title: 'Campus Events Hub',
      description: 'Discover, save, and participate in campus events. Stay connected with your campus community.',
      icon: Users,
      color: 'from-teal-500 to-cyan-500',
      benefits: ['Real-time updates', 'RSVP system', 'Club management'],
    },
    {
      title: 'Elective Selection',
      description: 'Choose your courses wisely with real-time availability, seat tracking, and intelligent recommendations.',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      benefits: ['Live seat tracking', 'Priority management', 'Course reviews'],
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science, 3rd Year',
      content: 'This platform completely transformed how I manage my academic life. The timetable feature is a game-changer!',
      avatar: '👩‍🎓',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Business Administration, 2nd Year',
      content: 'I never miss any campus events now. The notification system is perfect and the UI is stunning!',
      avatar: '👨‍💼',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Engineering, 4th Year',
      content: 'Elective selection used to be stressful. Now it\'s smooth and transparent. Highly recommend!',
      avatar: '👩‍💻',
      rating: 5,
    },
  ];

  const whyChooseUs = [
    { icon: Zap, title: 'Lightning Fast', description: 'Optimized performance for instant access' },
    { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and protected' },
    { icon: Clock, title: '24/7 Available', description: 'Access your dashboard anytime, anywhere' },
    { icon: Award, title: 'Award Winning', description: 'Recognized by students across campus' },
  ];

  return (
    <motion.div
      className="min-h-screen"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl"
          animate={{
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="max-w-7xl mx-auto text-center relative z-10"
          style={{ opacity, scale }}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-6"
            variants={scaleIn}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Trusted by 5,000+ students</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            variants={fadeInUp}
          >
            Your Campus,{' '}
            <span className="gradient-text inline-block">
              Simplified
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-text-secondary dark:text-text-secondary-dark mb-10 max-w-4xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            The all-in-one platform that brings your academic life together. 
            <span className="text-primary dark:text-primary-light font-semibold"> Schedule</span>, 
            <span className="text-accent dark:text-accent-light font-semibold"> discover</span>, and 
            <span className="text-primary dark:text-primary-light font-semibold"> succeed</span>—effortlessly.
          </motion.p>
          
          <motion.div
            className="flex gap-4 justify-center flex-wrap mb-12"
            variants={fadeInUp}
          >
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              leftIcon={<Rocket size={20} />}
              className="shadow-xl shadow-primary/20"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              rightIcon={<ChevronRight size={20} />}
            >
              Sign In
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex items-center justify-center gap-8 flex-wrap text-sm text-text-secondary dark:text-text-secondary-dark"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" />
              <span>4.9/5 Rating</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="py-20 px-4 bg-backgroundAlt dark:bg-backgroundAlt-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative z-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          onViewportEnter={() => setStatsInView(true)}
        >
          {stats.map((stat, index) => {
            const count = useCounter(stat.value, 2000, statsInView);
            return (
              <motion.div
                key={index}
                variants={scaleIn}
              >
                <Card hover className="text-center h-full relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardBody className="relative z-10">
                    <stat.icon className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 ${stat.color}`} />
                    <h3 className="text-4xl md:text-5xl font-bold mb-2">
                      {count}{stat.suffix}
                    </h3>
                    <p className="text-sm md:text-base text-text-secondary dark:text-text-secondary-dark">
                      {stat.label}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-20 md:py-32 px-4">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 dark:bg-accent/20 border border-accent/20 mb-4">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Core Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Powerful tools designed to make your academic journey seamless and stress-free
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card glass hover className="h-full group relative overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <CardBody className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-backgroundAlt dark:bg-backgroundAlt-dark">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            variants={fadeInUp}
          >
            Why Students <span className="gradient-text">Love Us</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card hover className="text-center h-full">
                  <CardBody>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-accent p-2.5">
                      <item.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                      {item.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 px-4">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-4">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Students <span className="gradient-text">Say</span>
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card glass hover className="h-full">
                  <CardBody>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-xl"
          />
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform Your
            <br />
            <span className="gradient-text">Campus Experience?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-text-secondary dark:text-text-secondary-dark">
            Join thousands of students already using Smart Campus.
            <br />
            <span className="font-semibold text-primary dark:text-primary-light">Start free today!</span>
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              leftIcon={<Rocket size={20} />}
              className="shadow-2xl shadow-primary/30"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In Instead
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-text-secondary dark:text-text-secondary-dark">
            No credit card required • Free forever • Cancel anytime
          </p>
        </motion.div>
      </section>
    </motion.div>
  );
}
