import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus, Trash2, Eye, Download, RefreshCw, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { FormModal } from '@/components/modals/FormModal';
import { TeacherForm } from '@/components/forms/TeacherForm';
import { SubjectForm } from '@/components/forms/SubjectForm';
import { RoomForm } from '@/components/forms/RoomForm';
import { GroupForm } from '@/components/forms/GroupForm';
import { AssignTeacherSubjectForm } from '@/components/forms/AssignTeacherSubjectForm';
import { AssignSubjectGroupForm } from '@/components/forms/AssignSubjectGroupForm';
import { timetableService, Teacher, Subject, Room, Group } from '@/services/timetableService';

interface TimetableSlot {
  id: string;
  day_of_week: string;
  period_number: number;
  teacher_id: string;
  subject_id: string;
  group_id: string;
  room_id: string;
  academic_year: string;
  semester_type: string;
}

export default function TimetableManagement() {
  const [isDraft, setIsDraft] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Data states for all resources
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  
  // Loading and filtering states
  const [isLoading, setIsLoading] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-25');
  const [selectedSemesterType, setSelectedSemesterType] = useState('odd');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [periodsPerDay, setPeriodsPerDay] = useState(7);
  const [lunchBreakPeriod, setLunchBreakPeriod] = useState(4);
  
  // Tab states for viewing data
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'subjects' | 'rooms' | 'groups' | 'assignments' | 'timetable'>('overview');

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, [departmentFilter]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const filters = departmentFilter ? { department: departmentFilter } : {};
      const [teachersData, subjectsData, roomsData, groupsData, configData] = await Promise.all([
        timetableService.getTeachers(departmentFilter),
        timetableService.getSubjects(filters),
        timetableService.getRooms(),
        timetableService.getGroups(filters),
        timetableService.getConfig(),
      ]);
      
      // Backend returns { success: true, data: { teachers: [...], count: X } }
      setTeachers(teachersData.data?.teachers || []);
      setSubjects(subjectsData.data?.subjects || []);
      setRooms(roomsData.data?.rooms || []);
      setGroups(groupsData.data?.groups || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load timetable data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (groups.length === 0) {
      toast.error('Please create at least one group before generating timetable');
      return;
    }

    const generationData = {
      groups: groups.map(g => g.id),
      days: selectedDays,
      periods_per_day: periodsPerDay,
      lunch_break_period: lunchBreakPeriod,
      academic_year: selectedAcademicYear,
      semester_type: selectedSemesterType,
      preferences: {
        respect_teacher_preferences: true
      }
    };
    
    try {
      setIsLoading(true);
      const result = await timetableService.generateTimetable(generationData);
      setTimetableSlots(result.data?.slots || []);
      setIsDraft(true);
      toast.success('Draft timetable generated!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate timetable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPublish = async () => {
    try {
      setIsLoading(true);
      setIsDraft(false);
      toast.success('Timetable published successfully!');
    } catch (error) {
      toast.error('Failed to publish timetable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setActiveModal(null);
    loadAllData();
    toast.success('Successfully saved!');
  };

  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        // Note: Delete endpoint may not be in API, this is for future use
        toast.info('Deletion not yet supported via API');
        loadAllData();
      } catch (error) {
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        toast.info('Deletion not yet supported via API');
        loadAllData();
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        toast.info('Deletion not yet supported via API');
        loadAllData();
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        toast.info('Deletion not yet supported via API');
        loadAllData();
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Timetable Generation Hub</h1>
            <p className="text-muted-foreground">Manage teachers, subjects, rooms, groups & generate timetables</p>
          </div>
          <Button
            onClick={loadAllData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isDraft && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass border-2 border-accent/50 p-6 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-lg text-accent">DRAFT MODE</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Review the generated timetable below. Click "Confirm & Publish" to make it live.
            </p>
            <Button
              onClick={handleConfirmPublish}
              className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
            >
              Confirm & Publish
            </Button>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex overflow-x-auto gap-2">
              {(['overview', 'teachers', 'subjects', 'rooms', 'groups', 'assignments', 'timetable'] as const).map(tab => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  className="capitalize whitespace-nowrap"
                >
                  {tab === 'timetable' ? 'Generated Timetable' : tab === 'assignments' ? 'Assign' : tab}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <Card className="glass">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
                  <p className="text-muted-foreground">Manage timetable entities before generating</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveModal('teacher')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Teacher</span>
                  </Button>

                  <Button
                    onClick={() => setActiveModal('subject')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Subject</span>
                  </Button>

                  <Button
                    onClick={() => setActiveModal('room')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Room</span>
                  </Button>

                  <Button
                    onClick={() => setActiveModal('group')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-2 glow-accent-hover"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Group</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Timetable Configuration</h3>
                    <p className="text-muted-foreground text-sm">Set up generation parameters</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Periods per Day</label>
                      <input 
                        type="number" 
                        value={periodsPerDay}
                        onChange={(e) => setPeriodsPerDay(parseInt(e.target.value))}
                        className="w-full p-2 rounded-lg bg-card border border-border"
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lunch Break Period</label>
                      <input 
                        type="number" 
                        value={lunchBreakPeriod}
                        onChange={(e) => setLunchBreakPeriod(parseInt(e.target.value))}
                        className="w-full p-2 rounded-lg bg-card border border-border"
                        min="1"
                        max={periodsPerDay}
                      />
                    </div>
                    <Button
                      className="w-full bg-accent text-accent-foreground glow-accent-hover"
                    >
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Generation Settings</h3>
                    <p className="text-muted-foreground text-sm">Configure semester and year</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Academic Year</label>
                      <input 
                        type="text" 
                        value={selectedAcademicYear}
                        onChange={(e) => setSelectedAcademicYear(e.target.value)}
                        className="w-full p-2 rounded-lg bg-card border border-border"
                        placeholder="e.g., 2024-25"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Semester Type</label>
                      <select 
                        value={selectedSemesterType}
                        onChange={(e) => setSelectedSemesterType(e.target.value)}
                        className="w-full p-2 rounded-lg bg-card border border-border"
                      >
                        <option value="odd">Odd Semester</option>
                        <option value="even">Even Semester</option>
                      </select>
                    </div>
                    {!isDraft && (
                      <Button
                        onClick={handleGenerateDraft}
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground font-semibold glow-primary-hover w-full"
                      >
                        {isLoading ? 'Generating...' : 'Generate Draft Timetable'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <Card className="glass">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Timetable Statistics</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <motion.div 
                    className="p-4 rounded-lg bg-accent/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-accent">{teachers.length}</div>
                    <div className="text-sm text-muted-foreground">Teachers</div>
                  </motion.div>
                  <motion.div 
                    className="p-4 rounded-lg bg-accent/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-accent">{subjects.length}</div>
                    <div className="text-sm text-muted-foreground">Subjects</div>
                  </motion.div>
                  <motion.div 
                    className="p-4 rounded-lg bg-accent/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-accent">{rooms.length}</div>
                    <div className="text-sm text-muted-foreground">Rooms</div>
                  </motion.div>
                  <motion.div 
                    className="p-4 rounded-lg bg-accent/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-accent">{groups.length}</div>
                    <div className="text-sm text-muted-foreground">Groups</div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* TEACHERS TAB */}
        {activeTab === 'teachers' && (
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Teachers ({teachers.length})</h3>
                  <p className="text-sm text-muted-foreground">All registered teachers</p>
                </div>
                <Button
                  onClick={() => setActiveModal('teacher')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Teacher
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Department</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <motion.tr 
                        key={teacher.id}
                        className="border-b border-border/50 hover:bg-accent/5"
                        whileHover={{ backgroundColor: 'rgba(var(--accent), 0.05)' }}
                      >
                        <td className="p-2 font-mono text-xs">{teacher.teacher_code}</td>
                        <td className="p-2">{teacher.full_name}</td>
                        <td className="p-2">{teacher.department}</td>
                        <td className="p-2 text-xs">{teacher.email}</td>
                        <td className="p-2">{teacher.phone}</td>
                        <td className="p-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${teacher.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {teacher.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {teachers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No teachers added yet. Click "Add Teacher" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === 'subjects' && (
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Subjects ({subjects.length})</h3>
                  <p className="text-sm text-muted-foreground">All registered subjects</p>
                </div>
                <Button
                  onClick={() => setActiveModal('subject')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Hours/Week</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Department</th>
                      <th className="text-left p-2">Semester</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <motion.tr 
                        key={subject.id}
                        className="border-b border-border/50 hover:bg-accent/5"
                        whileHover={{ backgroundColor: 'rgba(var(--accent), 0.05)' }}
                      >
                        <td className="p-2 font-mono text-xs">{subject.subject_code}</td>
                        <td className="p-2">{subject.subject_name}</td>
                        <td className="p-2">{subject.hours_per_week}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-semibold">
                            {subject.course_type}
                          </span>
                        </td>
                        <td className="p-2">{subject.department}</td>
                        <td className="p-2 text-center">{subject.semester}</td>
                        <td className="p-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {subjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No subjects added yet. Click "Add Subject" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ROOMS TAB */}
        {activeTab === 'rooms' && (
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Rooms ({rooms.length})</h3>
                  <p className="text-sm text-muted-foreground">All available rooms</p>
                </div>
                <Button
                  onClick={() => setActiveModal('room')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Capacity</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Building</th>
                      <th className="text-left p-2">Floor</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <motion.tr 
                        key={room.id}
                        className="border-b border-border/50 hover:bg-accent/5"
                        whileHover={{ backgroundColor: 'rgba(var(--accent), 0.05)' }}
                      >
                        <td className="p-2 font-mono text-xs">{room.room_code}</td>
                        <td className="p-2">{room.room_name}</td>
                        <td className="p-2 text-center">{room.capacity}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded text-xs font-semibold">
                            {room.room_type}
                          </span>
                        </td>
                        <td className="p-2">{room.building}</td>
                        <td className="p-2">{room.floor_number || '-'}</td>
                        <td className="p-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rooms.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No rooms added yet. Click "Add Room" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Student Groups ({groups.length})</h3>
                  <p className="text-sm text-muted-foreground">All student groups/classes</p>
                </div>
                <Button
                  onClick={() => setActiveModal('group')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Strength</th>
                      <th className="text-left p-2">Department</th>
                      <th className="text-left p-2">Semester</th>
                      <th className="text-left p-2">Academic Year</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(group => (
                      <motion.tr 
                        key={group.id}
                        className="border-b border-border/50 hover:bg-accent/5"
                        whileHover={{ backgroundColor: 'rgba(var(--accent), 0.05)' }}
                      >
                        <td className="p-2 font-mono text-xs">{group.group_code}</td>
                        <td className="p-2">{group.group_name}</td>
                        <td className="p-2 text-center">{group.strength}</td>
                        <td className="p-2">{group.department}</td>
                        <td className="p-2 text-center">{group.semester}</td>
                        <td className="p-2">{group.academic_year}</td>
                        <td className="p-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {groups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No groups added yet. Click "Add Group" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Assign Teacher to Subject */}
              <Card className="glass">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Link2 className="h-5 w-5 text-accent mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Assign Teachers to Subjects</h3>
                      <p className="text-sm text-muted-foreground">Link teachers with subjects they teach</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-6">
                    {teachers.length === 0 || subjects.length === 0 ? (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-600">
                        ⚠️ You need at least one teacher and one subject to create assignments.
                      </div>
                    ) : (
                      <AssignTeacherSubjectForm
                        teachers={teachers}
                        subjects={subjects}
                        onSuccess={() => {
                          toast.success('Assignment created!');
                          loadAllData();
                        }}
                        onCancel={() => {}}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assign Subject to Group */}
              <Card className="glass">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Link2 className="h-5 w-5 text-accent mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Assign Subjects to Groups</h3>
                      <p className="text-sm text-muted-foreground">Link subjects with student groups</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-6">
                    {subjects.length === 0 || groups.length === 0 ? (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-600">
                        ⚠️ You need at least one subject and one group to create assignments.
                      </div>
                    ) : (
                      <AssignSubjectGroupForm
                        subjects={subjects}
                        groups={groups}
                        onSuccess={() => {
                          toast.success('Assignment created!');
                          loadAllData();
                        }}
                        onCancel={() => {}}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignment Workflow Info */}
            <Card className="glass border-2 border-accent/50">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">📋 Assignment Workflow</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-semibold">Create Teachers</p>
                      <p className="text-muted-foreground">Go to Teachers tab and add teachers</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-semibold">Create Subjects</p>
                      <p className="text-muted-foreground">Go to Subjects tab and add subjects</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-semibold">Create Groups</p>
                      <p className="text-muted-foreground">Go to Groups tab and add student groups/classes</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-semibold">Assign Teachers to Subjects</p>
                      <p className="text-muted-foreground">Use the form above to link teachers with subjects</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</div>
                    <div>
                      <p className="font-semibold">Assign Subjects to Groups</p>
                      <p className="text-muted-foreground">Use the form above to link subjects with groups</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">6</div>
                    <div>
                      <p className="font-semibold">Generate Timetable</p>
                      <p className="text-muted-foreground">Go to Overview tab and click "Generate Draft Timetable"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* TIMETABLE TAB */}
        {activeTab === 'timetable' && (
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Generated Timetable</h3>
                  <p className="text-sm text-muted-foreground">Total slots: {timetableSlots.length}</p>
                </div>
                {timetableSlots.length > 0 && (
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Export as PDF
                  </Button>
                )}
              </div>
              
              {timetableSlots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left p-2">Day</th>
                        <th className="text-left p-2">Period</th>
                        <th className="text-left p-2">Teacher</th>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Group</th>
                        <th className="text-left p-2">Room</th>
                        <th className="text-left p-2">Year/Sem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetableSlots.map(slot => (
                        <motion.tr 
                          key={slot.id}
                          className="border-b border-border/50 hover:bg-accent/5"
                          whileHover={{ backgroundColor: 'rgba(var(--accent), 0.05)' }}
                        >
                          <td className="p-2 font-semibold">{slot.day_of_week}</td>
                          <td className="p-2">Period {slot.period_number}</td>
                          <td className="p-2 text-xs font-mono">{slot.teacher_id.slice(0, 8)}...</td>
                          <td className="p-2 text-xs font-mono">{slot.subject_id.slice(0, 8)}...</td>
                          <td className="p-2 text-xs font-mono">{slot.group_id.slice(0, 8)}...</td>
                          <td className="p-2 text-xs font-mono">{slot.room_id.slice(0, 8)}...</td>
                          <td className="p-2">{slot.academic_year}/{slot.semester_type}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No timetable generated yet.</p>
                  <p className="text-sm mt-2">Go to the Overview tab and click "Generate Draft Timetable"</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <FormModal
          isOpen={activeModal === 'teacher'}
          onClose={() => setActiveModal(null)}
          title="Add Teacher"
        >
          <TeacherForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>

        <FormModal
          isOpen={activeModal === 'subject'}
          onClose={() => setActiveModal(null)}
          title="Add Subject"
        >
          <SubjectForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>

        <FormModal
          isOpen={activeModal === 'room'}
          onClose={() => setActiveModal(null)}
          title="Add Room"
        >
          <RoomForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>

        <FormModal
          isOpen={activeModal === 'group'}
          onClose={() => setActiveModal(null)}
          title="Add Group"
        >
          <GroupForm
            onSuccess={handleModalSuccess}
            onCancel={() => setActiveModal(null)}
          />
        </FormModal>
  
      </motion.div>
    </DashboardLayout>
  );
}
