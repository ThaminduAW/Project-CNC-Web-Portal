export const validateTimeSlot = (timeSlot) => {
  if (!timeSlot.startTime || !timeSlot.endTime) {
    return 'Start time and end time are required';
  }

  if (!timeSlot.maxCapacity || timeSlot.maxCapacity < 1) {
    return 'Maximum capacity must be at least 1';
  }

  if (timeSlot.price < 0) {
    return 'Price cannot be negative';
  }

  // Convert time strings to minutes for comparison
  const startMinutes = convertTimeToMinutes(timeSlot.startTime);
  const endMinutes = convertTimeToMinutes(timeSlot.endTime);

  if (startMinutes >= endMinutes) {
    return 'End time must be after start time';
  }

  return null;
};

const convertTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}; 