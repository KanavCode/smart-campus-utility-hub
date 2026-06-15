/**
 * Smart Suggestion Engine
 * Calculates top 3 optimal alternative time slots
 */
class SuggestionEngine {
  constructor(currentTimetable, constraints, teacherSchedule, roomSchedule, groupSchedule) {
    this.currentTimetable = currentTimetable;
    this.constraints = constraints;
    this.teacherSchedule = teacherSchedule;
    this.roomSchedule = roomSchedule;
    this.groupSchedule = groupSchedule;
  }

  async getSuggestions(teacher, subject, group, room, originalDay, originalPeriod) {
    const allSlots = this.generateAllSlots();
    const candidates = [];

    for (const slot of allSlots) {
      if (slot.day === originalDay && slot.period === originalPeriod) continue;

      if (await this.isSlotValid(teacher, group, room, slot.day, slot.period)) {
        const score = this.calculateScore(teacher, group, slot, originalDay, originalPeriod);
        candidates.push({
          day: slot.day,
          period: slot.period,
          score: score,
          reason: this.getReasonForSlot(slot, originalDay, originalPeriod, score)
        });
      }
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((slot, index) => ({ ...slot, rank: index + 1 }));
  }

  async isSlotValid(teacher, group, room, day, period) {
    const isTeacherBusy = this.teacherSchedule.get(day)?.get(period)?.has(teacher.id);
    const isRoomBusy = this.roomSchedule.get(day)?.get(period)?.has(room.id);
    const isGroupBusy = this.groupSchedule.get(day)?.get(period)?.has(group.id);
    return !(isTeacherBusy || isRoomBusy || isGroupBusy);
  }

  calculateScore(teacher, group, slot, originalDay, originalPeriod) {
    return this.scoreProximity(slot.day, slot.period, originalDay, originalPeriod) +
           this.scoreTeacherLoad(teacher.id, slot.day);
  }

  scoreProximity(day, period, originalDay, originalPeriod) {
    const dayOrder = this.constraints.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayDiff = Math.abs(dayOrder.indexOf(day) - dayOrder.indexOf(originalDay));
    const periodDiff = Math.abs(period - originalPeriod);
    return Math.max(0, 3 - (dayDiff * 2 + periodDiff) * 0.3);
  }

  scoreTeacherLoad(teacherId, day) {
    let count = 0;
    for (let p = 1; p <= this.constraints.periods_per_day; p++) {
      if (this.teacherSchedule.get(day)?.get(p)?.has(teacherId)) count++;
    }
    return Math.max(0, 4 - count * 0.8);
  }

  generateAllSlots() {
    const slots = [];
    this.constraints.days.forEach(day => {
      for (let period = 1; period <= this.constraints.periods_per_day; period++) {
        if (period !== this.constraints.lunch_break_period) slots.push({ day, period });
      }
    });
    return slots;
  }

  getReasonForSlot(slot, originalDay, originalPeriod, score) {
    if (slot.day === originalDay) return 'Same day, different period';
    return 'Available and suitable';
  }
}

module.exports = { SuggestionEngine };