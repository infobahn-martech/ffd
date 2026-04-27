/* eslint-disable react-refresh/only-export-components */
import { toast } from 'react-toastify';
import _ from 'lodash';
import { useEffect } from 'react';
import successIcon from '../assets/images/toast-success.svg';
import failedIcon from '../assets/images/toast-fail.svg';
import infoIcon from '../assets/images/toast-info.svg';
import warnIcon from '../assets/images/toast-warning.svg';
import 'react-toastify/dist/ReactToastify.css';
import useAlertReducer from '../store/AlertReducer';
import '../design/scss/toast.scss';

const icons = {
  success: successIcon,
  error: failedIcon,
  warn: warnIcon,
  info: infoIcon,
};

const colors = {
  success: '#65BD50',
  error: '#FF5F60',
  warn: '#EF934D',
  info: '#0263D1',
};

export const notify = (message, type, toastPosition, clear) => {
  if (!_.includes(['success', 'error', 'warn', 'info'], type)) return;

  // Map position string to valid toast position (using string literals for v10+)
  const getPosition = (pos) => {
    if (!pos) return 'top-right';
    const upperPos = pos.toUpperCase();
    // Handle shorthand positions
    if (upperPos === 'TOP') return 'top-center';
    if (upperPos === 'BOTTOM') return 'bottom-center';
    // Map common position formats to string literals
    const positionMap = {
      'TOP_LEFT': 'top-left',
      'TOP_CENTER': 'top-center',
      'TOP_RIGHT': 'top-right',
      'BOTTOM_LEFT': 'bottom-left',
      'BOTTOM_CENTER': 'bottom-center',
      'BOTTOM_RIGHT': 'bottom-right',
    };
    return positionMap[upperPos] || 'top-right';
  };

  toast.dismiss();

  return toast(message, {
    icon: () => <img src={icons[type]} alt="img" />,
    position: getPosition(toastPosition),
    autoClose: 2000,
    pauseOnFocusLoss: true,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    toastId: `${type}-${Date.now()}-${Math.random()}`,
    className: type,
    progressStyle: { backgroundColor: colors[type] },
    onClose: () => {
      if (typeof clear === 'function') clear();
    },
  });
};

const Toaster = () => {
  const value = useAlertReducer((state) => state.value);
  const clear = useAlertReducer((state) => state.clear);

  useEffect(() => {
    if (value?.message) {
      notify(value?.message, value.type, 'top-center', clear);
    }
  }, [value, clear]);

  return null;
};

export default Toaster;
