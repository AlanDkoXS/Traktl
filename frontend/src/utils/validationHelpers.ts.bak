/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns true if the string is a valid ObjectId, false otherwise
 */
export const isValidObjectId = (id: string | undefined | null): boolean => {
  if (!id) return false;
  // MongoDB ObjectId is a 24 character hex string
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

/**
 * Safely converts a value to an ObjectId compatible string
 * Returns undefined if the value is not valid to prevent sending invalid IDs
 */
export const toObjectIdOrUndefined = (value: string | undefined | null): string | undefined => {
  if (isValidObjectId(value)) {
    return value as string;
  }
  return undefined;
};
