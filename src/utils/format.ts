/**
 * Utility functions for handling dates consistently across server and client
 */

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatDateTime = (
  dateString: string,
  timeString: string
): string => {
  try {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} at ${timeString}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return `${dateString} at ${timeString}`;
  }
};

export const isEventPast = (dateString: string): boolean => {
  try {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

export const formatCurrency = (amount: number | string): string => {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `IDR ${amount}`;
  }
};
