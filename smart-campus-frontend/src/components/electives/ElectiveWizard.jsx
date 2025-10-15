import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/**
 * ElectiveWizard Component
 *
 * Multi-step wizard for elective selection process
 * Shows progress and handles navigation between steps
 *
 * @param {Array} steps - Array of step configurations
 * @param {number} currentStep - Current active step index
 * @param {Function} onStepChange - Callback when step changes
 * @param {Function} onComplete - Callback when wizard is completed
 * @param {boolean} canGoNext - Whether next button should be enabled
 * @param {boolean} canGoBack - Whether back button should be enabled
 * @param {React.Node} children - Step content
 */

const ElectiveWizard = ({
  steps = [],
  currentStep = 0,
  onStepChange,
  onComplete,
  canGoNext = true,
  canGoBack = true,
  children,
}) => {
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange?.(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                  transition: { duration: 0.3 },
                }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  transition-all duration-300
                  ${
                    index < currentStep
                      ? "bg-success text-white"
                      : index === currentStep
                      ? "bg-primary text-white shadow-lg ring-4 ring-primary/30"
                      : "bg-backgroundAlt dark:bg-backgroundAlt-dark text-text-secondary dark:text-text-secondary-dark"
                  }
                `}
              >
                {index < currentStep ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </motion.div>

              {/* Step Label */}
              <div className="text-center">
                <p
                  className={`
                  text-sm font-medium transition-colors
                  ${
                    index === currentStep
                      ? "text-primary dark:text-primary-light"
                      : index < currentStep
                      ? "text-text dark:text-text-dark"
                      : "text-text-secondary dark:text-text-secondary-dark"
                  }
                `}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1 hidden md:block">
                    {step.subtitle}
                  </p>
                )}
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className="hidden sm:block absolute top-5 w-full h-0.5 bg-backgroundAlt dark:bg-backgroundAlt-dark -z-10"
                  style={{
                    left: "50%",
                    width: `calc(100% / ${steps.length})`,
                    transform: "translateY(-50%)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBack}
          disabled={!canGoBack || currentStep === 0}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
            ${
              currentStep === 0 || !canGoBack
                ? "bg-backgroundAlt dark:bg-backgroundAlt-dark text-text-secondary dark:text-text-secondary-dark cursor-not-allowed opacity-50"
                : "bg-backgroundAlt dark:bg-backgroundAlt-dark text-text dark:text-text-dark hover:bg-border dark:hover:bg-border-dark"
            }
          `}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </motion.button>

        <div className="flex items-center gap-3">
          {/* Step Counter */}
          <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Step {currentStep + 1} of {steps.length}
          </span>

          {/* Next/Complete Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!canGoNext}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
              ${
                !canGoNext
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : isLastStep
                  ? "bg-gradient-to-r from-success to-green-600 text-white shadow-lg hover:shadow-xl"
                  : "bg-primary hover:bg-primary-light text-white shadow-lg hover:shadow-xl"
              }
            `}
          >
            {isLastStep ? (
              <>
                Complete
                <CheckIcon className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRightIcon className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ElectiveWizard;
