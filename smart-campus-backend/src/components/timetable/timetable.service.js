const { Teacher, Subject, Room, StudentGroup, TimetableSlot } = require('./timetable.models');
const { logger } = require('../../config/db');

/**
 * Timetable Solver using Backtracking Algorithm
 
 * Key Features:
 * - Backtracking algorithm with pruning
 * - Hard constraint satisfaction (no conflicts)
 * - Soft constraint consideration (preferences)
 * - Optimized performance with early termination
 */
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
   * @returns {Object} Generation result with success status and timetable data
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
          message: 'Unable to generate a timetable that satisfies all constraints. Try adjusting constraints or adding more resources.'
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
   * Sets up empty timetable slots and subject hour counters
   */
  async initializeDataStructures() {
    const { groups, days, periods_per_day } = this.constraints;

    // Initialize timetable structure for each day and period
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

    // Initialize subject hour counters for each group
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
   * Checks if the problem is solvable with given resources
   * 
   * @returns {Object} Validation result with status and errors
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
      const groupHours = subjects.reduce((sum, subject) => sum + subject.hours_per_week, 0);
      totalRequiredHours += groupHours;
      
      // Check if single group's hours fit in a week
      const availableSlotsPerGroup = days.length * periods_per_day - (lunch_break_period ? days.length : 0);
      if (groupHours > availableSlotsPerGroup) {
        errors.push(`Group ${groupId} requires ${groupHours} hours but only ${availableSlotsPerGroup} slots available`);
      }
    }

    // Check teacher assignments
    for (const groupId of groups) {
      const subjects = await StudentGroup.getGroupSubjects(groupId);
      for (const subject of subjects) {
        const teachers = await Subject.getSubjectTeachers(subject.id);
        if (teachers.length === 0) {
          errors.push(`No teacher assigned to subject: ${subject.subject_name} (${subject.subject_code})`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Generate all possible time slots
   * Excludes lunch break and other blocked periods
   * 
   * @returns {Array} Array of time slot objects with day and period
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
   * Recursively assigns subjects to time slots while satisfying constraints
   * 
   * @param {Array} timeSlots - All available time slots
   * @param {Number} slotIndex - Current slot index being processed
   * @returns {Boolean} True if solution found, false otherwise
   */
  async solve(timeSlots, slotIndex) {
    this.currentIteration++;
    
    // Prevent infinite loops
    if (this.currentIteration > this.maxIterations) {
      logger.warn('Maximum iterations reached');
      return false;
    }

    // Log progress every 1000 iterations
    if (this.currentIteration % 1000 === 0) {
      logger.info(`Iteration ${this.currentIteration}: Processing slot ${slotIndex}/${timeSlots.length}`);
    }

    // Base case: all subjects scheduled
    if (this.areAllSubjectsScheduled()) {
      return true;
    }

    // Base case: all time slots processed but not all subjects scheduled
    if (slotIndex >= timeSlots.length) {
      return false;
    }

    const currentSlot = timeSlots[slotIndex];
    const { day, period } = currentSlot;

    // Try to schedule each unfinished subject in current slot
    for (const [key, counter] of Object.entries(this.subjectHourCounters)) {
      if (counter.scheduled >= counter.required) {
        continue; // Subject already fully scheduled
      }

      const { subject, groupId } = counter;
      
      // Check if group is already scheduled in this slot
      if (this.groupSchedule[day][period].has(groupId)) {
        continue;
      }
      
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

    // No valid assignment found for this slot, try next slot (skip empty slots)
    return await this.solve(timeSlots, slotIndex + 1);
  }

  /**
   * Get available teachers for a subject at given time
   * Considers teacher assignments and unavailability
   * 
   * @param {String} subjectId - Subject UUID
   * @param {String} day - Day of week
   * @param {Number} period - Period number
   * @returns {Array} Available teachers sorted by priority
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
    return available.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }

  /**
   * Get available rooms for a subject and group at given time
   * Filters by room type and capacity
   * 
   * @param {Object} subject - Subject object
   * @param {Object} group - Student group object
   * @param {String} day - Day of week
   * @param {Number} period - Period number
   * @returns {Array} Available rooms
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
   * Ensures no conflicts and all requirements are met
   * 
   * @returns {Boolean} True if assignment is valid
   */
  async isValidAssignment(teacher, subject, group, room, day, period) {
    // Hard constraint 1: No teacher conflicts
    if (this.teacherSchedule[day][period].has(teacher.id)) {
      return false;
    }

    // Hard constraint 2: No group conflicts
    if (this.groupSchedule[day][period].has(group.id)) {
      return false;
    }

    // Hard constraint 3: No room conflicts
    if (this.roomSchedule[day][period].has(room.id)) {
      return false;
    }

    // Hard constraint 4: Room capacity check
    if (room.capacity < group.strength) {
      return false;
    }

    // Hard constraint 5: Room type compatibility
    if ((subject.course_type === 'Lab' || subject.course_type === 'Practical') && room.room_type !== 'Lab') {
      return false;
    }

    // Check max periods per day for this subject-group combination
    if (subject.max_periods_per_day) {
      const periodsToday = this.countSubjectPeriodsForDay(subject.id, group.id, day);
      if (periodsToday >= subject.max_periods_per_day) {
        return false;
      }
    }

    return true;
  }

  /**
   * Count how many periods a subject has been assigned for a group on a specific day
   */
  countSubjectPeriodsForDay(subjectId, groupId, day) {
    let count = 0;
    const periods = this.timetable[day];
    
    for (const period in periods) {
      const assignments = periods[period];
      count += assignments.filter(a => 
        a.subject.id === subjectId && a.group.id === groupId
      ).length;
    }
    
    return count;
  }

  /**
   * Make assignment in the timetable
   * Updates all tracking data structures
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
   * Removes assignment from all tracking data structures
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
   * @returns {Boolean} True if all subjects have been scheduled for required hours
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
   * Converts internal structure to API response format
   * 
   * @returns {Array} Formatted timetable entries
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
              name: assignment.group.group_name,
              strength: assignment.group.strength
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

    // Sort by day, period, and group
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
   * Provides metrics about the generation process
   * 
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const totalSlots = Object.values(this.timetable).reduce((total, periods) => {
      return total + Object.values(periods).reduce((dayTotal, assignments) => {
        return dayTotal + assignments.length;
      }, 0);
    }, 0);

    const scheduledSubjects = Object.values(this.subjectHourCounters)
      .filter(c => c.scheduled >= c.required).length;

    return {
      totalSlots: totalSlots,
      iterations: this.currentIteration,
      subjectsScheduled: scheduledSubjects,
      totalSubjects: Object.keys(this.subjectHourCounters).length,
      completionPercentage: ((scheduledSubjects / Object.keys(this.subjectHourCounters).length) * 100).toFixed(2)
    };
  }
}

/**
 * Main service function to generate timetable
 * 
 * @param {Object} constraints - Timetable generation constraints
 * @returns {Object} Generation result
 */
const generateTimetable = async (constraints) => {
  const solver = new TimetableSolver(constraints);
  return await solver.generateTimetable();
};

/**
 * Save generated timetable to database
 * Clears existing timetable and saves new one
 * 
 * @param {Array} timetable - Generated timetable slots
 * @param {String} academic_year - Academic year (e.g., "2024-25")
 * @param {String} semester_type - Semester type ("odd" or "even")
 * @returns {Boolean} True if successful
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
