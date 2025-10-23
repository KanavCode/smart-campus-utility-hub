import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { electiveService } from '@/services/electiveService';

interface Elective {
  id: string;
  code: string;
  name: string;
  description: string;
}

export default function Electives() {
  const [availableElectives, setAvailableElectives] = useState<Elective[]>([]);
  const [preferences, setPreferences] = useState<(Elective | null)[]>(Array(5).fill(null));
  const [draggedItem, setDraggedItem] = useState<Elective | null>(null);

  useEffect(() => {
    loadElectives();
  }, []);

  const loadElectives = async () => {
    const data = await electiveService.getAll();
    setAvailableElectives(data);
  };

  const handleSubmit = async () => {
    const validPreferences = preferences.filter(p => p !== null);
    await electiveService.submitPreferences(validPreferences);
    toast.success('Preferences submitted successfully!');
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Elective Choices</h1>
          <p className="text-muted-foreground">Drag and drop to rank your preferences</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Electives</h2>
            <div className="space-y-3">
              {availableElectives.map((elective) => (
                <motion.div
                  key={elective.id}
                  whileHover={{ scale: 1.02 }}
                  draggable
                  onDragStart={() => setDraggedItem(elective)}
                  onDragEnd={() => setDraggedItem(null)}
                  className="cursor-move"
                >
                  <Card className="glass glow-accent-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{elective.code} - {elective.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{elective.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Preferences (Ranked)</h2>
            <div className="space-y-3">
              {preferences.map((pref, index) => (
                <div
                  key={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedItem) {
                      const newPrefs = [...preferences];
                      newPrefs[index] = draggedItem;
                      setPreferences(newPrefs);
                    }
                  }}
                  className="min-h-[100px]"
                >
                  <Card className="glass h-full border-2 border-dashed border-accent/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        {pref ? (
                          <div>
                            <div className="font-semibold">{pref.code} - {pref.name}</div>
                            <p className="text-xs text-muted-foreground mt-1">{pref.description}</p>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            Drop an elective here
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={preferences.some(p => p === null)}
              className="w-full bg-primary text-primary-foreground font-semibold glow-primary-hover"
              asChild
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Preferences
              </motion.button>
            </Button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
