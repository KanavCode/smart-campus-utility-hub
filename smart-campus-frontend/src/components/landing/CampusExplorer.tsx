import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tabs = [
  {
    id: 'timetables',
    label: 'Timetables',
    icon: Calendar,
    content: {
      title: 'Smart Timetable Management',
      features: [
        'AI-powered conflict detection',
        'Automatic room allocation',
        'Teacher availability tracking',
        'Real-time synchronization',
      ],
      demo: (
        <div className="space-y-3">
          <div className="glass p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">09:00 - 10:00</span>
              <span className="text-xs text-muted-foreground">Room 301</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Data Structures</p>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">10:15 - 11:15</span>
              <span className="text-xs text-muted-foreground">Lab 2</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Web Development</p>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">11:30 - 12:30</span>
              <span className="text-xs text-muted-foreground">Room 205</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Algorithms</p>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'events',
    label: 'Events',
    icon: Users,
    content: {
      title: 'Campus Event Management',
      features: [
        'One-click event creation',
        'Automated notifications',
        'Club-specific event feeds',
        'RSVP tracking & analytics',
      ],
      demo: (
        <div className="space-y-3">
          <div className="glass p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Tech Conference 2024</h4>
                <p className="text-xs text-muted-foreground">Dec 15 • Auditorium</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">Technology</span>
                  <span className="text-xs text-muted-foreground">250 attending</span>
                </div>
              </div>
            </div>
          </div>
          <div className="glass p-4 rounded-lg opacity-70">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Workshop: AI Basics</h4>
                <p className="text-xs text-muted-foreground">Dec 18 • Lab 5</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">Workshop</span>
                  <span className="text-xs text-muted-foreground">75 attending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'electives',
    label: 'Electives',
    icon: BookOpen,
    content: {
      title: 'Intelligent Elective Selection',
      features: [
        'Preference-based allocation',
        'CGPA-weighted ranking',
        'Conflict-free scheduling',
        'Fair distribution algorithm',
      ],
      demo: (
        <div className="space-y-3">
          <div className="glass p-4 rounded-lg border-2 border-primary/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Machine Learning</h4>
              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">Allocated</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Your 1st Choice</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
              </div>
              <span className="text-xs text-muted-foreground">85% full</span>
            </div>
          </div>
          <div className="glass p-4 rounded-lg opacity-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Cloud Computing</h4>
              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">2nd Choice</span>
            </div>
            <p className="text-xs text-muted-foreground">Pending allocation</p>
          </div>
        </div>
      ),
    },
  },
];

export default function CampusExplorer() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring' }}
      className="py-20 px-4"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Interactive Campus Hub</h2>
          <p className="text-muted-foreground text-lg">
            Explore the platform's powerful features
          </p>
        </motion.div>

        <div className="glass rounded-2xl p-1 glow-accent">
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 bg-secondary/50 rounded text-xs text-muted-foreground">
                campus-hub.app
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-4 border-b border-border/50">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeContent && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Features List */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4">{activeContent.title}</h3>
                      <ul className="space-y-3">
                        {activeContent.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Demo UI */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {activeContent.demo}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
