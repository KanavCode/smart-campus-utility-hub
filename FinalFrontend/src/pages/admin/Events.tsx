import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, AlertCircle, Loader, Search, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { eventsService, Event, CreateEventData } from '@/services/eventService';
import { clubService, Club } from '@/services/clubService';

/**
 * Convert ISO datetime string (2025-11-15T12:30:00.000Z) to datetime-local format (2025-11-15T12:30)
 * Used for datetime-local input type compatibility
 */
function formatDatetimeForInput(isoString: string): string {
  if (!isoString) return '';
  // Remove Z suffix and milliseconds
  const cleaned = isoString.replace(/\.\d{3}Z$/, '').replace('Z', '');
  // Take only date and time without seconds
  return cleaned.substring(0, 16);
}

interface EventFormData extends CreateEventData {}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    club_id: null,
    target_department: '',
    is_featured: false,
    tags: []
  });

  useEffect(() => {
    loadClubs();
    loadEvents();
  }, []);

  const loadClubs = async () => {
    try {
      setIsLoadingClubs(true);
      const response = await clubService.getAll();
      setClubs(response.data?.clubs || []);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load clubs';
      console.error(errorMsg);
      // Don't block the UI if clubs fail to load
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsService.getAll({ upcoming: 'false' });
      setEvents(response.data?.events || []);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load events';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        start_time: formatDatetimeForInput(event.start_time),
        end_time: formatDatetimeForInput(event.end_time),
        club_id: event.club_id,
        target_department: event.target_department,
        is_featured: event.is_featured,
        tags: event.tags || []
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        club_id: null,
        target_department: '',
        is_featured: false,
        tags: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.start_time) {
      toast.error('Start time is required');
      return;
    }
    if (!formData.end_time) {
      toast.error('End time is required');
      return;
    }
    if (!formData.club_id) {
      toast.error('Associated club is required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingEvent) {
        await eventsService.update(editingEvent.id, formData);
        toast.success('Event updated successfully!');
      } else {
        await eventsService.create(formData);
        toast.success('Event created successfully!');
      }

      handleCloseModal();
      loadEvents();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsService.delete(id);
      toast.success('Event deleted successfully!');
      loadEvents();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Event Management</h1>
              <p className="text-muted-foreground">Manage campus events</p>
            </div>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Management</h1>
            <p className="text-muted-foreground">Create and manage campus events</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground font-semibold"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
              >
                <div className="sticky top-0 p-6 border-b border-border bg-card/95 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Tech Talk on AI"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location *</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Auditorium A"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Event description..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time *</label>
                      <Input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time *</label>
                      <Input
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Associated Club *</label>
                      <select
                        value={formData.club_id || ''}
                        onChange={(e) => setFormData({ ...formData, club_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Select a club...</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                      {clubs.length === 0 && !isLoadingClubs && (
                        <p className="text-xs text-red-600">No clubs available. Create a club first.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Department</label>
                      <Input
                        value={formData.target_department || ''}
                        onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags (comma separated)</label>
                      <Input
                        value={(formData.tags || []).join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                        })}
                        placeholder="workshop, seminar, career"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    <label htmlFor="featured" className="text-sm font-medium">
                      Featured Event
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          {editingEvent ? 'Updating...' : 'Creating...'}
                        </>
                      ) : editingEvent ? (
                        'Update Event'
                      ) : (
                        'Create Event'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Table */}
        {events.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No events created yet</p>
              <Button onClick={() => handleOpenModal()} className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="glass rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Event Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <AnimatePresence>
                      {filteredEvents.map((event) => (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-accent/5"
                        >
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-2">
                              {event.is_featured && (
                                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                                  Featured
                                </span>
                              )}
                              {event.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{event.location}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(event.start_time).toLocaleDateString()} {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events found matching "{searchTerm}"
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
