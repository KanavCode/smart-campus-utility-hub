import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { FormModal } from '@/components/modals/FormModal';
import { TeacherForm } from '@/components/forms/TeacherForm';
import { SubjectForm } from '@/components/forms/SubjectForm';
import { RoomForm } from '@/components/forms/RoomForm';
import { GroupForm } from '@/components/forms/GroupForm';
import { timetableService } from '@/services/timetableService';

export default function TimetableManagement() {
  const [isDraft, setIsDraft] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleGenerateDraft = async () => {
    const generationData = {
      groups: [],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      periods_per_day: 7,
      lunch_break_period: 4,
      academic_year: "2024-25",
      semester_type: "odd",
      preferences: {
        respect_teacher_preferences: true
      }
    };
    
    try {
      await timetableService.generateTimetable(generationData);
      setIsDraft(true);
      toast.success('Draft timetable generated!');
    } catch (error) {
      toast.error('Failed to generate timetable');
    }
  };

  const handleConfirmPublish = async () => {
    console.log('Publishing timetable...');
    setIsDraft(false);
    toast.success('Timetable published successfully!');
  };

  const handleModalSuccess = () => {
    setActiveModal(null);
    toast.success('Successfully saved!');
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Timetable Generation</h1>
          <p className="text-muted-foreground">Generate and manage campus timetables</p>
        </div>

        {isDraft && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass border-2 border-accent/50 p-6 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-lg text-accent">DRAFT MODE</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Review the generated timetable below. Click "Confirm & Publish" to make it live.
            </p>
            <Button
              onClick={handleConfirmPublish}
              className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
              asChild
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirm & Publish
              </motion.button>
            </Button>
          </motion.div>
        )}

        <Card className="glass">
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
              <p className="text-muted-foreground">
                Manage timetable entities before generating
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => setActiveModal('teacher')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                asChild
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add Teacher</span>
                </motion.button>
              </Button>

              <Button
                onClick={() => setActiveModal('subject')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                asChild
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add Subject</span>
                </motion.button>
              </Button>

              <Button
                onClick={() => setActiveModal('room')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                asChild
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add Room</span>
                </motion.button>
              </Button>

              <Button
                onClick={() => setActiveModal('group')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                asChild
              >
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add Group</span>
                </motion.button>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Timetable Configuration</h3>
                <p className="text-muted-foreground text-sm">
                  Set up generation parameters
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Periods per Day</label>
                  <input 
                    type="number" 
                    defaultValue={7} 
                    className="w-full p-2 rounded-lg bg-card border border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Working Days</label>
                  <input 
                    defaultValue="Monday - Saturday" 
                    className="w-full p-2 rounded-lg bg-card border border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lunch Break Period</label>
                  <input 
                    type="number" 
                    defaultValue={4} 
                    className="w-full p-2 rounded-lg bg-card border border-border"
                  />
                </div>
                <Button
                  className="w-full bg-accent text-accent-foreground glow-accent-hover"
                  asChild
                >
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Save Configuration
                  </motion.button>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Generation Settings</h3>
                <p className="text-muted-foreground text-sm">
                  Configure semester and year
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Academic Year</label>
                  <select className="w-full p-2 rounded-lg bg-card border border-border">
                    <option>2024-2025</option>
                    <option>2025-2026</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <select className="w-full p-2 rounded-lg bg-card border border-border">
                    <option>Fall</option>
                    <option>Spring</option>
                  </select>
                </div>
                {!isDraft && (
                  <Button
                    onClick={handleGenerateDraft}
                    className="bg-primary text-primary-foreground font-semibold glow-primary-hover w-full"
                    asChild
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Generate Draft Timetable
                    </motion.button>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Generation Statistics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">48</div>
                <div className="text-sm text-muted-foreground">Total Subjects</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Classes</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">28</div>
                <div className="text-sm text-muted-foreground">Rooms Available</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">Faculty Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <FormModal
          isOpen={activeModal === 'teacher'}
          onClose={() => setActiveModal(null)}
          title="Add Teacher"
        >
          <TeacherForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>

        <FormModal
          isOpen={activeModal === 'subject'}
          onClose={() => setActiveModal(null)}
          title="Add Subject"
        >
          <SubjectForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>

        <FormModal
          isOpen={activeModal === 'room'}
          onClose={() => setActiveModal(null)}
          title="Add Room"
        >
          <RoomForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>

        <FormModal
          isOpen={activeModal === 'group'}
          onClose={() => setActiveModal(null)}
          title="Add Group"
        >
          <GroupForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>
      </motion.div>
    </DashboardLayout>
  );
}
