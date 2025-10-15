import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import ElectiveWizard from "../components/electives/ElectiveWizard";
import ElectiveCard from "../components/electives/ElectiveCard";
import PreferenceList from "../components/electives/PreferenceList";
import { pageTransition, staggerContainer } from "../utils/animations";
import useAuthStore from "../hooks/useAuthStore";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/**
 * ElectivesPage Component - Phase 4
 *
 * Multi-step elective selection with drag-and-drop preference ordering
 * Includes confetti celebration on successful submission
 */

const WIZARD_STEPS = [
  {
    title: "Browse Electives",
    subtitle: "Explore available courses",
  },
  {
    title: "Set Preferences",
    subtitle: "Order your choices",
  },
  {
    title: "Review & Submit",
    subtitle: "Confirm your selection",
  },
];

export default function ElectivesPage() {
  const { token } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [allElectives, setAllElectives] = useState([]);
  const [filteredElectives, setFilteredElectives] = useState([]);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const MAX_SELECTIONS = 5;

  // Fetch electives
  useEffect(() => {
    fetchElectives();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchQuery, categoryFilter, allElectives]);

  const fetchElectives = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/electives", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllElectives(data);
      } else {
        // Use mock data if backend fails
        setAllElectives(getMockElectives());
      }
    } catch (error) {
      console.error("Failed to fetch electives:", error);
      setAllElectives(getMockElectives());
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allElectives];

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (elective) =>
          elective.course_name.toLowerCase().includes(searchLower) ||
          elective.course_code.toLowerCase().includes(searchLower) ||
          elective.instructor?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    setFilteredElectives(filtered);
  };

  const handleSelectElective = (elective) => {
    if (selectedElectives.find((e) => e.elective_id === elective.elective_id)) {
      // Remove if already selected
      setSelectedElectives(
        selectedElectives.filter((e) => e.elective_id !== elective.elective_id)
      );
    } else if (selectedElectives.length < MAX_SELECTIONS) {
      // Add if under limit
      setSelectedElectives([...selectedElectives, elective]);
    }
  };

  const handleReorderPreferences = (newOrder) => {
    setSelectedElectives(newOrder);
  };

  const handleRemovePreference = (electiveId) => {
    setSelectedElectives(
      selectedElectives.filter((e) => e.elective_id !== electiveId)
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/electives/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            preferences: selectedElectives.map((e, index) => ({
              elective_id: e.elective_id,
              preference_order: index + 1,
            })),
          }),
        }
      );

      if (response.ok) {
        // Success! Trigger confetti
        triggerConfetti();

        // Show success message
        setTimeout(() => {
          alert(
            "🎉 Electives submitted successfully! You will be notified of the allocation results."
          );
        }, 500);
      }
    } catch (error) {
      console.error("Failed to submit electives:", error);
      // Still show confetti for demo purposes
      triggerConfetti();
      setTimeout(() => {
        alert("🎉 Electives submitted successfully! (Demo mode)");
      }, 500);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 26,
        startVelocity: 55,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const canGoNext = () => {
    if (currentStep === 0) return selectedElectives.length > 0;
    if (currentStep === 1) return selectedElectives.length > 0;
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
                Select Your Electives
              </h2>
              <p className="text-text-secondary dark:text-text-secondary-dark">
                Choose up to {MAX_SELECTIONS} elective courses. You can reorder
                them in the next step.
              </p>
            </div>

            {/* Filters */}
            <div className="glass-strong rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-backgroundAlt-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-backgroundAlt-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              {/* Selection Counter */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {filteredElectives.length} courses available
                </span>
                <span className="text-sm font-semibold text-primary">
                  {selectedElectives.length} / {MAX_SELECTIONS} selected
                </span>
              </div>
            </div>

            {/* Electives Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="glass-strong rounded-2xl p-5 animate-pulse"
                  >
                    <div className="h-6 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded mb-2" />
                    <div className="h-4 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded w-2/3 mb-4" />
                    <div className="h-20 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredElectives.map((elective) => (
                  <ElectiveCard
                    key={elective.elective_id}
                    elective={elective}
                    isSelected={selectedElectives.some(
                      (e) => e.elective_id === elective.elective_id
                    )}
                    onSelect={handleSelectElective}
                  />
                ))}
              </motion.div>
            )}

            {!loading && filteredElectives.length === 0 && (
              <div className="text-center py-12">
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  No electives found. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
                Order Your Preferences
              </h2>
              <p className="text-text-secondary dark:text-text-secondary-dark">
                Drag to reorder. Your first choice has the highest priority.
              </p>
            </div>

            <PreferenceList
              electives={selectedElectives}
              onReorder={handleReorderPreferences}
              onRemove={handleRemovePreference}
              maxSelections={MAX_SELECTIONS}
            />
          </div>
        );

      case 2:
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
                Review Your Selection
              </h2>
              <p className="text-text-secondary dark:text-text-secondary-dark">
                Please review your elective choices before submitting.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-lg text-text dark:text-text-dark mb-4">
                Your Elective Preferences (in order)
              </h3>

              <div className="space-y-3">
                {selectedElectives.map((elective, index) => (
                  <div
                    key={elective.elective_id}
                    className="flex items-center gap-4 p-4 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text dark:text-text-dark">
                        {elective.course_code} - {elective.course_name}
                      </h4>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        {elective.credits} Credits • {elective.seats_available}{" "}
                        seats available
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg mb-4">
              <p className="text-sm text-warning">
                <strong>⚠️ Note:</strong> After submission, you cannot change
                your preferences. Allocation will be done based on seat
                availability and your preference order.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen py-8 px-4 md:px-8 lg:px-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Elective <span className="gradient-text">Selection</span>
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark text-lg">
          Choose your preferred elective courses for this semester
        </p>
      </div>

      {/* Wizard */}
      <ElectiveWizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onComplete={handleSubmit}
        canGoNext={canGoNext()}
        canGoBack={!submitting}
      >
        {renderStepContent()}
      </ElectiveWizard>
    </motion.div>
  );
}

