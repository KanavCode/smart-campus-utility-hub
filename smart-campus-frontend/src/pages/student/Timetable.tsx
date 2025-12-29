import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Loader2, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { timetableService } from '@/services/timetableService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface TimetableSlot {
  id: string;
  day_of_week: string;
  period_number: number;
  subject: {
    subject_code: string;
    subject_name: string;
    course_type: string;
  };
  teacher: {
    teacher_code: string;
    full_name: string;
  };
  room: {
    room_code: string;
    room_name: string;
  };
  academic_year: string;
  semester_type: string;
}

interface TimetableGrid {
  [day: string]: {
    [period: number]: TimetableSlot | null;
  };
}

interface Group {
  id: string;
  group_code: string;
  group_name: string;
  department: string;
  semester: number;
  academic_year: string;
}

export default function StudentTimetable() {
  const [timetableData, setTimetableData] = useState<TimetableGrid>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024-25');
  const [selectedSemesterType, setSelectedSemesterType] = useState<string>('odd');

  // Fetch available groups on component mount
  useEffect(() => {
    fetchAvailableGroups();
  }, []);

  // Fetch timetable when group, year, or semester changes
  useEffect(() => {
    if (selectedGroup) {
      fetchTimetable();
    }
  }, [selectedGroup, selectedAcademicYear, selectedSemesterType]);

  const fetchAvailableGroups = async (): Promise<void> => {
    try {
      const response = await timetableService.getGroups();
      
      if (response.success && response.data?.groups) {
        setAvailableGroups(response.data.groups);
        // Auto-select first group if available
        if (response.data.groups.length > 0) {
          setSelectedGroup(response.data.groups[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      toast.error('Failed to load student groups');
    }
  };

  const fetchTimetable = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const response = await timetableService.getGroupTimetable(
        selectedGroup,
        selectedAcademicYear,
        selectedSemesterType
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to load timetable');
      }

      const slots: TimetableSlot[] = response.data?.slots || [];

      // Create grid structure
      const grid: TimetableGrid = {};
      DAYS.forEach(day => {
        grid[day] = {};
        PERIODS.forEach(period => {
          grid[day][period] = null;
        });
      });

      // Fill grid with slots
      slots.forEach((slot: TimetableSlot) => {
        if (grid[slot.day_of_week]) {
          grid[slot.day_of_week][slot.period_number] = slot;
        }
      });

      setTimetableData(grid);
      toast.success('Timetable loaded successfully');
    } catch (err: any) {
      const errorMsg = err.message || 'Something went wrong';
      setError(errorMsg);
      toast.error(errorMsg);
      setTimetableData({});
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (): void => {
    if (selectedGroup) {
      fetchTimetable();
    } else {
      toast.error('Please select a group first');
    }
  };

  const getCellContent = (slot: TimetableSlot | null): JSX.Element => {
    if (!slot) {
      return (
        <div className="text-xs text-muted-foreground/50 text-center">-</div>
      );
    }

    const isLab = slot.subject.course_type === 'Lab' || slot.subject.course_type === 'Practical';

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {isLab && <Beaker className="h-3 w-3 text-accent flex-shrink-0" />}
          <div className="font-semibold text-xs line-clamp-1" title={slot.subject.subject_name}>
            {slot.subject.subject_code}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground line-clamp-1" title={slot.teacher.full_name}>
          {slot.teacher.full_name}
        </div>
        <div className="text-[10px] text-accent line-clamp-1" title={slot.room.room_name}>
          {slot.room.room_code}
        </div>
      </div>
    );
  };

  const getSelectedGroupInfo = (): Group | undefined => {
    return availableGroups.find(g => g.id === selectedGroup);
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-accent" />
              My Timetable
            </h1>
            <p className="text-muted-foreground">Your weekly class schedule</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Group Selector */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading || availableGroups.length === 0}
            >
              <option value="">Select Group</option>
              {availableGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.group_code} - {group.group_name}
                </option>
              ))}
            </select>

            {/* Academic Year Selector */}
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2025-26">2025-26</option>
            </select>

            {/* Semester Type Selector */}
            <select
              value={selectedSemesterType}
              onChange={(e) => setSelectedSemesterType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            >
              <option value="odd">Odd Semester</option>
              <option value="even">Even Semester</option>
            </select>

            <Button
              onClick={handleRefresh}
              disabled={loading || !selectedGroup}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="glass p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin h-12 w-12 text-accent" />
              <p className="text-muted-foreground">Loading timetable...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="glass border-red-500/50 p-6">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="h-6 w-6" />
              <div>
                <p className="font-semibold">Failed to load timetable</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && Object.keys(timetableData).length === 0 && (
          <Card className="glass p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
              <div>
                <p className="font-semibold text-lg">No Timetable Available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedGroup 
                    ? 'No timetable has been generated for this group yet.' 
                    : 'Please select a group to view the timetable.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Timetable Grid */}
        {!loading && !error && Object.keys(timetableData).length > 0 && (
          <Card className="glass overflow-hidden">
            <div className="p-6">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Header Row */}
                  <div className="grid grid-cols-9 gap-2 mb-3 pb-3 border-b border-border">
                    <div className="font-bold text-sm text-center p-3 bg-accent/10 rounded-lg">
                      Day / Period
                    </div>
                    {PERIODS.map((period) => (
                      <div 
                        key={period} 
                        className="font-bold text-sm text-center p-3 bg-accent/10 rounded-lg"
                      >
                        Period {period}
                      </div>
                    ))}
                  </div>

                  {/* Day Rows */}
                  {DAYS.map((day, dayIndex) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dayIndex * 0.05 }}
                      className="grid grid-cols-9 gap-2 mb-2"
                    >
                      <div className="font-semibold text-sm flex items-center justify-center p-3 bg-primary/10 rounded-lg">
                        {day}
                      </div>

                      {PERIODS.map((period) => {
                        const slot = timetableData[day]?.[period];
                        const isLunchBreak = period === 4; // Assuming period 4 is lunch
                        
                        return (
                          <motion.div
                            key={`${day}-${period}`}
                            whileHover={{ scale: slot ? 1.03 : 1 }}
                            className={`
                              glass p-3 min-h-[90px] rounded-lg border
                              ${slot ? 'border-accent/30 hover:border-accent/60 cursor-pointer' : 'border-border/30'}
                              ${isLunchBreak && !slot ? 'bg-orange-500/5' : ''}
                              transition-all duration-200
                            `}
                          >
                            {isLunchBreak && !slot ? (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-xs font-semibold text-orange-500">
                                  🍽️ Lunch Break
                                </span>
                              </div>
                            ) : (
                              getCellContent(slot)
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="border-t border-border p-4 bg-card/50">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Beaker className="h-3 w-3 text-accent" />
                  <span>Lab/Practical Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-orange-500/20" />
                  <span>Lunch Break</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-border/30" />
                  <span>Free Period</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Info Card */}
        {selectedGroup && availableGroups.length > 0 && (
          <Card className="glass border-accent/30">
            <div className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-accent mb-1">Viewing Timetable For:</p>
                <p className="text-muted-foreground">
                  {getSelectedGroupInfo()?.group_name || 'Unknown Group'} 
                  {' • '}
                  {getSelectedGroupInfo()?.department || 'N/A'}
                  {' • '}
                  Semester {getSelectedGroupInfo()?.semester || 'N/A'}
                  {' • '}
                  AY {selectedAcademicYear} ({selectedSemesterType})
                </p>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}