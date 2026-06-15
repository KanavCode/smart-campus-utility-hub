/**
 * Smart Suggestion Engine
 * Calculates and returns top 3 optimal alternative time slots for a conflicting class
 */

class SuggestionEngine {
  /**
   * @param {Object} currentTimetable - Full schedule data
   * @param {Object} constraints - App constraints (days, periods_per_day, etc.)
   * @param {Map} teacherSchedule - Map of teacher availability
   * @param {Map} roomSchedule - Map of room availability
   * @param {Map} groupSchedule - Map of group/batch availability
   */
  constructor(currentTimetable, constraints, teacherSchedule, roomSchedule, groupSchedule) {
    this.currentTimetable = currentTimetable;
    this.constraints = constraints;
    this.teacherSchedule = teacherSchedule;
    this.roomSchedule = roomSchedule;
    this.groupSchedule = groupSchedule;
  }

  /**
   * Get top 3 alternative slots
   */
  async getSuggestions(teacher, subject, group, room, originalDay, originalPeriod) {
    const candidates = [];
    const allSlots = this.generateAllSlots();

    for (const slot of allSlots) {
      // 1. Skip original slot
      if (slot.day === originalDay && slot.period === originalPeriod) continue;

      // 2. Validate Hard Constraints
      const isValid = await this.isSlotValid(teacher, subject, group, room, slot.day, slot.period);
      if (!isValid) continue;

      // 3. Calculate Score (Soft Constraints)
      const score = this.calculateScore(teacher, group, subject, slot, originalDay, originalPeriod);

      candidates.push({
        day: slot.day,
        period: slot.period,
        score: score,
        reason: this.getReasonForSlot(slot, originalDay, originalPeriod, score)
      });
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((slot, index) => ({ ...slot, rank: index + 1 }));
  }

  async isSlotValid(teacher, subject, group, room, day, period) {
    // Check if Teacher, Room, or Group is busy
    const isTeacherBusy = this.teacherSchedule.get(day)?.get(period)?.has(teacher.id);
    const isRoomBusy = this.roomSchedule.get(day)?.get(period)?.has(room.id);
    const isGroupBusy = this.groupSchedule.get(day)?.get(period)?.has(group.id);

    return !(isTeacherBusy || isRoomBusy || isGroupBusy);
  }

  calculateScore(teacher, group, subject, slot, originalDay, originalPeriod) {
    let score = 0;
    score += this.scoreProximity(slot.day, slot.period, originalDay, originalPeriod);
    score += this.scoreTeacherLoad(teacher.id, slot.day);
    score += this.scoreRoomUtilization(group.strength, slot.room?.capacity || 50);
    return score;
  }

  scoreProximity(day, period, originalDay, originalPeriod) {
    const dayOrder = this.constraints.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayDiff = Math.abs(dayOrder.indexOf(day) - dayOrder.indexOf(originalDay));
    const periodDiff = Math.abs(period - originalPeriod);
    const distance = dayDiff * 2 + periodDiff;
    return Math.max(0, 3 - distance * 0.3);
  }

  scoreTeacherLoad(teacherId, day) {
    const { periods_per_day } = this.constraints;
    let teacherPeriodsOnDay = 0;
    for (let p = 1; p <= periods_per_day; p++) {
      if (this.teacherSchedule.get(day)?.get(p)?.has(teacherId)) teacherPeriodsOnDay++;
    }
    return Math.max(0, 4 - teacherPeriodsOnDay * 0.8);
  }

  scoreRoomUtilization(groupSize, roomCapacity) {
    const utilization = groupSize / roomCapacity;
    if (utilization >= 0.7 && utilization <= 0.85) return 3;
    if (utilization >= 0.6 && utilization <= 0.95) return 2;
    if (utilization >= 0.5 && utilization <= 1.0) return 1;
    return 0;
  }

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

  getReasonForSlot(slot, originalDay, originalPeriod, score) {
    if (Math.abs(slot.period - originalPeriod) <= 1 && slot.day === originalDay) return 'Adjacent period, minimal disruption';
    if (slot.day === originalDay) return 'Same day, different period';
    return score >= 7 ? 'High optimization score' : 'Available and suitable';
  }
}

module.exports = { SuggestionEngine };