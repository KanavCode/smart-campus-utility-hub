import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Beaker } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = Array.from({ length: 8 }, (_, i) => i + 1);

interface TimetableSlot {
  subject?: string;
  teacher?: string;
  room?: string;
  isLab?: boolean;
}

// This would come from props/API in production
const timetableData: Record<string, Record<number, TimetableSlot>> = {};

export default function Timetable() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">My Timetable</h1>
          <p className="text-muted-foreground">Your weekly class schedule</p>
        </div>

        <div className="glass rounded-2xl p-6 overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-9 gap-2 mb-2">
              <div className="font-semibold text-sm text-center p-2">Day / Period</div>
              {periods.map((period) => (
                <div key={period} className="font-semibold text-sm text-center p-2">
                  P{period}
                </div>
              ))}
            </div>

            {days.map((day) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-9 gap-2 mb-2"
              >
                <div className="font-medium text-sm flex items-center p-2">
                  {day}
                </div>
                {periods.map((period) => {
                  const slot = timetableData[day]?.[period];
                  return (
                    <Card
                      key={`${day}-${period}`}
                      className="glass p-3 min-h-[80px] hover:scale-105 transition-transform glow-accent-hover"
                    >
                      {slot ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {slot.isLab && <Beaker className="h-3 w-3 text-accent" />}
                            <div className="font-semibold text-xs">{slot.subject}</div>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{slot.teacher}</div>
                          <div className="text-[10px] text-accent">{slot.room}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">-</div>
                      )}
                    </Card>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
