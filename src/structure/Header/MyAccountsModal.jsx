import { useState, useEffect } from 'react';
import CustomModal from '../../components/CustomModal';
import useAuthReducer from '../../store/AuthReducer';
import '../../design/scss/profile.scss';

function MyAccountsModal({ show, onClose }) {
  const profileData = useAuthReducer((state) => state.profileData);
  const patchUserProfile = useAuthReducer((state) => state.patchUserProfile);
  const profileEditLoader = useAuthReducer((state) => state.profileEditLoader);
  const getUserProfile = useAuthReducer((state) => state.getUserProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    image: null,
  });

  useEffect(() => {
    if (show && profileData) {
      setFormData({
        name: profileData.name || profileData.firstName || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        image: profileData.avatar || profileData.image || null,
      });
      setIsEditing(false);
    }
  }, [show, profileData]);

  useEffect(() => {
    if (show && !profileData) {
      getUserProfile();
    }
  }, [show, profileData, getUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await patchUserProfile({
        value: {
          name: formData.name,
          phone: formData.phone,
          ...(formData.image && { avatar: formData.image }),
        },
        cb: () => {
          setIsEditing(false);
          getUserProfile();
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || profileData.firstName || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        image: profileData.avatar || profileData.image || null,
      });
    }
    setIsEditing(false);
  };

  const getUserInitial = () => {
    const name = formData.name || profileData?.name || profileData?.firstName || 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderBody = () => (
    <div className="modal-body">
      <div className="profile-sec">
        <div className="profile-inner">
          {/* User Image */}
          <div className="profile-img">
            {formData.image ? (
              <img src={formData.image} alt="User" />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#00368c',
                  color: '#fff',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                }}
              >
                {getUserInitial()}
              </div>
            )}
            {isEditing && (
              <label
                htmlFor="image-upload"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: '#00368c',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid #fff',
                }}
              >
                <span style={{ fontSize: '18px' }}>📷</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* User Details */}
          <div className="profile-details">
            <div className="row permInputs">
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Name"
                  />
                  <label htmlFor="name">Name</label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Phone"
                  />
                  <label htmlFor="phone">Phone</label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                    placeholder="Email"
                  />
                  <label htmlFor="email">Email</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-btn two-btn">
          {!isEditing ? (
            <button
              type="button"
              className="btn-common edit-btn"
              onClick={handleEdit}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-common close"
                onClick={handleCancel}
                disabled={profileEditLoader}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-common green-btn"
                onClick={handleSave}
                disabled={profileEditLoader}
              >
                {profileEditLoader ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <CustomModal
      className="modal fade show modal_backdrop"
      dialgName="modal-dialog modal-dialog-centered"
      createModal
      show={show}
      closeModal={() => {
        setIsEditing(false);
        onClose();
      }}
      header={
        <div className="modal-header">
          <h5 className="modal-title">My Accounts</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
      }
      body={renderBody()}
    />
  );
}

export default MyAccountsModal;

