import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, X, AlertCircle, Loader } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { electiveService, Elective } from '@/services/electiveService';
import { toast } from 'sonner';

// 10 Available Subjects for drag and drop
const AVAILABLE_SUBJECTS = [
  { id: 1, subject_name: "Artificial Intelligence", description: "Learn AI fundamentals and applications", max_students: 50, department: "CS", semester: 4 },
  { id: 2, subject_name: "Statistics in Data Science", description: "Statistical methods for data analysis", max_students: 45, department: "CS", semester: 4 },
  { id: 3, subject_name: "Data Warehousing & Data Mining", description: "Store and extract insights from data", max_students: 50, department: "CS", semester: 4 },
  { id: 4, subject_name: "Distributed Systems", description: "Build scalable distributed applications", max_students: 40, department: "CS", semester: 4 },
  { id: 5, subject_name: "Network Security", description: "Secure networks and prevent cyber attacks", max_students: 35, department: "CS", semester: 4 },
  { id: 6, subject_name: "Big Data Analytics", description: "Analyze large-scale datasets", max_students: 40, department: "CS", semester: 4 },
  { id: 7, subject_name: "Cloud Computing", description: "Cloud infrastructure and services", max_students: 50, department: "CS", semester: 4 },
  { id: 8, subject_name: "Machine Learning", description: "Train models to learn from data", max_students: 45, department: "CS", semester: 4 },
  { id: 9, subject_name: "Mobile Computing", description: "Develop mobile applications", max_students: 50, department: "CS", semester: 4 },
  { id: 10, subject_name: "Computer Vision & Applications", description: "Image processing and computer vision", max_students: 40, department: "CS", semester: 4 }
];

