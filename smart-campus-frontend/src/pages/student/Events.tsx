import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, Bookmark, Search, Filter, AlertCircle, Loader, Share2, Copy, CheckCircle, Users } from 'lucide-react';
import { eventsService, Event } from '@/services/eventService';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import { useToast } from '@/components/ui/use-toast';
import { playSuccessSound } from '@/lib/successSound';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Extend Event type internally if properties are missing from standard declaration
interface ExtendedEvent extends Event {
  max_capacity?: number;
  current_confirmed?: number;
  rsvp_status?: 'confirmed' | 'waitlisted' | null;
}

export default function EventsPage() {
  const { isOnline } = useConnectivity();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMap, setIsSavingMap] = useState<Map<number, boolean>>(new Map());
  const [isRsvpingMap, setIsRsvpingMap] = useState<Map<number, boolean>>(new Map()); // 🎫 Track RSVP loaders per card
  const [cancelEventId, setCancelEventId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    tag: '',
    upcoming: 'true',
  });

  useEffect(() => {
    loadEvents();
    loadSavedEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsService.getAll(filters);
      setEvents(response.data?.events || []);
    } catch (error: unknown) {
      const e = error as { message?: string };
      const errorMsg = e?.message || 'Failed to load events';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedEvents = async () => {
    try {
      const response = await eventsService.getMySaved();
      const ids = new Set(response.data?.events?.map((event: Event) => event.id) || []);
      setSavedEventIds(ids);
    } catch (error: unknown) {
      console.error('Failed to load saved events', error);
    }
  };

  const handleApplyFilters = () => {
    loadEvents();
  };

  const handleSaveEvent = async (eventId: number) => {
    try {
      setIsSavingMap(new Map(isSavingMap).set(eventId, true));

      if (savedEventIds.has(eventId)) {
        await eventsService.unsave(eventId);
        setSavedEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast({ title: 'Event removed from saved' });
      } else {
        await eventsService.save(eventId);
        setSavedEventIds(prev => new Set(prev).add(eventId));
        playSuccessSound();
        toast({ title: 'Event saved successfully!' });
      }
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast({
        variant: 'destructive',
        title: e?.message || 'Failed to save event',
      });
    } finally {
      setIsSavingMap(new Map(isSavingMap).set(eventId, false));
    }
  };

  // 🎫 Handle Live RSVP/Waitlist Network Intercept
  const handleRsvpEvent = async (eventId: number) => {
    try {
      setIsRsvpingMap(new Map(isRsvpingMap).set(eventId, true));
      
      // Hit backend system mapping
      const response = await eventsService.rsvp(eventId);
      const rsvpData = response.data?.rsvp;
      
      playSuccessSound();
      toast.success(rsvpData?.status === 'confirmed' 
        ? 'Seat confirmed successfully! 🎉' 
        : 'Event is full! You have joined the Waitlist queue. ⏳'
      );

      // Refresh states locally to re-render badges
      loadEvents();
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast.error(e?.message || 'Failed to process RSVP request');
    } finally {
      setIsRsvpingMap(new Map(isRsvpingMap).set(eventId, false));
    }
  };

  // 🎫 Handle Event RSVP Cancellation
  const handleCancelRsvpEvent = async (eventId: number) => {
    try {
      setIsRsvpingMap(new Map(isRsvpingMap).set(eventId, true));
      
      await eventsService.cancelRsvp(eventId);
      
      toast.success('Registration cancelled successfully! ❌');

      // Refresh states locally to re-render badges
      loadEvents();
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast.error(e?.message || 'Failed to cancel registration');
    } finally {
      setIsRsvpingMap(new Map(isRsvpingMap).set(eventId, false));
    }
  };

  const handleShareEvent = async (event: ExtendedEvent) => {
    const shareData = {
      title: event.title,
      text: `Event: ${event.title}\nTime: ${new Date(event.start_time).toLocaleString()}\nLocation: ${event.location}\n${event.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast({
            variant: 'destructive',
            title: 'Failed to share event',
          });
        }
      }
    } else {
      try {
        const fallbackText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(fallbackText);
        toast({ title: 'Event details copied to clipboard!' });
      } catch {
        toast({
          variant: 'destructive',
          title: 'Unable to share or copy event details',
        });
      }
    }
  };

  const handleCopyEventLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Unable to copy link',
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
            <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
            <p className="text-muted-foreground">Discover and save upcoming events</p>
          </div>

          <Card className="glass border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Error Loading Events</h3>
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
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-muted-foreground">Discover and save upcoming events</p>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Event title..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Computer Science"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  placeholder="workshop, sports..."
                  value={filters.tag}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleApplyFilters}
                  className="w-full bg-accent text-accent-foreground"
                  disabled={isLoading || !isOnline}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Filtering...
                    </>
                  ) : (
                    'Apply Filters'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event, index: number) => {
              const extendedEvent = event as ExtendedEvent;
              const userStatus = extendedEvent.rsvp_status;
              const maxCapacity = extendedEvent.max_capacity ?? 0;
              const currentConfirmed = extendedEvent.current_confirmed ?? 0;
              const isFull = maxCapacity > 0 && currentConfirmed >= maxCapacity;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass glow-accent-hover h-full flex flex-col justify-between">
                    <div>
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="flex-1">{event.title}</span>
                            {/* 🎫 Conditional Metadata Pill Badges */}
                            {userStatus && (
                              <div className="flex mt-1">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  userStatus === 'confirmed' 
                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                                    : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                }`}>
                                  {userStatus === 'confirmed' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" /> Confirmed
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3 w-3" /> Waitlisted
                                    </>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleCopyEventLink}
                              title="Copy link"
                              aria-label={`Copy link for ${event.title}`}
                            >
                              <Copy className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            </motion.button>

                            {/* Share Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleShareEvent(event)}
                              title="Share event"
                              aria-label={`Share ${event.title}`}
                            >
                              <Share2 className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            </motion.button>

                            {/* Bookmark Button */}
                            <motion.button
                              whileHover={isOnline ? { scale: 1.1 } : {}}
                              whileTap={isOnline ? { scale: 0.9 } : {}}
                              onClick={() => isOnline && handleSaveEvent(event.id)}
                              disabled={isSavingMap.get(event.id) || !isOnline}
                              className={`flex-shrink-0 ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={savedEventIds.has(event.id) ? 'Remove from saved' : 'Save event'}
                              aria-label={savedEventIds.has(event.id) ? `Unsave ${event.title}` : `Save ${event.title}`}
                        >
                          <Bookmark
                            className={`h-5 w-5 transition-colors ${
                              savedEventIds.has(event.id)
                                ? 'text-primary fill-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </motion.button>
                      </div>
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
                        <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      {/* 🎫 Seats Capacity Gauge Mapping */}
                      <div className="flex items-center gap-2 text-muted-foreground pt-1">
                        <Users className="h-4 w-4" />
                        <span className={`font-medium ${isFull ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {currentConfirmed} / {maxCapacity} Seats Filled {isFull && '(Full)'}
                        </span>
                      </div>
                    </div>
                    {event.club_name && (
                      <div className="text-xs text-accent font-medium pt-2">By: {event.club_name}</div>
                    )}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent-foreground"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* 🎫 Dynamic Fullstack Action Button */}
                <div className="px-6 pb-6">
                  {userStatus ? (
                    <Button
                      onClick={() => setCancelEventId(event.id)}
                      disabled={isRsvpingMap.get(event.id) || !isOnline}
                      className="w-full font-bold transition-all bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isRsvpingMap.get(event.id) ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Cancel Registration'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRsvpEvent(event.id)}
                      disabled={isRsvpingMap.get(event.id) || !isOnline}
                      className={`w-full font-bold transition-all ${
                        isFull 
                          ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {isRsvpingMap.get(event.id) ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isFull ? (
                        'Join Waitlist'
                      ) : (
                        'RSVP Now'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
            );
          })}
          </div>
        )}
      </motion.div>

      <AlertDialog open={cancelEventId !== null} onOpenChange={(open) => { if (!open) setCancelEventId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your registration for this event? If the event becomes full, you may have to join the waitlist if you decide to register again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelEventId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelEventId !== null) {
                  handleCancelRsvpEvent(cancelEventId);
                  setCancelEventId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
