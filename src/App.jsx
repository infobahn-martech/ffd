import 'react-toastify/dist/ReactToastify.css';
import './design/scss/common.scss';

import { Outlet } from 'react-router-dom';

import { ToastContainer, Zoom } from 'react-toastify';

import Toaster from './components/Toaster';
import FirstLoginPasswordModal from './pages/Authentication/FirstLoginPasswordModal';

function App() {
  return (
    <>
      <ToastContainer
        closeButton
        transition={Zoom}
        icon={false}
        theme="light"
      />
      <Toaster />
      <FirstLoginPasswordModal />
      <Outlet />
    </>
  );
}

export default App;
