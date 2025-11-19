/* eslint-disable no-unused-vars */
import {
  isEmpty,
  validateEmail,
  validateName,
  validatePhone,
} from '../../components/Regex';

export const formConfig = [
  {
    label: 'First Name',
    key: 'name',
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
    key: 'company',
    hideRequireSymbol: true,
    handleValidation: (value, label) => {
      return false;
    },
  },
  {
    label: 'Company',
    key: 'company',
    hideRequireSymbol: true,
    handleValidation: () => {
      return false;
    },
  },
  {
    label: 'Email',
    key: 'email',
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
];
