const { Teacher, Subject, Room, StudentGroup, TimetableSlot } = require('../models');
const { logger } = require('../../config/db');

class TimetableSolver {
  constructor(constraints) {
    this.constraints = constraints;
    this.timetable = {};
    this.subjectHourCounters = {};
    this.teacherSchedule = {};
    this.roomSchedule = {};
    this.groupSchedule = {};
    this.solutionFound = false;
    this.maxIterations = 100000;
    this.currentIteration = 0;
  }

  /**
   * Main function to generate timetable
   */
  async generateTimetable() {
    try {
      logger.info('🔄 Starting timetable generation...');
      
      // Initialize data structures
      await this.initializeDataStructures();
      
      // Validate constraints
      const validation = await this.validateConstraints();
      if (!validation.valid) {
        return {
          success: false,
          error: 'Constraint validation failed',
          details: validation.errors
        };
      }

      // Generate all possible time slots
      const timeSlots = this.generateTimeSlots();
      
      // Start backtracking
      const result = await this.solve(timeSlots, 0);
      
      if (result) {
        logger.info('✅ Timetable generation successful');
        return {
          success: true,
          timetable: this.formatTimetable(),
          statistics: this.getStatistics()
        };
      } else {
        logger.warn('❌ No valid timetable found');
        return {
          success: false,
          error: 'No valid solution found',
          message: 'Unable to generate a timetable that satisfies all constraints'
        };
      }
    } catch (error) {
      logger.error('Timetable generation failed:', error);
      return {
        success: false,
        error: 'Internal error during generation',
        message: error.message
      };
    }
  }

  /**
   * Initialize all data structures for backtracking
   */
  async initializeDataStructures() {
    const { groups, days, periods_per_day } = this.constraints;

    // Initialize timetable structure
    days.forEach(day => {
      this.timetable[day] = {};
      this.teacherSchedule[day] = {};
      this.roomSchedule[day] = {};
      this.groupSchedule[day] = {};
      
      for (let period = 1; period <= periods_per_day; period++) {
        this.timetable[day][period] = [];
        this.teacherSchedule[day][period] = new Set();
        this.roomSchedule[day][period] = new Set();
        this.groupSchedule[day][period] = new Set();
      }
    });

    // Initialize subject hour counters
    for (const groupId of groups) {
      const subjects = await StudentGroup.getGroupSubjects(groupId);
      
      for (const subject of subjects) {
        const key = `${groupId}_${subject.id}`;
        this.subjectHourCounters[key] = {
          required: subject.hours_per_week,
          scheduled: 0,
          subject: subject,
          groupId: groupId
        };
      }
    }

    logger.info(`Initialized data structures for ${groups.length} groups`);
  }

