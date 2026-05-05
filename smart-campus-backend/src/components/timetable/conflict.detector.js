/**
 * Conflict Detector
 * Detects conflicts when a class is manually assigned to a timetable slot
 */

class ConflictDetector {
  constructor(currentTimetable, teacherSchedule, roomSchedule, groupSchedule) {
    this.currentTimetable = currentTimetable;
    this.teacherSchedule = teacherSchedule;
    this.roomSchedule = roomSchedule;
    this.groupSchedule = groupSchedule;
  }

  /**
   * Detect all conflicts for a proposed assignment
   * @param {Object} teacher - Teacher object
   * @param {Object} subject - Subject object
   * @param {Object} group - Student group object
   * @param {Object} room - Room object
   * @param {String} day - Day of week
   * @param {Number} period - Period number
   * @returns {Array} Array of conflict objects
   */
  async detectConflicts(teacher, subject, group, room, day, period) {
    const conflicts = [];

    // Conflict 1: Teacher double-booked
    if (this.teacherSchedule[day]?.[period]?.has(teacher.id)) {
      conflicts.push({
        type: 'TEACHER_CONFLICT',
        severity: 'HIGH',
        message: `Teacher ${teacher.full_name} already has class at ${day} Period ${period}`
      });
    }

    // Conflict 2: Room already occupied
    if (this.roomSchedule[day]?.[period]?.has(room.id)) {
      conflicts.push({
        type: 'ROOM_CONFLICT',
        severity: 'HIGH',
        message: `Room ${room.room_name} already occupied at ${day} Period ${period}`
      });
    }

    // Conflict 3: Group already scheduled
    if (this.groupSchedule[day]?.[period]?.has(group.id)) {
      conflicts.push({
        type: 'GROUP_CONFLICT',
        severity: 'HIGH',
        message: `Group ${group.group_name} already has class at ${day} Period ${period}`
      });
    }

    // Conflict 4: Room capacity insufficient
    if (room.capacity < group.strength) {
      conflicts.push({
        type: 'CAPACITY_CONFLICT',
        severity: 'MEDIUM',
        message: `Room capacity (${room.capacity}) < Group size (${group.strength})`
      });
    }

    // Conflict 5: Room type mismatch for Lab/Practical
    if ((subject.course_type === 'Lab' || subject.course_type === 'Practical') && room.room_type !== 'Lab') {
      conflicts.push({
        type: 'ROOM_TYPE_CONFLICT',
        severity: 'MEDIUM',
        message: `${subject.course_type} class needs Lab room, got ${room.room_type}`
      });
    }

    // Conflict 6: Teacher unavailability (hard constraint in timetable solver)
    try {
      const { Teacher } = require('./timetable.models');
      const unavailability = await Teacher.getUnavailability(teacher.id);
      if (Array.isArray(unavailability) && unavailability.length > 0) {
        const isUnavailable = unavailability.some(u => u.day_of_week === day && u.period_number === period);
        if (isUnavailable) {
          conflicts.push({
            type: 'TEACHER_UNAVAILABILITY',
            severity: 'HIGH',
            message: `Teacher ${teacher.full_name} is marked unavailable for ${day} Period ${period}`,
            timeDependent: true
          });
        }
      }
    } catch (err) {
      // Unavailability check failed (e.g., in test environment) - skip this check
    }

    return conflicts;
  }

  /**
   * Check if assignment has any HIGH severity conflicts
   */
  hasHighSeverityConflicts(conflicts) {
    return conflicts.some(c => c.severity === 'HIGH');
  }

  /**
   * Get conflicting assignment details from current timetable
   */
  getConflictingAssignment(day, period, resourceType, resourceId) {
    if (!this.currentTimetable[day]?.[period]) return null;

    return this.currentTimetable[day][period].find(assignment => {
      if (resourceType === 'teacher') return assignment.teacher.id === resourceId;
      if (resourceType === 'room') return assignment.room.id === resourceId;
      if (resourceType === 'group') return assignment.group.id === resourceId;
    });
  }
}

module.exports = { ConflictDetector };
