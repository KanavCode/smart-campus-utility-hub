/**
 * Password Validation Utilities
 * Provides strong password validation and requirements checking
 */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // 0: very weak, 4: very strong
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  message: string;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns PasswordStrength object with score and requirements
 */
export const validatePasswordStrength = (password: string): PasswordStrength => {
  const strength: PasswordStrength = {
    score: 0,
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
    message: ''
  };

  // Calculate score
  let score = 0;
  if (strength.hasLength) score++;
  if (strength.hasUppercase) score++;
  if (strength.hasLowercase) score++;
  if (strength.hasNumber) score++;
  if (strength.hasSpecial) score++;

  // Adjust score if only meets minimum requirements
  if (password.length < 8) {
    score = 0;
  } else if (password.length < 12) {
    score = Math.min(score, 2);
  }

  strength.score = (score > 4 ? 4 : score) as 0 | 1 | 2 | 3 | 4;

  // Generate message
  if (!strength.hasLength) {
    strength.message = 'Password must be at least 8 characters long';
  } else if (!strength.hasUppercase) {
    strength.message = 'Add an uppercase letter';
  } else if (!strength.hasLowercase) {
    strength.message = 'Add a lowercase letter';
  } else if (!strength.hasNumber) {
    strength.message = 'Add a number';
  } else if (!strength.hasSpecial) {
    strength.message = 'Add a special character (@$!%*?&)';
  } else if (strength.score === 4) {
    strength.message = 'Strong password!';
  } else if (strength.score === 3) {
    strength.message = 'Good password';
  } else {
    strength.message = 'Weak password - consider a longer one';
  }

  return strength;
};

/**
 * Check if password is valid for reset
 * @param password - Password to validate
 * @returns true if password meets all requirements
 */
export const isValidPassword = (password: string): boolean => {
  const strength = validatePasswordStrength(password);
  return (
    strength.hasLength &&
    strength.hasUppercase &&
    strength.hasLowercase &&
    strength.hasNumber &&
    strength.hasSpecial
  );
};

/**
 * Get password strength color
 * @param score - Password strength score (0-4)
 * @returns Color class name for UI
 */
export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
      return 'text-red-600';
    case 1:
      return 'text-orange-600';
    case 2:
      return 'text-yellow-600';
    case 3:
      return 'text-lime-600';
    case 4:
      return 'text-green-600';
    default:
      return 'text-gray-400';
  }
};

/**
 * Get password strength bar color
 * @param score - Password strength score (0-4)
 * @returns Background color class for strength bar
 */
export const getPasswordStrengthBarColor = (score: number): string => {
  switch (score) {
    case 0:
      return 'bg-red-500';
    case 1:
      return 'bg-orange-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-lime-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-200';
  }
};

/**
 * Get password requirements checklist
 * @param password - Password to check
 * @returns Array of requirements with completion status
 */
export const getPasswordRequirements = (password: string) => {
  const strength = validatePasswordStrength(password);
  return [
    { text: 'At least 8 characters', met: strength.hasLength },
    { text: 'Uppercase letter (A-Z)', met: strength.hasUppercase },
    { text: 'Lowercase letter (a-z)', met: strength.hasLowercase },
    { text: 'Number (0-9)', met: strength.hasNumber },
    { text: 'Special character (@$!%*?&)', met: strength.hasSpecial }
  ];
};