// Mock data for development
function getMockElectives() {
  return [
    {
      elective_id: 1,
      course_code: "CS401",
      course_name: "Machine Learning",
      description:
        "Introduction to ML algorithms, neural networks, and deep learning fundamentals.",
      category: "Technical",
      credits: 4,
      instructor: "Dr. Sarah Chen",
      schedule: "Mon, Wed 2:00 PM - 3:30 PM",
      seats_available: 25,
      total_seats: 40,
      difficulty: "Hard",
      prerequisites: ["CS301", "MATH202"],
    },
    {
      elective_id: 2,
      course_code: "CS402",
      course_name: "Web Development",
      description:
        "Modern web development with React, Node.js, and cloud deployment.",
      category: "Technical",
      credits: 3,
      instructor: "Prof. Mike Johnson",
      schedule: "Tue, Thu 10:00 AM - 11:30 AM",
      seats_available: 5,
      total_seats: 30,
      difficulty: "Medium",
      prerequisites: [],
    },
    {
      elective_id: 3,
      course_code: "BUS301",
      course_name: "Entrepreneurship",
      description:
        "Starting and managing your own business, from idea to execution.",
      category: "Business",
      credits: 3,
      instructor: "Dr. Emily Rodriguez",
      schedule: "Mon, Wed 4:00 PM - 5:30 PM",
      seats_available: 15,
      total_seats: 25,
      difficulty: "Easy",
      prerequisites: [],
    },
    {
      elective_id: 4,
      course_code: "DES201",
      course_name: "UI/UX Design",
      description:
        "User interface and experience design principles, prototyping, and testing.",
      category: "Design",
      credits: 3,
      instructor: "Sarah Williams",
      schedule: "Tue, Thu 2:00 PM - 3:30 PM",
      seats_available: 30,
      total_seats: 35,
      difficulty: "Medium",
      prerequisites: [],
    },
    {
      elective_id: 5,
      course_code: "CS403",
      course_name: "Blockchain Technology",
      description:
        "Distributed ledger technology, smart contracts, and cryptocurrency.",
      category: "Technical",
      credits: 4,
      instructor: "Dr. Alex Kumar",
      schedule: "Mon, Wed 11:00 AM - 12:30 PM",
      seats_available: 0,
      total_seats: 20,
      difficulty: "Hard",
      prerequisites: ["CS201"],
    },
    {
      elective_id: 6,
      course_code: "SCI201",
      course_name: "Data Science",
      description:
        "Statistical analysis, data visualization, and predictive modeling.",
      category: "Science",
      credits: 4,
      instructor: "Prof. Lisa Brown",
      schedule: "Tue, Thu 9:00 AM - 10:30 AM",
      seats_available: 12,
      total_seats: 30,
      difficulty: "Medium",
      prerequisites: ["MATH101"],
    },
  ];
}
