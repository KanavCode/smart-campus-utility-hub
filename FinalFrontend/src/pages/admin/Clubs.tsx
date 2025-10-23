import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { clubService } from '@/services/clubService';
import { FormModal } from '@/components/modals/FormModal';
import { ClubForm } from '@/components/forms/ClubForm';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await clubService.getAll();
      setClubs(response.data?.clubs || []);
    } catch (error) {
      toast.error('Failed to load clubs');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this club?')) {
      await clubService.delete(id);
      toast.success('Club deleted successfully!');
      loadClubs();
    }
  };

  const sortedClubs = [...clubs].sort((a: any, b: any) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    return sortDirection === 'asc' 
      ? aVal > bVal ? 1 : -1
      : aVal < bVal ? 1 : -1;
  });

  const paginatedClubs = sortedClubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(clubs.length / itemsPerPage);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Clubs Management</h1>
            <p className="text-muted-foreground">Manage campus clubs and organizations</p>
          </div>
          <Button
            onClick={() => {
              setEditingClub(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Club
            </motion.button>
          </Button>
        </div>

        <div className="glass rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/10">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('name')}
                  >
                    Club Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                {paginatedClubs.map((club: any) => (
                  <motion.tr
                    key={club.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-accent/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{club.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{club.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{club.contact_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingClub(club);
                          setIsModalOpen(true);
                        }}
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
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClub ? 'Edit Club' : 'Create New Club'}
      >
        <ClubForm
          initialData={editingClub}
          onSuccess={() => {
            setIsModalOpen(false);
            loadClubs();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </DashboardLayout>
  );
}
