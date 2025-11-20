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
  return toast(message, {
    icon: () => <img src={icons[type]} alt="img" />,
    position: toastPosition
      ? toast.POSITION[toastPosition]
      : toast.POSITION.TOP_RIGHT,
    autoClose: 2000,
    pauseOnFocusLoss: true,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    toastId: type,
    className: type,
    progressStyle: { backgroundColor: colors[type] },
    onClose: () => clear(),
  });
};

const Toaster = () => {
  const value = useAlertReducer((state) => state.value);
  const clear = useAlertReducer((state) => state.clear);

  useEffect(() => {
    if (value?.message) {
      notify(value?.message, value.type, 'top', clear);
    }
  }, [value]);

  return null;
};

export default Toaster;
