import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormModal } from '@/components/modals/FormModal';
import { EventForm } from '@/components/forms/EventForm';
import { eventsService } from '@/services/eventService';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsService.getAll();
      setEvents(response.data?.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsService.delete(eventId);
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadEvents();
  };

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
            <p className="text-muted-foreground">Manage campus events and activities</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </motion.button>
          </Button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-accent/5">
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No events found. Create your first event to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id} className="hover:bg-accent/5">
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem onClick={() => handleEdit(event)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(event.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedEvent ? 'Edit Event' : 'Create New Event'}
        >
          <EventForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
            initialData={selectedEvent}
          />
        </FormModal>
      </motion.div>
    </DashboardLayout>
  );
}
