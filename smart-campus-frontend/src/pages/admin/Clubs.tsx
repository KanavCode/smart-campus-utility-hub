import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, AlertCircle, Loader } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clubService, Club } from '@/services/clubService';
import { toast } from 'sonner';

interface ClubFormData {
  name: string;
  description: string;
  contact_email: string;
  category: string;
}

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    description: '',
    contact_email: '',
    category: 'Academic'
  });

  const categories = ['Academic', 'Sports', 'Cultural', 'Technical', 'Arts', 'Social'];

  // Load clubs on mount
  useEffect(() => {
    loadClubs();
  }, []);

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

  const handleOpenModal = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      setFormData({
        name: club.name,
        description: club.description,
        contact_email: club.contact_email,
        category: club.category
      });
    } else {
      setEditingClub(null);
      setFormData({
        name: '',
        description: '',
        contact_email: '',
        category: 'Academic'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClub(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Club name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.contact_email.trim()) {
      toast.error('Contact email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingClub) {
        await clubService.update(editingClub.id, formData);
        toast.success('Club updated successfully!');
      } else {
        await clubService.create(formData);
        toast.success('Club created successfully!');
      }

      handleCloseModal();
      loadClubs();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save club');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return;
    }

    try {
      await clubService.delete(id);
      toast.success('Club deleted successfully!');
      loadClubs();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete club');
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Club Management</h1>
              <p className="text-muted-foreground">Manage campus clubs</p>
            </div>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Club Management</h1>
            <p className="text-muted-foreground">Create and manage campus clubs</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground font-semibold"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Club
          </Button>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-lg"
              >
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">
                    {editingClub ? 'Edit Club' : 'Create New Club'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Club Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Coding Club"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Club description..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Email *</label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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
                          {editingClub ? 'Updating...' : 'Creating...'}
                        </>
                      ) : editingClub ? (
                        'Update Club'
                      ) : (
                        'Create Club'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clubs Table */}
        {clubs.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No clubs created yet</p>
              <Button onClick={() => handleOpenModal()} className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Club
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="glass rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Club Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Contact Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <AnimatePresence>
                    {clubs.map((club) => (
                      <motion.tr
                        key={club.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-accent/5"
                      >
                        <td className="px-6 py-4 font-medium">{club.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/20 text-primary">
                            {club.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{club.contact_email}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(club)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(club.id)}
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
        )}

        {/* Stats */}
        {clubs.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{clubs.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Clubs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {categories.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Categories</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {Array.from(new Set(clubs.map(c => c.category))).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Active Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
