import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";

/**
 * SortableElectiveItem Component
 *
 * Individual draggable elective in the preference list
 */
const SortableElectiveItem = ({ elective, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: elective.elective_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          glass-strong rounded-xl p-4 mb-3 flex items-center gap-4
          ${
            isDragging
              ? "opacity-50 shadow-2xl ring-2 ring-primary"
              : "hover:shadow-lg"
          }
          transition-all duration-200
        `}
      >
        {/* Preference Number */}
        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">{index + 1}</span>
        </div>

        {/* Elective Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text dark:text-text-dark mb-1">
            {elective.course_code}
          </h4>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark line-clamp-1">
            {elective.course_name}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
              {elective.credits} Credits
            </span>
            <span
              className={`text-xs font-semibold ${
                elective.seats_available > 10
                  ? "text-success"
                  : elective.seats_available > 0
                  ? "text-warning"
                  : "text-error"
              }`}
            >
              {elective.seats_available} seats left
            </span>
          </div>
        </div>

        {/* Drag Handle */}
        <button
          {...listeners}
          className="flex-shrink-0 p-2 hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark rounded-lg transition-colors cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
        </button>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(elective.elective_id)}
          className="flex-shrink-0 p-2 hover:bg-error/10 rounded-lg transition-colors group"
        >
          <XMarkIcon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark group-hover:text-error transition-colors" />
        </button>
      </motion.div>
    </div>
  );
};

/**
 * PreferenceList Component
 *
 * Drag-and-drop list for ordering elective preferences
 *
 * @param {Array} electives - Selected electives in order
 * @param {Function} onReorder - Callback when order changes
 * @param {Function} onRemove - Callback when item is removed
 * @param {number} maxSelections - Maximum number of selections allowed
 */
const PreferenceList = ({
  electives = [],
  onReorder,
  onRemove,
  maxSelections = 5,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = electives.findIndex((e) => e.elective_id === active.id);
      const newIndex = electives.findIndex((e) => e.elective_id === over.id);

      const newOrder = arrayMove(electives, oldIndex, newIndex);
      onReorder?.(newOrder);
    }
  };

  if (electives.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            No Electives Selected
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Select electives from the available courses to add them to your
            preference list
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-text dark:text-text-dark">
            Your Preferences
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
            Drag to reorder • {electives.length} of {maxSelections} selected
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: maxSelections }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < electives.length
                  ? "bg-primary"
                  : "bg-backgroundAlt dark:bg-backgroundAlt-dark"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sortable List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={electives.map((e) => e.elective_id)}
          strategy={verticalListSortingStrategy}
        >
          {electives.map((elective, index) => (
            <SortableElectiveItem
              key={elective.elective_id}
              elective={elective}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Helper Text */}
      <div className="mt-4 p-4 bg-info/10 border border-info/30 rounded-lg">
        <p className="text-sm text-info">
          <strong>💡 Tip:</strong> Your first preference has the highest
          priority. Drag items to change the order based on your preference.
        </p>
      </div>
    </div>
  );
};

export default PreferenceList;
