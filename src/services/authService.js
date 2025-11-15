import Gateway from '../gateway/gateway';

const doLoginValidate = (email, password) =>
  Gateway.post('auth/signin', { email, password });

const googleLoginValidate = (idToken, tokenType) =>
  Gateway.post('auth/google-signin', {
    idToken,
    tokenType,
  });

const getUserProfile = () => Gateway.get('user/profile');

const editUserProfile = (value) =>
  Gateway.patch('user/profile', value, {
    headers: { 'Content-Type': 'Multipart/formdata' },
  });

export default {
  doLoginValidate,
  googleLoginValidate,
  getUserProfile,
  editUserProfile,
};
