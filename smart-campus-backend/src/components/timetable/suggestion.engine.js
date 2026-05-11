/**
 * Smart Suggestion Engine
 * Calculates and returns top 3 optimal alternative time slots for a conflicting class
 */

class SuggestionEngine {
  constructor(currentTimetable, constraints, teacherSchedule, roomSchedule, groupSchedule) {
    this.currentTimetable = currentTimetable;
    this.constraints = constraints;
    this.teacherSchedule = teacherSchedule;
    this.roomSchedule = roomSchedule;
    this.groupSchedule = groupSchedule;
  }

  /**
   * Get top 3 alternative slots for a conflicting assignment
   * @param {Object} teacher - Teacher object
   * @param {Object} subject - Subject object
   * @param {Object} group - Group object
   * @param {Object} room - Room object
   * @param {String} originalDay - Original day
   * @param {Number} originalPeriod - Original period
   * @returns {Array} Top 3 alternatives sorted by score (highest first)
   */
  async getSuggestions(teacher, subject, group, room, originalDay, originalPeriod) {
    const candidates = [];
    const allSlots = this.generateAllSlots();

    // Evaluate each slot
    for (const slot of allSlots) {
      // Skip original slot
      if (slot.day === originalDay && slot.period === originalPeriod) continue;

      // Check if slot is valid (no conflicts)
      const isValid = await this.isSlotValid(teacher, subject, group, room, slot.day, slot.period);
      if (!isValid) continue;

      // Calculate optimization score
      const score = this.calculateScore(teacher, group, subject, slot, originalDay, originalPeriod);

      candidates.push({
        day: slot.day,
        period: slot.period,
        score: score,
        reason: this.getReasonForSlot(slot, originalDay, originalPeriod, score)
      });
    }

    // Sort by score descending and return top 3
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((slot, index) => ({ ...slot, rank: index + 1 }));
  }

  /**
   * Check if a slot is valid for assignment (no conflicts)
   */
  async isSlotValid(teacher, subject, group, room, day, period) {
    // Teacher not already scheduled
    if (this.teacherSchedule[day]?.[period]?.has(teacher.id)) return false;

    // Room not already occupied
    if (this.roomSchedule[day]?.[period]?.has(room.id)) return false;

    // Group not already scheduled
    if (this.groupSchedule[day]?.[period]?.has(group.id)) return false;

    return true;
  }

  /**
   * Calculate optimization score for a slot
   * Higher score = better alternative
   * 
   * Scoring factors (max 10 points):
   * 1. Proximity to original slot (3 pts) - prefer nearby times
   * 2. Teacher load balance (4 pts) - prefer less busy days
   * 3. Room utilization (3 pts) - prefer optimal room fit
   */
  calculateScore(teacher, group, subject, slot, originalDay, originalPeriod) {
    let score = 0;

    // Factor 1: Temporal proximity (max 3 pts)
    score += this.scoreProximity(slot.day, slot.period, originalDay, originalPeriod);

    // Factor 2: Teacher load distribution (max 4 pts)
    score += this.scoreTeacherLoad(teacher.id, slot.day);

    // Factor 3: Room utilization efficiency (max 3 pts)
    score += this.scoreRoomUtilization(group.strength, slot.room?.capacity || 50);

    return score;
  }

  /**
   * Score temporal proximity - prefer slots close to original time
   * Max 3 points for same slot, decreases with distance
   */
  scoreProximity(day, period, originalDay, originalPeriod) {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayDiff = Math.abs(dayOrder.indexOf(day) - dayOrder.indexOf(originalDay));
    const periodDiff = Math.abs(period - originalPeriod);

    // Closer = higher score
    const distance = dayDiff * 2 + periodDiff;
    return Math.max(0, 3 - distance * 0.3);
  }

  /**
   * Score teacher load balance - prefer less busy days
   * Max 4 points, lower score if teacher already has many classes
   */
  scoreTeacherLoad(teacherId, day) {
    const { periods_per_day } = this.constraints;
    let teacherPeriodsOnDay = 0;

    for (let p = 1; p <= periods_per_day; p++) {
      if (this.teacherSchedule[day]?.[p]?.has(teacherId)) {
        teacherPeriodsOnDay++;
      }
    }

    // Prefer days with fewer assignments
    return Math.max(0, 4 - teacherPeriodsOnDay * 0.8);
  }

  /**
   * Score room utilization - prefer rooms with good capacity match
   * Max 3 points for 70-85% utilization
   */
  scoreRoomUtilization(groupSize, roomCapacity) {
    const utilization = groupSize / roomCapacity;

    if (utilization >= 0.7 && utilization <= 0.85) return 3; // Optimal
    if (utilization >= 0.6 && utilization <= 0.95) return 2; // Good
    if (utilization >= 0.5 && utilization <= 1.0) return 1; // Acceptable
    return 0;
  }

  /**
   * Generate all valid time slots (excluding lunch break)
   */
  generateAllSlots() {
    const slots = [];
    const { days, periods_per_day, lunch_break_period } = this.constraints;

    days.forEach(day => {
      for (let period = 1; period <= periods_per_day; period++) {
        if (lunch_break_period && period === lunch_break_period) continue;
        slots.push({ day, period });
      }
    });

    return slots;
  }

  /**
   * Generate human-readable reason for suggested slot
   */
  getReasonForSlot(slot, originalDay, originalPeriod, score) {
    if (Math.abs(slot.period - originalPeriod) <= 1) {
      return 'Same day, adjacent period - minimal disruption';
    }
    if (slot.day === originalDay) {
      return 'Same day, different period - preserves schedule flow';
    }
    if (score >= 7) {
      return 'Good alternative - high optimization score';
    }
    return 'Alternative slot - available and suitable';
  }
}

module.exports = { SuggestionEngine };
