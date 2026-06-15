const { ConflictDetector } = require('./conflict.detector');
const { SuggestionEngine } = require('./suggestion.engine');

async function detectConflictsAndSuggest(entry, mockState) {
  const { teacher_id, subject_id, group_id, room_id, day, period } = entry;
  
  const teacher = { id: teacher_id, full_name: 'Teacher' };
  const subject = { id: subject_id, course_type: 'Theory' };
  const group = { id: group_id, strength: 30 };
  const room = { id: room_id, capacity: 50, room_type: 'Classroom' };
  
  const detector = new ConflictDetector(
    mockState.timetable,
    mockState.teacherSchedule,
    mockState.roomSchedule,
    mockState.groupSchedule
  );
  
  const suggestionEngine = new SuggestionEngine(
    mockState.timetable,
    mockState.constraints,
    mockState.teacherSchedule,
    mockState.roomSchedule,
    mockState.groupSchedule
  );
  
  const conflicts = await detector.detectConflicts(teacher, subject, group, room, day, period);
  
  let suggestions = [];
  if (conflicts.length > 0) {
    suggestions = await suggestionEngine.getSuggestions(teacher, subject, group, room, day, period);
  }
  
  return {
    success: conflicts.length === 0,
    conflicts: conflicts,
    suggestions: suggestions
  };
}

module.exports = { detectConflictsAndSuggest };
