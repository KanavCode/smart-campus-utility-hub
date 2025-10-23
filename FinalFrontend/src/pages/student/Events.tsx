import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, Bookmark, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { eventsService } from '@/services/eventService';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    tag: '',
    upcoming: 'true'
  });

  useEffect(() => {
    loadEvents();
    loadSavedEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsService.getAll(filters);
      setEvents(response.data?.events || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedEvents = async () => {
    try {
      const response = await eventsService.getMySaved();
      const ids = new Set(response.data?.events?.map((e: any) => e.id) || []);
      setSavedEventIds(ids);
    } catch (error) {
      console.error('Failed to load saved events');
    }
  };

  const handleApplyFilters = () => {
    setIsLoading(true);
    loadEvents();
  };

  const handleSaveEvent = async (eventId: string) => {
    try {
      if (savedEventIds.has(eventId)) {
        await eventsService.unsave(eventId);
        setSavedEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast.success('Event removed from saved');
      } else {
        await eventsService.save(eventId);
        setSavedEventIds(prev => new Set(prev).add(eventId));
        toast.success('Event saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save event');
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
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-muted-foreground">Discover and save upcoming events</p>
        </div>

        {/* Filters Card */}
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
                  asChild
                >
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Apply Filters
                  </motion.button>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to find events
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass glow-accent-hover h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="pr-2">{event.title}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSaveEvent(event.id)}
                        className="flex-shrink-0"
                      >
                        <Bookmark
                          className={`h-5 w-5 ${
                            savedEventIds.has(event.id)
                              ? 'text-primary fill-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </motion.button>
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
                    {event.tags && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.tags.split(',').map((tag: string, i: number) => (
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
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
