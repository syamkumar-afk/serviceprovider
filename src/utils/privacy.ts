export function maskSensitiveData(text: string): string {
  if (!text) return text;

  // Mask Emails: Leaves first character, masks until the domain (e.g. j***@example.com)
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  let sanitizedText = text.replace(emailRegex, (match) => {
    const [localPart, domain] = match.split('@');
    if (localPart.length <= 2) {
      return `***@${domain}`;
    }
    return `${localPart[0]}***@${domain}`;
  });

  // Mask Phone Numbers: Looks for sequences of 7+ digits, spaces, dashes, or dots
  const phoneRegex = /(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{1,4})?)/g;
  
  sanitizedText = sanitizedText.replace(phoneRegex, (match) => {
    const digitCount = (match.match(/\d/g) || []).length;
    // Only mask if the match contains at least 7 digits to avoid false positives (e.g. prices)
    if (digitCount >= 7) {
      return '[PHONE HIDDEN]';
    }
    return match;
  });

  return sanitizedText;
}
