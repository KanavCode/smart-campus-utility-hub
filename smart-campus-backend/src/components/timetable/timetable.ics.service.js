/**
 * ICS Calendar Service
 * Converts timetable slots to iCalendar format (RFC 5545)
 */

class IcsCalendarService {
  static escapeText(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  }

  static formatIcsDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  static formatIcsTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
  }

  static getPeriodTiming(periodNumber) {
    const periods = {
      1: { start: { hour: 9, minute: 0 }, end: { hour: 10, minute: 0 } },
      2: { start: { hour: 10, minute: 0 }, end: { hour: 11, minute: 0 } },
      3: { start: { hour: 11, minute: 0 }, end: { hour: 12, minute: 0 } },
      4: { start: { hour: 12, minute: 0 }, end: { hour: 13, minute: 0 } },
      5: { start: { hour: 14, minute: 0 }, end: { hour: 15, minute: 0 } },
      6: { start: { hour: 15, minute: 0 }, end: { hour: 16, minute: 0 } },
      7: { start: { hour: 16, minute: 0 }, end: { hour: 17, minute: 0 } },
      8: { start: { hour: 17, minute: 0 }, end: { hour: 18, minute: 0 } },
    };
    return periods[periodNumber] || periods[1];
  }

  static dayNameToIso(dayName) {
    const days = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    return days[dayName] || 1;
  }

  static getNextOccurrenceDate(dayName) {
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = this.dayNameToIso(dayName);
    const jsCurrentDay = currentDay === 0 ? 7 : currentDay;
    
    let daysToAdd = targetDay - jsCurrentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    const resultDate = new Date(today);
    resultDate.setDate(resultDate.getDate() + daysToAdd);
    return resultDate;
  }

  static createVEvent(slot, groupName) {
    const crypto = require('crypto');
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[-:\.]/g, '');
    
    const timing = this.getPeriodTiming(slot.period_number);
    const eventDate = this.getNextOccurrenceDate(slot.day_of_week);
    
    const startDate = this.formatIcsDate(eventDate);
    const startTime = this.formatIcsTime(timing.start.hour, timing.start.minute);
    const endTime = this.formatIcsTime(timing.end.hour, timing.end.minute);
    
    const summary = this.escapeText(`${slot.subject_code} - ${slot.subject_name}`);
    const location = this.escapeText(`${slot.room_code} - ${slot.room_name}`);
    const description = this.escapeText(
      `Teacher: ${slot.teacher_name}\nCourse Type: ${slot.subject?.course_type || 'Theory'}`
    );
    
    return `BEGIN:VEVENT
UID:${eventId}@smartcampus.local
DTSTAMP:${timestamp}Z
DTSTART:${startDate}T${startTime}
DTEND:${startDate}T${endTime}
SUMMARY:${summary}
LOCATION:${location}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT`;
  }

  static generateIcs(slots, groupName, academicYear = '2024-25') {
    if (!slots || slots.length === 0) {
      throw new Error('No timetable slots provided');
    }

    const timestamp = new Date().toISOString().replace(/[-:\.]/g, '');
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smart Campus//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${this.escapeText(`${groupName} Timetable (${academicYear})`)}
X-WR-TIMEZONE:Asia/Kolkata
X-WR-CALDESC:${this.escapeText(`Timetable for ${groupName}`)}
DTSTAMP:${timestamp}Z
`;

    slots.forEach(slot => {
      icsContent += `\n${this.createVEvent(slot, groupName)}`;
    });

    icsContent += `\nEND:VCALENDAR`;
    return icsContent;
  }
}

module.exports = IcsCalendarService;
