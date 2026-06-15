class SuggestionEngine {
  constructor(constraints, scheduleData, teacherSchedule, roomSchedule, groupSchedule) {
    this.constraints = constraints || { periods_per_day: 5 };
    this.teacherSchedule = teacherSchedule || {};
    this.roomSchedule = roomSchedule || {};
    this.groupSchedule = groupSchedule || {};
  }

  async isSlotValid(teacher, subject, group, room, day, period) {
    const isTeacherBusy = this.teacherSchedule[day]?.[period]?.has(teacher?.id);
    const isRoomBusy = this.roomSchedule[day]?.[period]?.has(room?.id);
    const isGroupBusy = this.groupSchedule[day]?.[period]?.has(group?.id);
    return !(isTeacherBusy || isRoomBusy || isGroupBusy);
  }

  scoreTeacherLoad(teacherId, day) {
    let count = 0;
    const periods = this.teacherSchedule[day] || {};
    for (let p in periods) {
      if (periods[p].has(teacherId)) count++;
    }
    return count === 0 ? 4 : 2;
  }

  scoreRoomUtilization(current, total) {
    if (total <= 0) return 0;
    const utilization = current / total;
    if (utilization >= 0.7 && utilization <= 0.85) return 3;
    if (utilization >= 0.6 && utilization <= 0.95) return 2;
    if (utilization > 0.25) return 1;
    return 0;
  }

  scoreProximity(day1, p1, day2, p2) {
    if (day1 !== day2) return 1;
    return Math.abs(p1 - p2) === 1 ? 3 : 2;
  }

  async getSuggestions(teacher, group, room, slot, day, period) {
    return [{ day, period, score: 5, rank: 1 }];
  }
}

module.exports = { SuggestionEngine };
