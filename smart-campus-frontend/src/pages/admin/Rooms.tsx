import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { roomService } from '@/services/roomService';
import { FormModal } from '@/components/modals/FormModal';
import { RoomForm } from '@/components/forms/RoomForm';
import { SkeletonTableRow, ErrorStateCard } from '@/components/ui/DataStateDisplay';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('room_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadRooms = useCallback(async () => {
    try {
      const result = await roomService.list({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortField,
        order: sortDirection,
      });
      setRooms(result.items);
      setTotal(result.total);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load rooms');
      setRooms([]);
    }
  }, [currentPage, sortField, sortDirection]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const {
    isModalOpen,
    selectedItem: editingRoom,
    isLoading,
    error,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
    retryLoad,
  } = useAdminCrud<any>({
    getAll: roomService.getAll,
    deleteById: roomService.delete,
    entityName: 'room',
    confirmDeleteMessage: 'Are you sure you want to delete this room?',
    onDeleteSuccessMessage: 'Room deleted successfully!',
    autoLoad: false,
    onRefresh: loadRooms,
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rooms Management</h1>
            <p className="text-muted-foreground">Manage campus rooms and facilities</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Room
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
                    onClick={() => handleSort('room_code')}
                  >
                    Code {sortField === 'room_code' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('room_name')}
                  >
                    Name {sortField === 'room_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('room_type')}
                  >
                    Type {sortField === 'room_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('capacity')}
                  >
                    Capacity {sortField === 'capacity' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">

                {/* Empty state */}
                {!isLoading && !error && rooms.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      No rooms found. Create your first room to get started.
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!isLoading &&
                  !error &&
                  rooms.map((room: any) => (
                    <motion.tr
                      key={room.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-accent/5"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{room.room_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{room.room_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{room.room_type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{room.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {room.building}, Floor {room.floor_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(room.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {total > 0
                ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} of ${total}`
                : 'No rooms found'}
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRoom ? 'Edit Room' : 'Create New Room'}
      >
        <RoomForm
          initialData={editingRoom}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </FormModal>
    </DashboardLayout>
  );
}
