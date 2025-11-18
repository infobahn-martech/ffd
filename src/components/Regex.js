const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const phoneRegex = /^\d{6,15}$/;

const nameRegex = /^[A-Za-z'.\-\s]+$/;

export const validateEmail = (val) => emailRegex.test(val);

export const validatePhone = (val) => phoneRegex.test(val);

export const validateName = (val) => nameRegex.test(val);

export const isEmpty = (value, label) => {
  if (!value?.trim()) {
    return `${label} is required`;
  }
  return false;
};
