import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, FunnelIcon } from "@heroicons/react/24/outline";
import EventCard from "../components/events/EventCard";
import EventFilters from "../components/events/EventFilters";
import EventDetailsModal from "../components/events/EventDetailsModal";
import { pageTransition, staggerContainer } from "../utils/animations";
import useAuthStore from "../hooks/useAuthStore";

/**
 * EventsPage Component - Phase 3
 *
 * Main events listing page with filtering, search, and save functionality
 * Integrates with backend /api/events endpoint
 */

export default function EventsPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    categories: [],
    timeFilter: null,
    search: "",
  });

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        // Use mock data if backend fails
        setEvents(getMockEvents());
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      // Use mock data as fallback
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((event) =>
        filters.categories.includes(event.category)
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.organizer?.toLowerCase().includes(searchLower)
      );
    }

    // Time filter
    if (filters.timeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.event_date);

        switch (filters.timeFilter) {
          case "today":
            return eventDate.toDateString() === today.toDateString();
          case "week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow;
          case "month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return eventDate >= today && eventDate <= monthFromNow;
          case "upcoming":
            return eventDate >= today;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  const handleSaveEvent = async (eventId, save) => {
    try {
      const endpoint = save ? "/api/events/save" : "/api/events/unsave";
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event_id: eventId }),
      });

      if (response.ok) {
        // Update local state
        setEvents(
          events.map((event) =>
            event.event_id === eventId ? { ...event, is_saved: save } : event
          )
        );
      }
    } catch (error) {
      console.error("Failed to save/unsave event:", error);
      throw error;
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      timeFilter: null,
      search: "",
    });
  };

  return (
    <motion.div
      className="min-h-screen py-8 px-4 md:px-8 lg:px-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Campus <span className="gradient-text">Events</span>
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark text-lg">
            Discover and join exciting activities happening on campus
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <EventFilters
              filters={filters}
              onFilterChange={setFilters}
              onClear={handleClearFilters}
            />
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-text-secondary dark:text-text-secondary-dark">
                {loading ? (
                  "Loading events..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-text dark:text-text-dark">
                      {filteredEvents.length}
                    </span>{" "}
                    event{filteredEvents.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>

              {/* Sort Dropdown - Future enhancement */}
              {/* <select className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-backgroundAlt-dark">
                <option>Sort by Date</option>
                <option>Sort by Popularity</option>
              </select> */}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="glass-strong rounded-2xl overflow-hidden"
                  >
                    <div className="h-48 bg-backgroundAlt dark:bg-backgroundAlt-dark animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-backgroundAlt dark:bg-backgroundAlt-dark animate-pulse rounded" />
                      <div className="h-4 bg-backgroundAlt dark:bg-backgroundAlt-dark animate-pulse rounded w-2/3" />
                      <div className="h-4 bg-backgroundAlt dark:bg-backgroundAlt-dark animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Events Grid */}
            {!loading && filteredEvents.length > 0 && (
              <motion.div
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredEvents.map((event, index) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    index={index}
                    onSave={handleSaveEvent}
                    onClick={handleEventClick}
                  />
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && filteredEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarIcon className="w-20 h-20 text-text-secondary dark:text-text-secondary-dark opacity-50 mb-4" />
                <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">
                  No events found
                </h3>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
                  Try adjusting your filters or check back later
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        isSaved={selectedEvent?.is_saved}
      />
    </motion.div>
  );
}

// Mock data for development/fallback
function getMockEvents() {
  return [
    {
      event_id: 1,
      title: "Tech Workshop: React Advanced Patterns",
      description:
        "Learn advanced React patterns including hooks, context, and performance optimization. Perfect for intermediate developers looking to level up their skills.",
      category: "Workshop",
      event_date: "2025-10-12",
      start_time: "14:00:00",
      end_time: "17:00:00",
      location: "Engineering Hall, Room 201",
      organizer: "Tech Club",
      image_url:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      registration_link: "https://example.com/register",
      is_saved: false,
    },
    {
      event_id: 2,
      title: "Campus Fest 2025 - Registration Open",
      description:
        "The biggest cultural festival of the year! Dance, music, drama, and much more. Join us for 3 days of non-stop entertainment.",
      category: "Cultural",
      event_date: "2025-10-15",
      start_time: "10:00:00",
      end_time: "22:00:00",
      location: "Main Auditorium",
      organizer: "Cultural Committee",
      image_url:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      is_saved: true,
    },
    {
      event_id: 3,
      title: "Career Fair: Meet Top Recruiters",
      description:
        "Connect with leading companies and explore exciting career opportunities. Bring your resume and dress professionally.",
      category: "Seminar",
      event_date: "2025-10-18",
      start_time: "09:00:00",
      end_time: "16:00:00",
      location: "Sports Complex",
      organizer: "Placement Cell",
      image_url:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      is_saved: false,
    },
    {
      event_id: 4,
      title: "Hackathon 2025: Code for Change",
      description:
        "24-hour coding marathon to solve real-world problems. Form teams and win exciting prizes. Free food and swag for all participants!",
      category: "Competition",
      event_date: "2025-10-20",
      start_time: "08:00:00",
      end_time: "08:00:00",
      location: "Computer Lab - Building A",
      organizer: "Coding Club",
      image_url:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
      is_saved: true,
    },
    {
      event_id: 5,
      title: "Annual Sports Day",
      description:
        "Inter-department sports competition featuring cricket, football, basketball, and track events. Show your sporting spirit!",
      category: "Sports",
      event_date: "2025-10-22",
      start_time: "07:00:00",
      end_time: "18:00:00",
      location: "University Sports Grounds",
      organizer: "Sports Committee",
      image_url:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
      is_saved: false,
    },
    {
      event_id: 6,
      title: "AI & Machine Learning Seminar",
      description:
        "Industry experts share insights on the latest trends in AI and ML. Learn about career paths and research opportunities.",
      category: "Technical",
      event_date: "2025-10-25",
      start_time: "15:00:00",
      end_time: "18:00:00",
      location: "Seminar Hall 3",
      organizer: "AI Research Group",
      image_url:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      is_saved: false,
    },
  ];
}
