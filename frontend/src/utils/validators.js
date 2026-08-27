export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters long.';
  }
  if (name.trim().length > 100) {
    return 'Name must be less than 100 characters.';
  }
  return null;
};

export const validateDOB = (dob) => {
  if (!dob) {
    return 'Date of birth is required.';
  }
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    return 'Invalid date format.';
  }
  const today = new Date();
  if (date > today) {
    return 'Date of birth cannot be in the future.';
  }
  return null;
};
