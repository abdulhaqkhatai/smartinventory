// Utility to generate unique codes for different entities

const codeCounters = {
  IND: 0,
  PO: 0,
  GRN: 0,
};

/**
 * Generate unique code for entities
 * Examples:
 * - IND-2024-001, IND-2024-002, ...
 * - PO-2024-001, PO-2024-002, ...
 * - GRN-2024-001, GRN-2024-002, ...
 */
export const generateCode = async (prefix) => {
  try {
    const year = new Date().getFullYear();
    
    // In production, this should query the database to get the next sequence
    // For now, we'll use a simple in-memory counter
    if (!codeCounters[prefix]) {
      codeCounters[prefix] = 0;
    }

    codeCounters[prefix]++;
    const timestamp = Date.now().toString(36).toUpperCase();
    const sequence = String(codeCounters[prefix]).padStart(2, '0');

    return `${prefix}-${year}-${timestamp}-${sequence}`;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

/**
 * Reset code counters (useful for testing)
 */
export const resetCodeCounters = () => {
  Object.keys(codeCounters).forEach((key) => {
    codeCounters[key] = 0;
  });
};
