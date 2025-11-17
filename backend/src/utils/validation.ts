/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validates username format
 * Requirements:
 * - 3-30 characters
 * - Only alphanumeric, underscore, and hyphen
 * - Must start with a letter
 * 
 * @param username - Username to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (username.length < 3 || username.length > 30) {
    return { isValid: false, message: 'Username must be between 3 and 30 characters' };
  }

  // Must start with a letter, contain only alphanumeric, underscore, hyphen
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(username)) {
    return { 
      isValid: false, 
      message: 'Username must start with a letter and contain only letters, numbers, underscores, and hyphens' 
    };
  }

  return { isValid: true };
};


export const sanitizeInput = (input: string): string => {
    return input
    .trim()
    .replace(/[<>]/g, '');
};


export const validateRegistration = (
    email: string,
    username: string,
    password: string,
): {isValid: boolean; message?: string} => {

    if(!isValidEmail(email)) {
        return { isValid: false, message: 'Invalid email format' };
    }

    // Validate username
    const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
        return usernameValidation;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return passwordValidation;
    }

    return{ isValid: true };
};

export const validateLogin = (
    email: string,
    password: string,
): { isValid: boolean; message?: string } => {

    if (!email || !password) {
        return { isValid: false, message: 'Email and password are required' };
    }

    if (!isValidEmail(email)) {
        return { isValid: false, message: 'Invalid email format' };
    }

    return { isValid: true };
};