  /**
   * Validate all constraints before starting generation
   */
  async validateConstraints() {
    const errors = [];
    const { groups, days, periods_per_day, lunch_break_period } = this.constraints;

    // Validate groups exist
    for (const groupId of groups) {
      const group = await StudentGroup.findById(groupId);
      if (!group) {
        errors.push(`Student group with ID ${groupId} not found`);
      }
    }

    // Validate lunch break period
    if (lunch_break_period && (lunch_break_period < 1 || lunch_break_period > periods_per_day)) {
      errors.push(`Invalid lunch break period: ${lunch_break_period}`);
    }

    // Check if total required hours can fit in available slots
    let totalRequiredHours = 0;
    for (const groupId of groups) {
      const subjects = await StudentGroup.getGroupSubjects(groupId);
      totalRequiredHours += subjects.reduce((sum, subject) => sum + subject.hours_per_week, 0);
    }

    const availableSlots = days.length * periods_per_day - (lunch_break_period ? days.length : 0);
    if (totalRequiredHours > availableSlots * groups.length) {
      errors.push(`Insufficient time slots: Required ${totalRequiredHours}, Available ${availableSlots * groups.length}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Generate all possible time slots
   */
  generateTimeSlots() {
    const slots = [];
    const { days, periods_per_day, lunch_break_period } = this.constraints;

    days.forEach(day => {
      for (let period = 1; period <= periods_per_day; period++) {
        // Skip lunch break period
        if (lunch_break_period && period === lunch_break_period) {
          continue;
        }
        
        slots.push({ day, period });
      }
    });

    return slots;
  }

  /**
   * Main backtracking solver
   */
  async solve(timeSlots, slotIndex) {
    this.currentIteration++;
    
    // Prevent infinite loops
    if (this.currentIteration > this.maxIterations) {
      logger.warn('Maximum iterations reached');
      return false;
    }

    // Base case: all time slots processed
    if (slotIndex >= timeSlots.length) {
      return this.areAllSubjectsScheduled();
    }

    const currentSlot = timeSlots[slotIndex];
    const { day, period } = currentSlot;

    // Try to schedule each unfinished subject in current slot
    for (const [key, counter] of Object.entries(this.subjectHourCounters)) {
      if (counter.scheduled >= counter.required) {
        continue; // Subject already fully scheduled
      }

      const { subject, groupId } = counter;
      
      // Find available teachers for this subject
      const availableTeachers = await this.getAvailableTeachers(subject.id, day, period);
      
      for (const teacher of availableTeachers) {
        // Find suitable rooms
        const group = await StudentGroup.findById(groupId);
        const availableRooms = await this.getAvailableRooms(subject, group, day, period);
        
        for (const room of availableRooms) {
          // Check if this assignment is valid
          if (await this.isValidAssignment(teacher, subject, group, room, day, period)) {
            // Make assignment
            this.makeAssignment(teacher, subject, group, room, day, period);
            counter.scheduled++;

            // Recursively solve next slot
            if (await this.solve(timeSlots, slotIndex + 1)) {
              return true;
            }

            // Backtrack
            this.undoAssignment(teacher, subject, group, room, day, period);
            counter.scheduled--;
          }
        }
      }
    }

    // No valid assignment found for this slot, try next slot
    return await this.solve(timeSlots, slotIndex + 1);
  }

  /**
   * Get available teachers for a subject at given time
   */
  async getAvailableTeachers(subjectId, day, period) {
    const teachers = await Subject.getSubjectTeachers(subjectId);
    const available = [];

    for (const teacher of teachers) {
      // Check if teacher is not already scheduled
      if (!this.teacherSchedule[day][period].has(teacher.id)) {
        // Check teacher unavailability
        const unavailability = await Teacher.getUnavailability(teacher.id);
        const isUnavailable = unavailability.some(u => 
          u.day_of_week === day && u.period_number === period
        );

        if (!isUnavailable) {
          available.push(teacher);
        }
      }
    }

    // Sort by priority (lower number = higher priority)
    return available.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get available rooms for a subject and group at given time
   */
  async getAvailableRooms(subject, group, day, period) {
    const suitableRooms = await Room.findSuitableRooms(subject.course_type, group.strength);
    const available = [];

    for (const room of suitableRooms) {
      // Check if room is not already scheduled
      if (!this.roomSchedule[day][period].has(room.id)) {
        available.push(room);
      }
    }

    return available;
  }

  /**
   * Check if assignment is valid (hard constraints)
   */
  async isValidAssignment(teacher, subject, group, room, day, period) {
    // Hard constraint 1: No teacher conflicts (already checked in getAvailableTeachers)
    if (this.teacherSchedule[day][period].has(teacher.id)) {
      return false;
    }

    // Hard constraint 2: No group conflicts
    if (this.groupSchedule[day][period].has(group.id)) {
      return false;
    }

    // Hard constraint 3: No room conflicts (already checked in getAvailableRooms)
    if (this.roomSchedule[day][period].has(room.id)) {
      return false;
    }

    // Hard constraint 4: Room capacity check
    if (room.capacity < group.strength) {
      return false;
    }

    // Hard constraint 5: Room type compatibility
    if (subject.course_type === 'Lab' && room.room_type !== 'Lab') {
      return false;
    }

    // Soft constraint checks (can be made more flexible)
    if (this.constraints.preferences?.respect_teacher_preferences) {
      // Check teacher availability preferences
      const unavailability = await Teacher.getUnavailability(teacher.id);
      const hasPreference = unavailability.some(u => 
        u.day_of_week === day && u.period_number === period && !u.is_permanent
      );
      
      // For now, we respect preferences as hard constraints
      if (hasPreference) {
        return false;
      }
    }

    return true;
  }

  /**
   * Make assignment in the timetable
   */
  makeAssignment(teacher, subject, group, room, day, period) {
    const assignment = {
      teacher: teacher,
      subject: subject,
      group: group,
      room: room,
      day: day,
      period: period
    };

    this.timetable[day][period].push(assignment);
    this.teacherSchedule[day][period].add(teacher.id);
    this.groupSchedule[day][period].add(group.id);
    this.roomSchedule[day][period].add(room.id);
  }

  /**
   * Undo assignment (backtrack)
   */
  undoAssignment(teacher, subject, group, room, day, period) {
    // Remove from timetable
    this.timetable[day][period] = this.timetable[day][period].filter(
      assignment => !(
        assignment.teacher.id === teacher.id &&
        assignment.subject.id === subject.id &&
        assignment.group.id === group.id &&
        assignment.room.id === room.id
      )
    );

    this.teacherSchedule[day][period].delete(teacher.id);
    this.groupSchedule[day][period].delete(group.id);
    this.roomSchedule[day][period].delete(room.id);
  }

  /**
   * Check if all subjects are fully scheduled
   */
  areAllSubjectsScheduled() {
    for (const [key, counter] of Object.entries(this.subjectHourCounters)) {
      if (counter.scheduled < counter.required) {
        return false;
      }
    }
    return true;
  }

  /**
   * Format timetable for output
   */
  formatTimetable() {
    const formattedTimetable = [];

    for (const [day, periods] of Object.entries(this.timetable)) {
      for (const [period, assignments] of Object.entries(periods)) {
        for (const assignment of assignments) {
          formattedTimetable.push({
            day: day,
            period: parseInt(period),
            teacher: {
              id: assignment.teacher.id,
              code: assignment.teacher.teacher_code,
              name: assignment.teacher.full_name
            },
            subject: {
              id: assignment.subject.id,
              code: assignment.subject.subject_code,
              name: assignment.subject.subject_name,
              type: assignment.subject.course_type
            },
            group: {
              id: assignment.group.id,
              code: assignment.group.group_code,
              name: assignment.group.group_name
            },
            room: {
              id: assignment.room.id,
              code: assignment.room.room_code,
              name: assignment.room.room_name,
              type: assignment.room.room_type
            }
          });
        }
      }
    }

    return formattedTimetable.sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCompare = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayCompare !== 0) return dayCompare;
      
      const periodCompare = a.period - b.period;
      if (periodCompare !== 0) return periodCompare;
      
      return a.group.code.localeCompare(b.group.code);
    });
  }

  /**
   * Get generation statistics
   */
  getStatistics() {
    const totalSlots = Object.values(this.timetable).reduce((total, periods) => {
      return total + Object.values(periods).reduce((dayTotal, assignments) => {
        return dayTotal + assignments.length;
      }, 0);
    }, 0);

    return {
      totalSlots: totalSlots,
      iterations: this.currentIteration,
      subjectsScheduled: Object.values(this.subjectHourCounters).filter(c => c.scheduled >= c.required).length,
      totalSubjects: Object.keys(this.subjectHourCounters).length
    };
  }
}

/**
 * Main service function
 */
const generateTimetable = async (constraints) => {
  const solver = new TimetableSolver(constraints);
  return await solver.generateTimetable();
};

/**
 * Save generated timetable to database
 */
const saveTimetableToDatabase = async (timetable, academic_year, semester_type) => {
  try {
    // Clear existing timetable
    await TimetableSlot.clearTimetable(academic_year, semester_type);

    // Save new timetable
    for (const slot of timetable) {
      await TimetableSlot.create({
        day_of_week: slot.day,
        period_number: slot.period,
        teacher_id: slot.teacher.id,
        subject_id: slot.subject.id,
        group_id: slot.group.id,
        room_id: slot.room.id,
        academic_year: academic_year,
        semester_type: semester_type
      });
    }

    logger.info(`✅ Timetable saved to database: ${timetable.length} slots`);
    return true;
  } catch (error) {
    logger.error('Error saving timetable to database:', error);
    throw error;
  }
};

module.exports = {
  generateTimetable,
  saveTimetableToDatabase,
  TimetableSolver
};