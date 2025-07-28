// Email validation utility - Safe for both client and server side
export const validateEmail = (email: string): boolean => {
  // Comprehensive email regex pattern
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Basic checks
  if (!email || typeof email !== "string") {
    return false;
  }

  // Check length (RFC 5321 limits)
  if (email.length > 254) {
    return false;
  }

  // Check for @ symbol
  if (!email.includes("@")) {
    return false;
  }

  // Split email into local and domain parts
  const [localPart, domain] = email.split("@");

  // Validate local part
  if (!localPart || localPart.length > 64) {
    return false;
  }

  // Validate domain
  if (!domain || domain.length > 253) {
    return false;
  }

  // Check for valid domain structure
  if (!domain.includes(".")) {
    return false;
  }

  // Use regex to validate overall format
  return emailPattern.test(email);
};
