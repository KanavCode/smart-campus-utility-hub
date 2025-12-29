import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, AlertCircle, Loader, Mail, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clubService, Club, ClubWithEvents } from '@/services/clubService';
import { toast } from 'sonner';

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState<ClubWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Academic', 'Sports', 'Cultural', 'Technical', 'Arts', 'Social'];

  // Load clubs on mount
  useEffect(() => {
    loadClubs();
  }, []);

  // Filter clubs when search or category changes
  useEffect(() => {
    let filtered = clubs;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        club =>
          club.name.toLowerCase().includes(query) ||
          club.description.toLowerCase().includes(query)
      );
    }

    setFilteredClubs(filtered);
  }, [clubs, searchQuery, selectedCategory]);

  const loadClubs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clubService.getAll();
      setClubs(data);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load clubs';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClubClick = async (clubId: number) => {
    try {
      setIsLoadingDetails(true);
      const clubData = await clubService.getById(clubId);
      setSelectedClub(clubData);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load club details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading clubs...</p>
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
          <div>
            <h1 className="text-3xl font-bold mb-2">Campus Clubs</h1>
            <p className="text-muted-foreground">Discover and join clubs</p>
          </div>

          <Card className="glass border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Error Loading Clubs</h3>
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Campus Clubs</h1>
          <p className="text-muted-foreground">Discover and join clubs on campus</p>
        </div>

        {/* View Toggle - Show selected club or list */}
        {selectedClub && !isLoadingDetails ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Club Details Card */}
            <Button
              variant="outline"
              onClick={() => setSelectedClub(null)}
              className="mb-4"
            >
              ← Back to Clubs
            </Button>

            <Card className="glass">
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-3xl">{selectedClub.name}</CardTitle>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                        {selectedClub.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Club Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{selectedClub.description}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a
                      href={`mailto:${selectedClub.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedClub.contact_email}
                    </a>
                  </div>
                </div>

                {/* Club Events */}
                {selectedClub.events && selectedClub.events.length > 0 && (
                  <div className="space-y-4 border-t border-border pt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Upcoming Events ({selectedClub.events.length})
                    </h3>

                    <div className="space-y-3">
                      {selectedClub.events.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass rounded-lg p-4 border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <span>📅 {new Date(event.start_time).toLocaleDateString()}</span>
                                <span>🕐 {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>📍 {event.location}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {(!selectedClub.events || selectedClub.events.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground border-t border-border pt-6">
                    <p>No upcoming events for this club</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Clubs Grid */}
            {filteredClubs.length === 0 ? (
              <Card className="glass">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {clubs.length === 0
                      ? 'No clubs available yet'
                      : 'No clubs match your search'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredClubs.map((club, index) => (
                    <motion.div
                      key={club.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="glass hover:border-primary/50 glow-accent-hover cursor-pointer h-full transition-all"
                        onClick={() => handleClubClick(club.id)}
                      >
                        <CardHeader>
                          <div className="space-y-2">
                            <CardTitle className="line-clamp-2">{club.name}</CardTitle>
                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-primary/20 text-primary">
                              {club.category}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {club.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{club.contact_email}</span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClubClick(club.id);
                            }}
                          >
                            {isLoadingDetails ? (
                              <>
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'View Details'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Results Count */}
            {filteredClubs.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Showing {filteredClubs.length} of {clubs.length} clubs
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
