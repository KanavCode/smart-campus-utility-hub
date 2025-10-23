import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { eventsService } from '@/services/eventService';

export default function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      const response = await eventsService.getMySaved();
      setSavedEvents(response.data?.events || []);
    } catch (error) {
      toast.error('Failed to load saved events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsaveEvent = async (eventId: string) => {
    try {
      await eventsService.unsave(eventId);
      toast.success('Event removed from saved');
      loadSavedEvents();
    } catch (error) {
      toast.error('Failed to unsave event');
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">My Saved Events</h1>
          <p className="text-muted-foreground">Events you've bookmarked for later</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading saved events...</p>
          </div>
        ) : savedEvents.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Saved Events</h3>
              <p className="text-muted-foreground">
                Browse events and save the ones you're interested in
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {savedEvents.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass glow-accent-hover h-full">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>{event.title}</span>
                      <Bookmark className="h-5 w-5 text-primary fill-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-sm">{event.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(event.start_time).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleUnsaveEvent(event.id)}
                      asChild
                    >
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Remove from Saved
                      </motion.button>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
