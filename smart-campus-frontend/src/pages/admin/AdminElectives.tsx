import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Plus, Edit, Trash2, Download, RotateCcw, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { electiveService, Elective, AllocationResult } from '@/services/electiveService';
import { FormModal } from '@/components/modals/FormModal';
import { ElectiveForm } from '@/components/forms/ElectiveForm';

export default function AdminElectives() {
  const [confirmText, setConfirmText] = useState('');
  const [electives, setElectives] = useState<Elective[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElective, setEditingElective] = useState<Elective | null>(null);
  const [allocating, setAllocating] = useState(false);
  const [allocationResults, setAllocationResults] = useState<AllocationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingElectives, setLoadingElectives] = useState(true);

  useEffect(() => {
    loadElectives();
  }, []);

  const loadElectives = async () => {
    try {
      setLoadingElectives(true);
      const data = await electiveService.getAll();
      setElectives(data);
    } catch (error: any) {
      toast.error('Failed to load electives');
      console.error(error);
    } finally {
      setLoadingElectives(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this elective? This action cannot be undone.')) {
      return;
    }

    try {
      await electiveService.delete(id);
      toast.success('Elective deleted successfully!');
      loadElectives();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete elective');
    }
  };

  const handleRunAllocation = async () => {
    if (confirmText !== 'ALLOCATE') {
      toast.error('Please type "ALLOCATE" to confirm');
      return;
    }

    try {
      setAllocating(true);
      const results = await electiveService.runAllocation();
      setAllocationResults(results);
      setShowResults(true);
      setConfirmText('');
      toast.success('Allocation completed successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to run allocation');
      console.error(error);
    } finally {
      setAllocating(false);
    }
  };

  const handleDownloadResults = () => {
    const csv = [
      ['Student Name', 'CGPA', 'Allocated Elective', 'Preference Rank'].join(','),
      ...allocationResults.map(r => 
        [r.student_name, r.cgpa, r.allocated_elective, r.preference_rank || 'N/A'].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electives-allocation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Results downloaded!');
  };

  const getStats = () => {
    if (allocationResults.length === 0) return null;
    
    const allocated = allocationResults.filter(r => r.allocated_elective !== 'None (No seat available)').length;
    const unallocated = allocationResults.length - allocated;
    const avgCGPA = (allocationResults.reduce((sum, r) => sum + r.cgpa, 0) / allocationResults.length).toFixed(2);

    return { allocated, unallocated, avgCGPA, total: allocationResults.length };
  };

  const stats = getStats();

  if (loadingElectives) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading electives...</p>
        </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Elective Management</h1>
            <p className="text-muted-foreground">Manage electives and run allocation algorithm</p>
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

        {/* Electives Table */}
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
                <AnimatePresence>
                  {electives.map((elective) => (
                    <motion.tr
                      key={elective.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-accent/5"
                    >
                      <td className="px-6 py-4 font-medium">{elective.subject_name}</td>
                      <td className="px-6 py-4">{elective.department}</td>
                      <td className="px-6 py-4">{elective.semester}</td>
                      <td className="px-6 py-4">{elective.max_students}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingElective(elective);
                            setIsModalOpen(true);
                          }}
                          asChild
                        >
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Edit className="h-4 w-4" />
                          </motion.button>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(elective.id)}
                          asChild
                        >
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </motion.button>
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Run Allocation Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Critical Action: Run Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Running the allocation algorithm will permanently assign students to electives based on their preferences 
                and CGPA ranking. Higher CGPA students get priority on their preferred electives.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Type <span className="text-destructive font-bold">ALLOCATE</span> to confirm
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type ALLOCATE"
                    className="max-w-md focus:ring-2 focus:ring-destructive"
                    disabled={allocating}
                  />
                </div>

                <Button
                  onClick={handleRunAllocation}
                  disabled={confirmText !== 'ALLOCATE' || allocating}
                  className="bg-destructive text-destructive-foreground font-bold text-lg px-8 py-6"
                  asChild
                >
                  <motion.button
                    whileHover={confirmText === 'ALLOCATE' && !allocating ? { scale: 1.05 } : {}}
                    whileTap={confirmText === 'ALLOCATE' && !allocating ? { scale: 0.98 } : {}}
                  >
                    {allocating ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin inline" />
                        ALLOCATING...
                      </>
                    ) : (
                      'RUN ALLOCATION'
                    )}
                  </motion.button>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Allocation Results */}
        <AnimatePresence>
          {showResults && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="glass bg-green-500/5 border-green-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-600">Allocation Results</CardTitle>
                    <div className="space-x-2">
                      <Button
                        onClick={handleDownloadResults}
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </motion.button>
                      </Button>
                      <Button
                        onClick={() => setShowResults(false)}
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <RotateCcw className="h-4 w-4" />
                        </motion.button>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-accent/10">
                      <div className="text-2xl font-bold text-green-600">{stats.allocated}</div>
                      <div className="text-sm text-muted-foreground">Students Allocated</div>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10">
                      <div className="text-2xl font-bold text-orange-600">{stats.unallocated}</div>
                      <div className="text-sm text-muted-foreground">Students Unallocated</div>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10">
                      <div className="text-2xl font-bold">{stats.avgCGPA}</div>
                      <div className="text-sm text-muted-foreground">Average CGPA</div>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10">
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Total Students</div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-border/50 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-accent/10 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left">Student Name</th>
                          <th className="px-4 py-3 text-left">CGPA</th>
                          <th className="px-4 py-3 text-left">Allocated Elective</th>
                          <th className="px-4 py-3 text-center">Preference Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        <AnimatePresence>
                          {allocationResults.map((result, idx) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-accent/5"
                            >
                              <td className="px-4 py-3 font-medium">{result.student_name}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {result.cgpa}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {result.allocated_elective === 'None (No seat available)' ? (
                                  <span className="text-muted-foreground italic">Not Allocated</span>
                                ) : (
                                  <span className="text-green-600 font-semibold">{result.allocated_elective}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {result.preference_rank ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                    {result.preference_rank}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Elective Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingElective(null);
        }}
        title={editingElective ? 'Edit Elective' : 'Create New Elective'}
      >
        <ElectiveForm
          initialData={editingElective}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingElective(null);
            loadElectives();
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingElective(null);
          }}
        />
      </FormModal>
    </DashboardLayout>
  );
}
