// Server-side validation utilities

/**
 * Sanitize input by trimming and removing dangerous characters
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

/**
 * Validate and sanitize profile update data against User model constraints
 */
export const validateProfileUpdate = (data) => {
  const errors = [];
  const sanitized = {};

  // Email (required for lookup, not updated)
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    sanitized.email = data.email.trim().toLowerCase();
  }

  // Full Name (max 20 chars)
  if (data.fullName !== undefined) {
    if (typeof data.fullName !== 'string') {
      errors.push('Full name must be a string');
    } else {
      const sanitizedFullName = sanitizeInput(data.fullName);
      if (sanitizedFullName.length > 20) {
        errors.push(`Full name is too long (max 20 characters, got ${sanitizedFullName.length})`);
      } else if (sanitizedFullName.length < 2) {
        errors.push('Full name must be at least 2 characters');
      } else {
        sanitized.fullName = sanitizedFullName;
      }
    }
  }

  // Country (max 50 chars)
  if (data.country !== undefined) {
    if (typeof data.country !== 'string') {
      errors.push('Country must be a string');
    } else {
      const sanitizedCountry = sanitizeInput(data.country);
      if (sanitizedCountry.length > 50) {
        errors.push(`Country name is too long (max 50 characters)`);
      } else {
        sanitized.country = sanitizedCountry;
      }
    }
  }

  // Phone (max 15 chars)
  if (data.phone !== undefined) {
    if (typeof data.phone !== 'string') {
      errors.push('Phone must be a string');
    } else {
      const sanitizedPhone = sanitizeInput(data.phone);
      if (sanitizedPhone.length > 15) {
        errors.push(`Phone number is too long (max 15 characters)`);
      } else if (sanitizedPhone.length < 3) {
        errors.push('Phone number is too short (min 3 characters)');
      } else {
        sanitized.phone = sanitizedPhone;
      }
    }
  }

  // Address (max 50 chars)
  if (data.address !== undefined) {
    if (typeof data.address !== 'string') {
      errors.push('Address must be a string');
    } else {
      const sanitizedAddress = sanitizeInput(data.address);
      if (sanitizedAddress.length > 50) {
        errors.push(`Address is too long (max 50 characters, got ${sanitizedAddress.length})`);
      } else if (sanitizedAddress.length < 3) {
        errors.push('Address is too short (min 3 characters)');
      } else {
        sanitized.address = sanitizedAddress;
      }
    }
  }

  // State (max 50 chars)
  if (data.state !== undefined) {
    if (typeof data.state !== 'string') {
      errors.push('State must be a string');
    } else {
      const sanitizedState = sanitizeInput(data.state);
      if (sanitizedState.length > 50) {
        errors.push(`State name is too long (max 50 characters)`);
      } else if (sanitizedState.length < 2) {
        errors.push('State name is too short (min 2 characters)');
      } else {
        sanitized.state = sanitizedState;
      }
    }
  }

  // City (max 50 chars)
  if (data.city !== undefined) {
    if (typeof data.city !== 'string') {
      errors.push('City must be a string');
    } else {
      const sanitizedCity = sanitizeInput(data.city);
      if (sanitizedCity.length > 50) {
        errors.push(`City name is too long (max 50 characters)`);
      } else if (sanitizedCity.length < 2) {
        errors.push('City name is too short (min 2 characters)');
      } else {
        sanitized.city = sanitizedCity;
      }
    }
  }

  // Zip Code (max 50 chars)
  if (data.zipCode !== undefined) {
    if (typeof data.zipCode !== 'string') {
      errors.push('Zip code must be a string');
    } else {
      const sanitizedZipCode = sanitizeInput(data.zipCode);
      if (sanitizedZipCode.length > 50) {
        errors.push(`Zip code is too long (max 50 characters)`);
      } else if (sanitizedZipCode.length < 3) {
        errors.push('Zip code is too short (min 3 characters)');
      } else {
        sanitized.zipCode = sanitizedZipCode;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Create user-friendly error message for client
 */
export const createErrorMessage = (errors) => {
  if (errors.length === 0) return 'An error occurred';
  if (errors.length === 1) return errors[0];
  return `Multiple validation errors: ${errors.join(', ')}`;
};