export default function Electives() {
  const { user } = useAuth();
  
  const [displaySubjects, setDisplaySubjects] = useState<any[]>(AVAILABLE_SUBJECTS);
  const [selectedChoices, setSelectedChoices] = useState<(Elective | null)[]>(Array(5).fill(null));
  const [draggedItem, setDraggedItem] = useState<Elective | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [allocation, setAllocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_SUBJECTS = 5;

  // Load electives and user's choices on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use hardcoded subjects for display
        setDisplaySubjects(AVAILABLE_SUBJECTS as any);

        // Load user's existing choices if any
        try {
          const choices = await electiveService.getMyChoices();
          if (choices.length > 0) {
            setHasSubmitted(true);
            // Populate selected choices
            const newChoices = Array(5).fill(null);
            choices.forEach((choice, index) => {
              newChoices[index] = choice;
            });
            setSelectedChoices(newChoices);
          }
        } catch {
          // No choices submitted yet, that's okay
        }

        // Load allocation if available
        try {
          const allocationData = await electiveService.getMyAllocation();
          if (allocationData) {
            setAllocation(allocationData);
          }
        } catch {
          // No allocation yet, that's okay
        }
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to load electives';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.semester]);

  const handleDragStart = (subject: Elective) => {
    setDraggedItem(subject);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDropInChoice = (index: number) => {
    if (!draggedItem || hasSubmitted) return;

    // Check if already selected
    if (selectedChoices.some(choice => choice?.id === draggedItem.id)) {
      toast.error('This subject is already selected');
      return;
    }

    const newChoices = [...selectedChoices];
    newChoices[index] = draggedItem;
    setSelectedChoices(newChoices);
    setDraggedItem(null);
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = [...selectedChoices];
    newChoices[index] = null;
    setSelectedChoices(newChoices);
  };

  const handleSubmitChoices = async () => {
    const filledChoices = selectedChoices.filter(choice => choice !== null);
    
    if (filledChoices.length !== MAX_SUBJECTS) {
      toast.error(`Please select exactly ${MAX_SUBJECTS} subjects`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create choices array with subject_name and preference_rank
      const choices = filledChoices.map((choice, index) => ({
        subject_name: choice.subject_name,
        preference_rank: index + 1
      }));

      await electiveService.submitChoices(choices);
      
      setHasSubmitted(true);
      toast.success('Preferences submitted successfully!');
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to submit preferences';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCount = selectedChoices.filter(choice => choice !== null).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading electives...</p>
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
            <h1 className="text-3xl font-bold mb-2">Elective Choices</h1>
            <p className="text-muted-foreground">Drag and drop to select your 5 preferred subjects</p>
          </div>

          <Card className="glass border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Error Loading Electives</h3>
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Elective Choices</h1>
            <p className="text-muted-foreground">Drag and drop to select your 5 preferred subjects</p>
          </div>
        </motion.div>

        {/* Success Message */}
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass glow-primary border-primary/20 bg-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">Preferences Submitted!</h3>
                    <p className="text-sm text-muted-foreground">Your choices have been saved. Waiting for allocation results.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Allocation Result */}
        {allocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass glow-accent border-accent/20 bg-accent/10">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-accent">Your Allocated Elective</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Subject: </span>
                      <span className="font-semibold">{allocation.subject_name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Department: </span>
                      <span className="font-semibold">{allocation.department}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{allocation.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Available Subjects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Available Subjects ({displaySubjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displaySubjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No electives available for your semester</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {displaySubjects.map((subject) => {
                        const isSelected = selectedChoices.some(choice => choice?.id === subject.id);
                        return (
                          <motion.div
                            key={subject.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            draggable={!isSelected && !hasSubmitted}
                            onDragStart={() => !isSelected && !hasSubmitted && handleDragStart(subject)}
                            onDragEnd={handleDragEnd}
                            className={`${!isSelected && !hasSubmitted ? 'cursor-move' : 'cursor-not-allowed'} transition-all duration-200`}
                          >
                            <div className={`glass rounded-lg p-4 transition-all duration-200 ${
                              isSelected 
                                ? 'border border-border opacity-50' 
                                : 'border border-border hover:border-primary/50 glow-accent-hover'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm mb-1">{subject.subject_name}</h3>
                                  <p className="text-xs text-muted-foreground">{subject.description}</p>
                                  <p className="text-xs text-muted-foreground mt-2">Seats: {subject.max_students}</p>
                                </div>
                                {isSelected && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex-shrink-0 text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-md whitespace-nowrap"
                                  >
                                    ✓ Selected
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Preferences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>Your Preferences (Ranked)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {selectedChoices.map((choice, index) => (
                      <motion.div
                        key={index}
                        layout
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => !hasSubmitted && handleDropInChoice(index)}
                      >
                        <div className={`glass rounded-lg p-4 min-h-[80px] border transition-all duration-200 flex items-start gap-3 ${
                          choice
                            ? 'border-primary/50 glow-accent-hover'
                            : 'border-dashed border-border/50 hover:border-primary/50'
                        }`}>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-accent-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            {choice ? (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2 flex-1"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-sm">{choice.subject_name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{choice.description}</p>
                                  </div>
                                  {!hasSubmitted && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRemoveChoice(index)}
                                      className="flex-shrink-0 p-1 hover:bg-destructive/20 rounded-md transition-colors"
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            ) : (
                              <div className="text-muted-foreground text-sm">Drop a subject here</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-semibold text-primary">
                      {filledCount} / {MAX_SUBJECTS} subjects
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(filledCount / MAX_SUBJECTS) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={filledCount === MAX_SUBJECTS && !hasSubmitted ? { scale: 1.02 } : {}}
                  whileTap={filledCount === MAX_SUBJECTS && !hasSubmitted ? { scale: 0.98 } : {}}
                >
                  <Button
                    onClick={handleSubmitChoices}
                    disabled={filledCount !== MAX_SUBJECTS || hasSubmitted || isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : hasSubmitted ? (
                      'Preferences Submitted ✓'
                    ) : (
                      'Submit Preferences'
                    )}
                  </Button>
                </motion.div>

                {filledCount !== MAX_SUBJECTS && !hasSubmitted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground text-center"
                  >
                    Please select exactly {MAX_SUBJECTS} subjects to submit
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}