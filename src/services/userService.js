import Gateway from '../gateway/gateway';

const changePasswordValidate = (currentPassword, newPassword) =>
  Gateway.post('user/change-password', { currentPassword, newPassword });

export default { changePasswordValidate };
