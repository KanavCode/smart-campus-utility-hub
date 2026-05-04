import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { teacherService } from '@/services/teacherService';
import { FormModal } from '@/components/modals/FormModal';
import { TeacherForm } from '@/components/forms/TeacherForm';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadTeachers = useCallback(async () => {
    try {
      const result = await teacherService.list({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortField,
        order: sortDirection,
      });
      setTeachers(result.items);
      setTotal(result.total);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load teachers');
      setTeachers([]);
    }
  }, [currentPage, sortField, sortDirection]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

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
    selectedItem: editingTeacher,
    isLoading,
    error,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
  } = useAdminCrud<any>({
    getAll: teacherService.getAll,
    deleteById: teacherService.delete,
    entityName: 'teacher',
    confirmDeleteMessage: 'Are you sure you want to delete this teacher?',
    onDeleteSuccessMessage: 'Teacher deleted successfully!',
    autoLoad: false,
    onRefresh: loadTeachers,
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
            <h1 className="text-3xl font-bold mb-2">Teachers Management</h1>
            <p className="text-muted-foreground">Manage faculty members</p>
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
              Create New Teacher
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
                    onClick={() => handleSort('teacher_code')}
                  >
                    Code {sortField === 'teacher_code' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('full_name')}
                  >
                    Name {sortField === 'full_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('department')}
                  >
                    Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {teachers.map((teacher: any) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-accent/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{teacher.teacher_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div>{teacher.email}</div>
                      <div className="text-xs">{teacher.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}

                {/* Empty state */}
                {!isLoading && !error && teachers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">
                      No teachers found. Create your first teacher to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {total > 0
                ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} of ${total}`
                : 'No teachers found'}
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
        title={editingTeacher ? 'Edit Teacher' : 'Create New Teacher'}
      >
        <TeacherForm
          initialData={editingTeacher}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </FormModal>
    </DashboardLayout>
  );
}
