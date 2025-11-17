export const getAuthData = () => {
  let isLoggedIn = false;
  if (
    localStorage.getItem('accessToken') &&
    localStorage.getItem('accessToken').length
  ) {
    isLoggedIn = true;
  }
  return {
    isLoggedIn,
  };
};

export const setItem = (key, value) => localStorage.setItem(key, value);
export const getItem = (key) => localStorage.getItem(key);
export const removeItem = (key) => localStorage.removeItem(key);
