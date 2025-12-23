import { useState, useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';
import CustomModal from '../../components/CustomModal';
import useAuthReducer from '../../store/AuthReducer';
import '../../design/scss/profile.scss';
import '../../design/scss/prospect-modal.scss';

function MyAccountsModal({ show, onClose }) {
  const profileData = useAuthReducer((state) => state.profileData);
  const patchUserProfile = useAuthReducer((state) => state.patchUserProfile);
  const profileEditLoader = useAuthReducer((state) => state.profileEditLoader);
  const getUserProfile = useAuthReducer((state) => state.getUserProfile);

  // Dummy data for demonstration
  const DUMMY_DATA = {
    firstName: 'John',
    lastName: 'Smith',
    phone: '+971 50 123 4567',
    email: 'john.smith@example.com',
    image: 'https://ui-avatars.com/api/?name=John+Smith&background=00368c&color=fff&size=200',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    image: null,
  });

  useEffect(() => {
    if (show) {
      // Use profile data if available, otherwise use dummy data
      const data = profileData || DUMMY_DATA;
      setFormData({
        firstName: data.firstName || DUMMY_DATA.firstName,
        lastName: data.lastName || DUMMY_DATA.lastName,
        phone: data.phone || DUMMY_DATA.phone,
        email: data.email || DUMMY_DATA.email,
        image: data.avatar || data.image || DUMMY_DATA.image,
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
          firstName: formData.firstName,
          lastName: formData.lastName,
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
    const data = profileData || DUMMY_DATA;
    setFormData({
      firstName: data.firstName || DUMMY_DATA.firstName,
      lastName: data.lastName || DUMMY_DATA.lastName,
      phone: data.phone || DUMMY_DATA.phone,
      email: data.email || DUMMY_DATA.email,
      image: data.avatar || data.image || DUMMY_DATA.image,
    });
    setIsEditing(false);
  };

  const getUserInitial = () => {
    const firstName = formData.firstName || profileData?.firstName || DUMMY_DATA.firstName;
    return firstName.charAt(0).toUpperCase();
  };

  const renderBody = () => (
    <div className="modal-body">
      <div className="profile-sec">
        <div className="profile-inner">
          {/* User Image */}
          <div className="profile-img" style={{ position: 'relative' }}>
            {formData.image ? (
              <img
                src={formData.image}
                alt="User"
              />
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
                  fontSize: '64px',
                  fontWeight: 'bold',
                  borderRadius: '100px',
                }}
              >
                {getUserInitial()}
              </div>
            )}
            {isEditing && (
              <label
                htmlFor="image-upload"
                className="camera-upload-btn"
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: '#00368c',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#002a6b';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00368c';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <FiCamera size={18} />
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
              <div className="col-md-6 mb-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="First Name"
                    style={{
                      backgroundColor: !isEditing ? '#f8f9fc' : '#fff',
                      cursor: !isEditing ? 'not-allowed' : 'text',
                    }}
                  />
                  <label htmlFor="firstName">First Name</label>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Last Name"
                    style={{
                      backgroundColor: !isEditing ? '#f8f9fc' : '#fff',
                      cursor: !isEditing ? 'not-allowed' : 'text',
                    }}
                  />
                  <label htmlFor="lastName">Last Name</label>
                </div>
              </div>

              <div className="col-md-6 mb-4">
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
                    style={{
                      backgroundColor: !isEditing ? '#f8f9fc' : '#fff',
                      cursor: !isEditing ? 'not-allowed' : 'text',
                    }}
                  />
                  <label htmlFor="phone">Phone</label>
                </div>
              </div>

              <div className="col-md-6 mb-4">
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
                    style={{
                      backgroundColor: '#f8f9fc',
                      cursor: 'not-allowed',
                      opacity: 0.7,
                    }}
                  />
                  <label htmlFor="email">Email</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-btn two-btn" style={{ marginTop: '40px' }}>
          {!isEditing ? (
            <>
              <button
                type="button"
                className="btn-common close"
                onClick={() => {
                  setIsEditing(false);
                  onClose();
                }}
                style={{
                  padding: '12px 48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c5e0e2';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DEF0F2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-common edit-btn"
                onClick={handleEdit}
                style={{
                  padding: '12px 48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c5e0e2';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DEF0F2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-common close"
                onClick={handleCancel}
                disabled={profileEditLoader}
                style={{
                  padding: '12px 48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!profileEditLoader) {
                    e.currentTarget.style.backgroundColor = '#c5e0e2';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DEF0F2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-common green-btn"
                onClick={handleSave}
                disabled={profileEditLoader}
                style={{
                  padding: '12px 48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!profileEditLoader) {
                    e.currentTarget.style.backgroundColor = '#002a6b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00368c';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
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
      className="modal fade show modal_backdrop custom-mod"
      dialgName="modal-dialog modal-dialog-centered"
      createModal
      show={show}
      closeModal={() => {
        setIsEditing(false);
        onClose();
      }}
      header={
        <div className="modal-header">
          <h5 className="modal-title" style={{
            color: '#00368c',
            fontSize: '24px',
            fontWeight: '600',
            fontFamily: '"Poppins", sans-serif',
          }}>
            My Accounts
          </h5>
        </div>
      }
      body={renderBody()}
    />
  );
}

export default MyAccountsModal;

