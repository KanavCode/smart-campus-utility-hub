/**
 * Intelligent Timetable Generation Service
 * Uses backtracking algorithm with constraint satisfaction
 */

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 */
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Check if a new slot conflicts with existing timetable slots
 */
const isConflict = (timetable, newSlot) => {
  for (const slot of timetable) {
    if (slot.day === newSlot.day && slot.period === newSlot.period) {
      // Same time slot conflicts
      if (slot.teacher_id === newSlot.teacher_id) {
        console.log(`⚠️  Teacher conflict: Teacher ${newSlot.teacher_id} already assigned at Day ${newSlot.day}, Period ${newSlot.period}`);
        return true; // Teacher already assigned
      }
      if (slot.classroom_id === newSlot.classroom_id) {
        console.log(`⚠️  Classroom conflict: Classroom ${newSlot.classroom_id} already occupied at Day ${newSlot.day}, Period ${newSlot.period}`);
        return true; // Classroom already occupied
      }
      if (slot.class_id === newSlot.class_id) {
        console.log(`⚠️  Class conflict: Class ${newSlot.class_id} already has a lecture at Day ${newSlot.day}, Period ${newSlot.period}`);
        return true; // Class already has a lecture
      }
    }
  }
  return false;
};

/**
 * Find available teacher for a subject
 * For now, uses simple round-robin assignment
 * In a real system, you'd have teacher-subject mappings
 */
const findAvailableTeacher = (data, subjectId, timetable, day, period) => {
  // Shuffle teachers to get random assignment
  const shuffledTeachers = shuffle(data.teachers);
  
  for (const teacher of shuffledTeachers) {
    // Check if teacher is available at this time
    const teacherBusy = timetable.some(slot => 
      slot.day === day && 
      slot.period === period && 
      slot.teacher_id === teacher.id
    );
    
    if (!teacherBusy) {
      return teacher.id;
    }
  }
  
  return null; // No available teacher
};

/**
 * Find available classroom for a lecture
 */
const findAvailableClassroom = (data, timetable, day, period, preferredType = null) => {
  // Filter classrooms by type if specified
  let availableClassrooms = data.classrooms;
  if (preferredType) {
    availableClassrooms = data.classrooms.filter(room => room.type === preferredType);
  }
  
  // Shuffle for random assignment
  const shuffledClassrooms = shuffle(availableClassrooms);
  
  for (const classroom of shuffledClassrooms) {
    // Check if classroom is available at this time
    const classroomBusy = timetable.some(slot => 
      slot.day === day && 
      slot.period === period && 
      slot.classroom_id === classroom.id
    );
    
    if (!classroomBusy) {
      return classroom.id;
    }
  }
  
  return null; // No available classroom
};

/**
 * Apply constraints to validate a slot assignment
 */
const validateConstraints = (data, timetable, newSlot) => {
  // Apply custom constraints from constraints table
  for (const constraint of data.constraints) {
    const { type, details } = constraint;
    
    switch (type) {
      case 'no_consecutive_lectures':
        // Example: No more than 2 consecutive lectures for same subject in a class
        if (details.max_consecutive) {
          const consecutiveCount = getConsecutiveLectures(timetable, newSlot);
          if (consecutiveCount >= details.max_consecutive) {
            return false;
          }
        }
        break;
        
      case 'preferred_time_slots':
        // Example: Certain subjects preferred in specific periods
        if (details.subject_id === newSlot.subject_id) {
          const preferredPeriods = details.preferred_periods || [];
          if (preferredPeriods.length > 0 && !preferredPeriods.includes(newSlot.period)) {
            return false;
          }
        }
        break;
        
      case 'avoid_time_slots':
        // Example: Avoid certain periods for certain subjects
        if (details.subject_id === newSlot.subject_id) {
          const avoidPeriods = details.avoid_periods || [];
          if (avoidPeriods.includes(newSlot.period)) {
            return false;
          }
        }
        break;
    }
  }
  
  return true;
};

/**
 * Get count of consecutive lectures for validation
 */
