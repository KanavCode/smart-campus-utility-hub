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
    this.maxIterations = 100000;
    this.currentIteration = 0;
    // unscheduledCount tracks remaining work — O(1) completion check
    this.unscheduledCount = 0;
    this.cache = {
      groups: {},
      subjectTeachers: {},       // subjectId -> [{ ...teacher, unavailableSlots: Set<"day_period"> }]
      suitableRooms: {}          // "courseType_strength" -> [room]
    };
    this.subjectPeriodsCounter = {};
    // Flat array built once after init — avoids Object.values() on every solve() call
    this._counterList = [];
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
      const result = this.solve(timeSlots, 0);
      
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
      this.subjectPeriodsCounter[day] = {};
      
      for (let period = 1; period <= periods_per_day; period++) {
        // Map<groupId, assignment> enables O(1) undo instead of Array.filter
        this.timetable[day][period] = new Map();
        this.teacherSchedule[day][period] = new Set();
        this.roomSchedule[day][period] = new Set();
        this.groupSchedule[day][period] = new Set();
      }
    });

    // Initialize subject hour counters and pre-fetch data for caching
    for (const groupId of groups) {
      const group = await StudentGroup.findById(groupId);
      this.cache.groups[groupId] = group;
      
      days.forEach(day => {
        this.subjectPeriodsCounter[day][groupId] = {};
      });

      const subjects = await StudentGroup.getGroupSubjects(groupId);
      
      for (const subject of subjects) {
        const key = `${groupId}_${subject.id}`;
        this.subjectHourCounters[key] = {
          required: subject.hours_per_week,
          scheduled: 0,
          subject: subject,
          groupId: groupId
        };
        this.unscheduledCount += subject.hours_per_week;

        days.forEach(day => {
          this.subjectPeriodsCounter[day][groupId][subject.id] = 0;
        });

        // Pre-fetch teachers; convert unavailability list to a Set for O(1) lookup
        if (!this.cache.subjectTeachers[subject.id]) {
          const teachers = await Subject.getSubjectTeachers(subject.id);
          const enriched = [];
          for (const teacher of teachers) {
            const unavailability = await Teacher.getUnavailability(teacher.id);
            const unavailableSlots = new Set(
              unavailability.map(u => `${u.day_of_week}_${u.period_number}`)
            );
            enriched.push({ ...teacher, unavailableSlots });
          }
          enriched.sort((a, b) => (a.priority || 999) - (b.priority || 999));
          this.cache.subjectTeachers[subject.id] = enriched;
        }

        // Pre-fetch suitable rooms
        const roomKey = `${subject.course_type}_${group.strength}`;
        if (!this.cache.suitableRooms[roomKey]) {
          const suitableRooms = await Room.findSuitableRooms(subject.course_type, group.strength);
          this.cache.suitableRooms[roomKey] = suitableRooms;
        }
      }
    }

    // Build flat counter list once so solve() never calls Object.values() again
    this._counterList = Object.values(this.subjectHourCounters);
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
    const availableSlotsPerGroup = days.length * periods_per_day - (lunch_break_period ? days.length : 0);

    // All data already in cache — no extra DB calls needed
    for (const groupId of groups) {
      if (!this.cache.groups[groupId]) {
        errors.push(`Student group with ID ${groupId} not found`);
        continue;
      }

      // Derive subjects from the already-built counter list
      const groupCounters = this._counterList.filter(c => c.groupId === groupId);
      const groupHours = groupCounters.reduce((sum, c) => sum + c.required, 0);

      if (groupHours > availableSlotsPerGroup) {
        errors.push(`Group ${groupId} requires ${groupHours} hours but only ${availableSlotsPerGroup} slots available`);
      }

      for (const { subject } of groupCounters) {
        if ((this.cache.subjectTeachers[subject.id] || []).length === 0) {
          errors.push(`No teacher assigned to subject: ${subject.subject_name} (${subject.subject_code})`);
        }
      }
    }

    if (lunch_break_period && (lunch_break_period < 1 || lunch_break_period > periods_per_day)) {
      errors.push(`Invalid lunch break period: ${lunch_break_period}`);
    }

    return { valid: errors.length === 0, errors };
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
   *
   * Strategy: iterate slots in a loop; for each slot try every pending
   * subject-teacher-room combination and recurse only on the choice branch.
   * Using unscheduledCount for O(1) completion check and a Map for O(1) undo.
   *
   * @param {Array} timeSlots
   * @param {Number} slotIndex
   * @returns {Boolean}
   */
  solve(timeSlots, slotIndex) {
    if (++this.currentIteration > this.maxIterations) {
      logger.warn('Maximum iterations reached');
      return false;
    }

    if (this.currentIteration % 1000 === 0) {
      logger.info(`Iteration ${this.currentIteration}: slot ${slotIndex}/${timeSlots.length}`);
    }

    // O(1) completion check
    if (this.unscheduledCount === 0) return true;

    if (slotIndex >= timeSlots.length) return false;

    const { day, period } = timeSlots[slotIndex];
    for (const counter of this._counterList) {
      if (counter.scheduled >= counter.required) continue;

      const { subject, groupId } = counter;
      if (this.groupSchedule[day][period].has(groupId)) continue;

      const group = this.cache.groups[groupId];
      const availableTeachers = this.getAvailableTeachers(subject.id, day, period);

      for (const teacher of availableTeachers) {
        const availableRooms = this.getAvailableRooms(subject, group, day, period);

        for (const room of availableRooms) {
          if (!this.isValidAssignment(teacher, subject, group, room, day, period)) continue;

          this.makeAssignment(teacher, subject, group, room, day, period);
          counter.scheduled++;
          this.unscheduledCount--;

          if (this.solve(timeSlots, slotIndex + 1)) return true;

          // Backtrack
          this.undoAssignment(teacher, subject, group, room, day, period);
          counter.scheduled--;
          this.unscheduledCount++;
        }
      }
    }

    // Skip this slot and try the next one
    return this.solve(timeSlots, slotIndex + 1);
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
  getAvailableTeachers(subjectId, day, period) {
    const teachers = this.cache.subjectTeachers[subjectId] || [];
    const slotKey = `${day}_${period}`;
    const available = [];

    for (const teacher of teachers) {
      if (
        !this.teacherSchedule[day][period].has(teacher.id) &&
        !teacher.unavailableSlots.has(slotKey)          // O(1) Set lookup
      ) {
        available.push(teacher);
      }
    }

    return available;
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
  getAvailableRooms(subject, group, day, period) {
    const roomKey = `${subject.course_type}_${group.strength}`;
    const suitableRooms = this.cache.suitableRooms[roomKey] || [];
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
  isValidAssignment(teacher, subject, group, room, day, period) {
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
      const periodsToday = this.subjectPeriodsCounter[day][group.id][subject.id] || 0;
      if (periodsToday >= subject.max_periods_per_day) {
        return false;
      }
    }

    return true;
  }

  /**
   * Make assignment — stored in a Map<groupId, assignment> for O(1) undo
   */
  makeAssignment(teacher, subject, group, room, day, period) {
    this.timetable[day][period].set(group.id, { teacher, subject, group, room, day, period });
    this.teacherSchedule[day][period].add(teacher.id);
    this.groupSchedule[day][period].add(group.id);
    this.roomSchedule[day][period].add(room.id);
    this.subjectPeriodsCounter[day][group.id][subject.id]++;
  }

  /**
   * Undo assignment (backtrack) — O(1) via Map keyed by groupId
   */
  undoAssignment(teacher, subject, group, room, day, period) {
    this.timetable[day][period].delete(group.id);
    this.teacherSchedule[day][period].delete(teacher.id);
    this.groupSchedule[day][period].delete(group.id);
    this.roomSchedule[day][period].delete(room.id);
    this.subjectPeriodsCounter[day][group.id][subject.id]--;
  }

  // Kept for external callers / tests; internally we use unscheduledCount
  areAllSubjectsScheduled() {
    return this.unscheduledCount === 0;
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
        for (const assignment of assignments.values()) {
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
        return dayTotal + assignments.size;
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
    await TimetableSlot.clearTimetable(academic_year, semester_type);

    // Batch all inserts in one call instead of one query per slot
    await TimetableSlot.bulkCreate(
      timetable.map(slot => ({
        day_of_week: slot.day,
        period_number: slot.period,
        teacher_id: slot.teacher.id,
        subject_id: slot.subject.id,
        group_id: slot.group.id,
        room_id: slot.room.id,
        academic_year,
        semester_type
      }))
    );

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
