import {
  isEmpty,
  validateEmail,
  validateName,
  validatePhone,
} from '../../components/Regex';

export const formConfig = [
  {
    label: 'First Name',
    key: 'firstName',
    handleValidation: (value, label) => {
      if (isEmpty(value, label)) return isEmpty(value, label);
      if (!validateName(value)) {
        return `Enter a valid ${label}`;
      }
      return false;
    },
  },
  {
    label: 'Last Name',
    key: 'lastName',
    handleValidation: (value, label) => {
      if (isEmpty(value, label)) return isEmpty(value, label);
      if (!validateName(value)) {
        return `Enter a valid ${label}`;
      }
      return false;
    },
  },
  {
    label: 'Email Address',
    key: 'email',
    isDisabledOnEdit: true,
    handleValidation: (value, label) => {
      if (isEmpty(value, label)) {
        return isEmpty(value, label);
      }
      if (!validateEmail(value)) {
        return `Enter a valid ${label}`;
      }
      return false;
    },
    type: 'email',
  },
  {
    label: 'Phone Number',
    key: 'phoneNumber',
    handleValidation: (value, label) => {
      if (isEmpty(value, label)) {
        return isEmpty(value, label);
      }
      if (!validatePhone(value)) {
        return `Enter a valid ${label}`;
      }
      return false;
    },
    type: 'number',
  },
  {
    label: 'Designation',
    key: 'designation',
    handleValidation: (value, label) => {
      if (isEmpty(value, label)) return isEmpty(value, label);
      return false;
    },
  },
];