const getConsecutiveLectures = (timetable, newSlot) => {
  let count = 1; // Current slot
  
  // Check previous periods
  for (let p = newSlot.period - 1; p >= 1; p--) {
    const prevSlot = timetable.find(slot => 
      slot.day === newSlot.day && 
      slot.period === p && 
      slot.class_id === newSlot.class_id &&
      slot.subject_id === newSlot.subject_id
    );
    
    if (prevSlot) {
      count++;
    } else {
      break;
    }
  }
  
  // Check next periods
  for (let p = newSlot.period + 1; p <= 8; p++) {
    const nextSlot = timetable.find(slot => 
      slot.day === newSlot.day && 
      slot.period === p && 
      slot.class_id === newSlot.class_id &&
      slot.subject_id === newSlot.subject_id
    );
    
    if (nextSlot) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
};

/**
 * Main backtracking solver
 */
const solve = (lectures, data, timetable, index, maxAttempts = 1000) => {
  if (index >= lectures.length) {
    console.log('✅ All lectures successfully placed!');
    return true;
  }
  
  if (maxAttempts <= 0) {
    console.log('⚠️  Maximum attempts reached, stopping...');
    return false;
  }

  const lecture = lectures[index];
  console.log(`🔄 Placing lecture ${index + 1}/${lectures.length}: Class ${lecture.class_id}, Subject ${lecture.subject_id}`);

  // Try all possible day-period combinations
  for (let day = 1; day <= data.config.workingDays; day++) {
    for (let period = 1; period <= data.config.periodsPerDay; period++) {
      
      // Find available teacher and classroom
      const teacherId = findAvailableTeacher(data, lecture.subject_id, timetable, day, period);
      const classroomId = findAvailableClassroom(data, timetable, day, period);
      
      if (!teacherId || !classroomId) {
        continue; // Skip if no teacher or classroom available
      }

      const slot = {
        day,
        period,
        class_id: lecture.class_id,
        subject_id: lecture.subject_id,
        teacher_id: teacherId,
        classroom_id: classroomId
      };

      // Check for conflicts and constraints
      if (!isConflict(timetable, slot) && validateConstraints(data, timetable, slot)) {
        // Place the lecture
        timetable.push(slot);
        console.log(`✅ Placed: Day ${day}, Period ${period}, Class ${lecture.class_id}, Subject ${lecture.subject_id}`);
        
        // Recursively solve for next lecture
        if (solve(lectures, data, timetable, index + 1, maxAttempts - 1)) {
          return true;
        }
        
        // Backtrack if no solution found
        timetable.pop();
        console.log(`🔙 Backtracking from: Day ${day}, Period ${period}, Class ${lecture.class_id}, Subject ${lecture.subject_id}`);
      }
    }
  }

  console.log(`❌ Could not place lecture: Class ${lecture.class_id}, Subject ${lecture.subject_id}`);
  return false;
};

/**
 * Prepare lectures to be placed based on class-subject mappings
 */
const prepareLectures = (classSubjects) => {
  const lectures = [];
  
  classSubjects.forEach(mapping => {
    for (let i = 0; i < mapping.lectures_per_week; i++) {
      lectures.push({
        class_id: mapping.class_id,
        subject_id: mapping.subject_id,
        lecture_number: i + 1
      });
    }
  });
  
  return lectures;
};

/**
 * Validate input data
 */
const validateInputData = (data) => {
  const errors = [];
  
  if (!data.teachers || data.teachers.length === 0) {
    errors.push('No teachers available');
  }
  
  if (!data.subjects || data.subjects.length === 0) {
    errors.push('No subjects available');
  }
  
  if (!data.classes || data.classes.length === 0) {
    errors.push('No classes available');
  }
  
  if (!data.classrooms || data.classrooms.length === 0) {
    errors.push('No classrooms available');
  }
  
  if (!data.classSubjects || data.classSubjects.length === 0) {
    errors.push('No class-subject mappings available');
  }
  
  // Calculate total lectures needed vs available slots
  const totalLectures = data.classSubjects.reduce((total, mapping) => 
    total + mapping.lectures_per_week, 0
  );
  
  const totalSlots = data.config.workingDays * data.config.periodsPerDay * data.classes.length;
  
  if (totalLectures > totalSlots) {
    errors.push(`Too many lectures required (${totalLectures}) for available slots (${totalSlots})`);
  }
  
  return errors;
};

/**
 * Main generation function
 */
exports.run = (data) => {
  console.log('🚀 Starting timetable generation...');
  
  // Validate input data
  const validationErrors = validateInputData(data);
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:', validationErrors);
    return null;
  }
  
  // Prepare lectures to be scheduled
  const lectures = prepareLectures(data.classSubjects);
  console.log(`📚 Total lectures to place: ${lectures.length}`);
  
  // Shuffle lectures for better randomization
  const shuffledLectures = shuffle(lectures);
  
  // Initialize empty timetable
  const timetable = [];
  
  // Attempt to solve with multiple tries for better success rate
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🎯 Attempt ${attempt}/${maxRetries}`);
    
    // Clear timetable for fresh attempt
    timetable.length = 0;
    
    // Try to solve
    if (solve(shuffledLectures, data, timetable, 0)) {
      console.log(`🎉 Timetable generated successfully on attempt ${attempt}!`);
      console.log(`📊 Generated ${timetable.length} timetable slots`);
      return timetable;
    }
    
    console.log(`❌ Attempt ${attempt} failed, trying again...`);
    
    // Shuffle lectures again for next attempt
    shuffledLectures.splice(0, shuffledLectures.length, ...shuffle(lectures));
  }
  
  console.log('❌ Failed to generate timetable after all attempts');
  return null;
};

/**
 * Export additional utility functions for testing
 */
exports.utils = {
  shuffle,
  isConflict,
  validateConstraints,
  prepareLectures,
  validateInputData
};