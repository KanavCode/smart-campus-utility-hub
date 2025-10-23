import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { electiveService } from '@/services/electiveService';
import { FormModal } from '@/components/modals/FormModal';
import { ElectiveForm } from '@/components/forms/ElectiveForm';

export default function AdminElectives() {
  const [confirmText, setConfirmText] = useState('');
  const [electives, setElectives] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElective, setEditingElective] = useState(null);

  useEffect(() => {
    loadElectives();
  }, []);

  const loadElectives = async () => {
    const data = await electiveService.getAll();
    setElectives(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this elective?')) {
      await electiveService.delete(id);
      toast.success('Elective deleted successfully!');
      loadElectives();
    }
  };

  const handleRunAllocation = async () => {
    if (confirmText !== 'ALLOCATE') {
      toast.error('Please type ALLOCATE to confirm');
      return;
    }

    await electiveService.runAllocation();
    toast.success('Allocation started successfully!');
    setConfirmText('');
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
            <h1 className="text-3xl font-bold mb-2">Elective Management</h1>
            <p className="text-muted-foreground">Manage electives and run allocation</p>
          </div>
          <Button
            onClick={() => {
              setEditingElective(null);
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
              Create New Elective
            </motion.button>
          </Button>
        </div>

        <div className="glass rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Max Students
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {electives.map((elective: any) => (
                  <motion.tr
                    key={elective.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-accent/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{elective.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{elective.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{elective.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{elective.max_students}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingElective(elective);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(elective.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Card className="glass border-destructive/50">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Critical Action Warning</h3>
                <p className="text-muted-foreground">
                  Running the allocation algorithm will permanently assign students to electives based on their preferences. 
                  This action cannot be undone easily.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <span className="text-destructive font-bold">ALLOCATE</span> to confirm
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type ALLOCATE"
                  className="max-w-md focus:ring-2 focus:ring-destructive"
                />
              </div>

              <Button
                onClick={handleRunAllocation}
                disabled={confirmText !== 'ALLOCATE'}
                className="bg-destructive text-destructive-foreground font-bold text-lg px-8 py-6"
                asChild
              >
                <motion.button
                  whileHover={confirmText === 'ALLOCATE' ? { scale: 1.05 } : {}}
                  whileTap={confirmText === 'ALLOCATE' ? { scale: 0.98 } : {}}
                >
                  RUN ALLOCATION
                </motion.button>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Allocation Statistics</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">234</div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Available Electives</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">Students per Elective (avg)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingElective ? 'Edit Elective' : 'Create New Elective'}
      >
        <ElectiveForm
          initialData={editingElective}
          onSuccess={() => {
            setIsModalOpen(false);
            loadElectives();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </DashboardLayout>
  );
}
