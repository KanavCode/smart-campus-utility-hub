import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

const studentJourney = [
  {
    time: '8:00 AM',
    title: 'Check Daily Schedule',
    description: 'View personalized timetable with room locations and teacher info',
  },
  {
    time: '12:00 PM',
    title: 'Browse Campus Events',
    description: 'Discover events from clubs and save interesting ones',
  },
  {
    time: '3:00 PM',
    title: 'Submit Elective Choices',
    description: 'Rank elective preferences before the deadline',
  },
  {
    time: '6:00 PM',
    title: 'Get Event Notifications',
    description: 'Receive reminders for saved events and club meetings',
  },
];

const adminJourney = [
  {
    time: '9:00 AM',
    title: 'Generate Timetables',
    description: 'AI automatically creates conflict-free schedules for all groups',
  },
  {
    time: '11:00 AM',
    title: 'Create Campus Event',
    description: 'Publish event details with tags and department filters',
  },
  {
    time: '2:00 PM',
    title: 'Run Elective Allocation',
    description: 'Fair algorithm allocates electives based on preferences and CGPA',
  },
  {
    time: '5:00 PM',
    title: 'Review Analytics',
    description: 'Track engagement metrics and system usage patterns',
  },
];

function Journey({ steps, title, color }: { steps: typeof studentJourney; title: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={ref} className="relative">
      <h3 className="text-2xl font-bold mb-8">{title}</h3>
      
      {/* Timeline Line */}
      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border/30">
        <motion.div
          style={{ height: lineHeight }}
          className={`w-full ${color === 'primary' ? 'bg-primary' : 'bg-accent'}`}
        />
      </div>

      {/* Steps */}
      <div className="space-y-8 relative">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-16"
          >
            {/* Timeline Dot */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className={`absolute left-4 top-2 w-5 h-5 rounded-full border-2 ${
                color === 'primary' ? 'bg-primary border-primary' : 'bg-accent border-accent'
              } flex items-center justify-center`}
            >
              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
            </motion.div>

            {/* Content */}
            <motion.div
              whileHover={{ x: 4 }}
              className="glass p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{step.time}</span>
              </div>
              <h4 className="text-lg font-semibold mb-1">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function DayInLife() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring' }}
      className="py-20 px-4 bg-secondary/20"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">A Day in the Life</h2>
          <p className="text-muted-foreground text-lg">
            See how the platform transforms daily campus operations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <Journey steps={studentJourney} title="Student Journey" color="primary" />
          <Journey steps={adminJourney} title="Admin Journey" color="accent" />
        </div>
      </div>
    </motion.section>
  );
}
