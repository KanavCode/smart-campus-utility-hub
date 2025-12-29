import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Bookmark, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { eventsService, SavedEvent } from '@/services/eventService';

export default function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsService.getMySaved();
      setSavedEvents(response.data?.events || []);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to load saved events';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsaveEvent = async (eventId: number) => {
    try {
      setIsRemoving(new Set(isRemoving).add(eventId));
      await eventsService.unsave(eventId);
      setSavedEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event removed from saved');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to unsave event');
    } finally {
      setIsRemoving(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  if (error && !isLoading) {
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

          <Card className="glass border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Error Loading Saved Events</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DashboardLayout>
    );
  }

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
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading saved events...</p>
            </div>
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
            {savedEvents.map((event: SavedEvent, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass glow-accent-hover h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="flex-1">{event.title}</span>
                      <Bookmark className="h-5 w-5 text-primary fill-primary flex-shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <p className="text-muted-foreground text-sm flex-1">{event.description}</p>
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
                    {event.club_name && (
                      <div className="text-xs text-accent font-medium pt-2">
                        By: {event.club_name}
                      </div>
                    )}
                    {event.saved_at && (
                      <div className="text-xs text-muted-foreground pt-2">
                        Saved: {new Date(event.saved_at).toLocaleDateString()}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleUnsaveEvent(event.id)}
                      disabled={isRemoving.has(event.id)}
                    >
                      {isRemoving.has(event.id) ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        'Remove from Saved'
                      )}
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
