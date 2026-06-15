/**
 * Optimized Conflict Detector
 * Uses a Hash Map (Object) for O(1) lookup time.
 * Before: O(N^2) or O(N) depending on implementation.
 * After: O(N) to iterate once + O(1) average lookup per entry.
 */
const detectConflicts = (timetable) => {
    const timeSlots = new Map(); 

    for (const entry of timetable) {
        // Create a unique key for each slot
        const key = `${entry.day}-${entry.timeSlot}-${entry.resourceId}`;

        if (timeSlots.has(key)) {
            // Conflict detected!
            return { conflict: true, entry: entry };
        }
        
        // Mark slot as occupied
        timeSlots.set(key, true);
    }

    return { conflict: false };
};

module.exports = { detectConflicts };