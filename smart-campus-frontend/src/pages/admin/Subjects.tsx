import { useCallback, useEffect, useState } from 'react';
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
import { SubjectForm } from '@/components/forms/SubjectForm';
import { subjectService } from '@/services/subjectService';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { toast } from 'sonner';

interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  hours_per_week: number;
  course_type: string;
  semester: number;
  code: string;
  name: string;
  credits: number;
  department: string;
}

const ITEMS_PER_PAGE = 10;

export default function Subjects() {
  const [search, setSearch] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('subject_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadSubjects = useCallback(async () => {
    try {
      const result = await subjectService.list({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortField,
        order: sortDirection,
      });
      setSubjects(result.items as Subject[]);
      setTotal(result.total);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load subjects');
      setSubjects([]);
    }
  }, [currentPage, sortField, sortDirection]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

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
    selectedItem: selectedSubject,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
  } = useAdminCrud<Subject>({
    getAll: subjectService.getAll,
    deleteById: subjectService.delete,
    entityName: 'subject',
    autoLoad: false,
    onRefresh: loadSubjects,
  });

  const filteredSubjects = subjects.filter((subject) => {
    const q = search.toLowerCase();
    return (
      subject.code?.toLowerCase().includes(q) ||
      subject.name?.toLowerCase().includes(q) ||
      subject.department?.toLowerCase().includes(q)
    );
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
            <h1 className="text-3xl font-bold mb-2">Subject Management</h1>
            <p className="text-muted-foreground">Manage academic subjects and courses</p>
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
              Create New
            </motion.button>
          </Button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
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
                  <TableHead
                    className="cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('subject_code')}
                  >
                    Code {sortField === 'subject_code' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('subject_name')}
                  >
                    Name {sortField === 'subject_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent/20"
                    onClick={() => handleSort('department')}
                  >
                    Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No subjects found. Create your first subject to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-accent/5">
                      <TableCell className="font-medium">{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>{subject.department}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem onClick={() => openEdit(subject)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteItem(subject.id)}
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

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {total > 0
                ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} of ${total}`
                : 'No subjects found'}
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

        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedSubject ? 'Edit Subject' : 'Create New Subject'}
        >
          <SubjectForm
            onSuccess={handleFormSuccess}
            onCancel={closeModal}
            initialData={selectedSubject}
          />
        </FormModal>
      </motion.div>
    </DashboardLayout>
  );
}
