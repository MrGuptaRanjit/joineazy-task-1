/**
 * Date utility functions for consistent, timezone-safe date and time display.
 */

export function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const defaultOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

export function isPastDue(dateString) {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date.getTime() < Date.now();
  } catch {
    return false;
  }
}

export function isDueSoon(dateString, hours = 48) {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const now = Date.now();
    const diff = date.getTime() - now;
    return diff > 0 && diff <= hours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
