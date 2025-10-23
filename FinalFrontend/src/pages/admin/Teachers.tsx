import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { teacherService } from '@/services/teacherService';
import { FormModal } from '@/components/modals/FormModal';
import { TeacherForm } from '@/components/forms/TeacherForm';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const data = await teacherService.getAll();
    setTeachers(data);
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
    if (confirm('Are you sure you want to delete this teacher?')) {
      await teacherService.delete(id);
      toast.success('Teacher deleted successfully!');
      loadTeachers();
    }
  };

  const sortedTeachers = [...teachers].sort((a: any, b: any) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    return sortDirection === 'asc' 
      ? aVal > bVal ? 1 : -1
      : aVal < bVal ? 1 : -1;
  });

  const paginatedTeachers = sortedTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(teachers.length / itemsPerPage);

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
            onClick={() => {
              setEditingTeacher(null);
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
                {paginatedTeachers.map((teacher: any) => (
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
                        onClick={() => {
                          setEditingTeacher(teacher);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(teacher.id)}
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
        title={editingTeacher ? 'Edit Teacher' : 'Create New Teacher'}
      >
        <TeacherForm
          initialData={editingTeacher}
          onSuccess={() => {
            setIsModalOpen(false);
            loadTeachers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </DashboardLayout>
  );
}
