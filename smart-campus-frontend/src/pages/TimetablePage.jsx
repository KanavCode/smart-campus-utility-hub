import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { pageTransition } from "../utils/animations";
import useAuthStore from "../hooks/useAuthStore";

/**
 * TimetablePage Component - Phase 4
 *
 * Responsive timetable viewer with color-coded classes
 * Daily/Weekly toggle and export functionality
 */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const COLORS = [
  {
    bg: "bg-blue-500",
    text: "text-blue-500",
    light: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    bg: "bg-purple-500",
    text: "text-purple-500",
    light: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    bg: "bg-green-500",
    text: "text-green-500",
    light: "bg-green-100 dark:bg-green-900/30",
  },
  {
    bg: "bg-orange-500",
    text: "text-orange-500",
    light: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    bg: "bg-pink-500",
    text: "text-pink-500",
    light: "bg-pink-100 dark:bg-pink-900/30",
  },
  {
    bg: "bg-teal-500",
    text: "text-teal-500",
    light: "bg-teal-100 dark:bg-teal-900/30",
  },
];

export default function TimetablePage() {
  const { token } = useAuthStore();
  const [view, setView] = useState("week"); // 'week' or 'day'
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() - 1); // 0 = Monday
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/timetable", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      } else {
        setTimetable(getMockTimetable());
      }
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setTimetable(getMockTimetable());
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV content
    let csv = "Day,Time,Course,Instructor,Location\n";

    timetable.forEach((item) => {
      csv += `${item.day_of_week},${item.start_time}-${item.end_time},${item.course_name},${item.instructor},${item.location}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getClassesForDay = (dayIndex) => {
    const dayName = DAYS[dayIndex];
    return timetable.filter((item) => item.day_of_week === dayName);
  };

  const getClassAtTime = (dayIndex, time) => {
    const classes = getClassesForDay(dayIndex);
    return classes.find((c) => c.start_time.includes(time.split(":")[0]));
  };

  const getColorForCourse = (courseCode) => {
    const hash = courseCode
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLORS[hash % COLORS.length];
  };

  const ClassCard = ({ classData, isCompact = false }) => {
    const colors = getColorForCourse(classData.course_code);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`
          ${colors.light} rounded-lg p-3 border-l-4 ${colors.bg}
          cursor-pointer transition-all hover:shadow-md
        `}
      >
        <h4 className={`font-bold ${colors.text} text-sm mb-1`}>
          {classData.course_code}
        </h4>
        {!isCompact && (
          <>
            <p className="text-xs text-text dark:text-text-dark font-medium mb-2">
              {classData.course_name}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-secondary-dark">
                <ClockIcon className="w-3 h-3" />
                <span>
                  {classData.start_time} - {classData.end_time}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-secondary-dark">
                <MapPinIcon className="w-3 h-3" />
                <span>{classData.location}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-secondary-dark">
                <UserIcon className="w-3 h-3" />
                <span>{classData.instructor}</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const WeekView = () => (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border dark:border-border-dark">
              <th className="p-4 text-left text-sm font-semibold text-text dark:text-text-dark bg-backgroundAlt dark:bg-backgroundAlt-dark">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="p-4 text-center text-sm font-semibold text-text dark:text-text-dark bg-backgroundAlt dark:bg-backgroundAlt-dark min-w-[150px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr
                key={time}
                className="border-b border-border dark:border-border-dark"
              >
                <td className="p-4 text-sm text-text-secondary dark:text-text-secondary-dark font-medium bg-backgroundAlt/50 dark:bg-backgroundAlt-dark/50">
                  {time}
                </td>
                {DAYS.map((day, dayIndex) => {
                  const classData = getClassAtTime(dayIndex, time);
                  return (
                    <td key={day} className="p-2">
                      {classData && (
                        <ClassCard classData={classData} isCompact />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DayView = () => {
    const classes = getClassesForDay(selectedDay);

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day Selector */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              className="p-2 hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-text dark:text-text-dark">
              {DAYS[selectedDay]}
            </h3>
            <button
              onClick={() => setSelectedDay(Math.min(5, selectedDay + 1))}
              disabled={selectedDay === 5}
              className="p-2 hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DAYS.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`
                  py-2 px-3 rounded-lg font-medium transition-all
                  ${
                    selectedDay === index
                      ? "bg-primary text-white"
                      : "bg-backgroundAlt dark:bg-backgroundAlt-dark text-text dark:text-text-dark hover:bg-border dark:hover:bg-border-dark"
                  }
                `}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Classes List */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4">
            Classes ({classes.length})
          </h3>

          {classes.length > 0 ? (
            <div className="space-y-3">
              {classes.map((classData, index) => (
                <ClassCard key={index} classData={classData} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary dark:text-text-secondary-dark">
                No classes scheduled for this day
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="min-h-screen py-8 px-4 md:px-8 lg:px-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              My <span className="gradient-text">Timetable</span>
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark text-lg">
              View your weekly class schedule
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="glass-strong rounded-lg p-1 flex">
              <button
                onClick={() => setView("week")}
                className={`
                  px-4 py-2 rounded-md font-medium transition-all
                  ${
                    view === "week"
                      ? "bg-primary text-white"
                      : "text-text dark:text-text-dark hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark"
                  }
                `}
              >
                Week
              </button>
              <button
                onClick={() => setView("day")}
                className={`
                  px-4 py-2 rounded-md font-medium transition-all
                  ${
                    view === "day"
                      ? "bg-primary text-white"
                      : "text-text dark:text-text-dark hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark"
                  }
                `}
              >
                Day
              </button>
            </div>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="px-4 py-2 bg-accent hover:bg-accent-light text-white rounded-lg font-medium flex items-center gap-2 shadow-lg"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export
            </motion.button>
          </div>
        </div>

        {/* Timetable View */}
        {loading ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-secondary dark:text-text-secondary-dark">
              Loading timetable...
            </p>
          </div>
        ) : view === "week" ? (
          <WeekView />
        ) : (
          <DayView />
        )}

        {/* Legend */}
        <div className="mt-8 glass-strong rounded-xl p-6">
          <h3 className="font-semibold text-text dark:text-text-dark mb-4">
            Course Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...new Set(timetable.map((c) => c.course_code))].map((code) => {
              const colors = getColorForCourse(code);
              const course = timetable.find((c) => c.course_code === code);
              return (
                <div key={code} className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${colors.bg} rounded`} />
                  <span className="text-sm text-text dark:text-text-dark">
                    {code} - {course?.course_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Mock data
function getMockTimetable() {
  return [
    {
      course_code: "CS301",
      course_name: "Data Structures",
      instructor: "Dr. Smith",
      location: "Room 201",
      day_of_week: "Monday",
      start_time: "09:00 AM",
      end_time: "10:30 AM",
    },
    {
      course_code: "CS302",
      course_name: "Algorithms",
      instructor: "Prof. Johnson",
      location: "Room 105",
      day_of_week: "Monday",
      start_time: "11:00 AM",
      end_time: "12:30 PM",
    },
    {
      course_code: "MATH201",
      course_name: "Linear Algebra",
      instructor: "Dr. Brown",
      location: "Room 303",
      day_of_week: "Monday",
      start_time: "02:00 PM",
      end_time: "03:30 PM",
    },
    {
      course_code: "CS303",
      course_name: "Database Systems",
      instructor: "Dr. Wilson",
      location: "Lab 2",
      day_of_week: "Tuesday",
      start_time: "09:00 AM",
      end_time: "10:30 AM",
    },
    {
      course_code: "CS301",
      course_name: "Data Structures",
      instructor: "Dr. Smith",
      location: "Room 201",
      day_of_week: "Wednesday",
      start_time: "09:00 AM",
      end_time: "10:30 AM",
    },
    {
      course_code: "CS304",
      course_name: "Operating Systems",
      instructor: "Prof. Davis",
      location: "Room 402",
      day_of_week: "Wednesday",
      start_time: "02:00 PM",
      end_time: "03:30 PM",
    },
    {
      course_code: "CS302",
      course_name: "Algorithms",
      instructor: "Prof. Johnson",
      location: "Room 105",
      day_of_week: "Thursday",
      start_time: "11:00 AM",
      end_time: "12:30 PM",
    },
    {
      course_code: "CS303",
      course_name: "Database Systems",
      instructor: "Dr. Wilson",
      location: "Lab 2",
      day_of_week: "Friday",
      start_time: "10:00 AM",
      end_time: "11:30 AM",
    },
  ];
}
