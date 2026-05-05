import { useState, useEffect, useRef, useCallback } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { FiCamera } from 'react-icons/fi';
import CustomModal from '../../components/CustomModal';
import authService from '../../services/authService';
import { getItem } from '../../helpers/localStorage';
import '../../design/scss/profile.scss';
import '../../design/scss/prospect-modal.scss';
import '../../design/scss/form-designs.scss';
import './MyAccountsModal.scss';

function resolveUserImageUrl(image) {
  if (!image || typeof image !== 'string') return null;
  const trimmed = image.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const root = (import.meta.env.VITE_API_ENDPOINT || '').replace(/\/?$/, '/');
  return `${root}${trimmed.replace(/^\//, '')}`;
}

function mapApiUserToForm(data) {
  const fullName = data?.name?.trim() || '';
  const resolvedImage = resolveUserImageUrl(data?.image);

  return {
    firstName: fullName,
    phone: (data?.phone && String(data.phone).replace(/\D/g, '')) || '',
    email: data?.email || '',
    image: resolvedImage,
  };
}

function MyAccountsModal({ show, onClose }) {
  const profileEditLoader = false;

  const baselineRef = useRef(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    email: '',
    image: null,
  });

  const applyFormFromUser = useCallback((userPayload) => {
    const next = mapApiUserToForm(userPayload);
    setFormData(next);
    baselineRef.current = next;
  }, []);

  useEffect(() => {
    if (!show) return undefined;

    let cancelled = false;

    const load = async () => {
      setFetchLoading(true);
      setFetchError('');
      try {
        const userId = getItem('userid') || '1';
        const res = await authService.getUserDetail(userId);
        const payload = res?.data?.data ?? res?.data;
        if (cancelled) return;
        if (payload && typeof payload === 'object') {
          applyFormFromUser(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              'Failed to load account details.',
          );
        }
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [show, applyFormFromUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value || '' }));
    setErrors((prev) => {
      if (!prev.phone) return prev;
      const next = { ...prev };
      delete next.phone;
      return next;
    });
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
        setErrors((prev) => {
          if (!prev.avatar) return prev;
          const next = { ...prev };
          delete next.avatar;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.firstName?.trim()) {
      next.firstName = 'First name is required';
    }
    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      next.phone = 'Phone is required';
    }
    if (!formData.email?.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = 'Enter a valid email';
    }
    if (!formData.image) {
      next.avatar = 'Avatar is required — please upload a profile photo';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEdit = () => {
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (baselineRef.current) {
      setFormData({ ...baselineRef.current });
    }
    setErrors({});
    setIsEditing(false);
  };

  const getUserInitial = () => {
    const ch = formData.firstName?.trim()?.charAt(0);
    if (ch) return ch.toUpperCase();
    const fromEmail = formData.email?.trim()?.charAt(0);
    return fromEmail ? fromEmail.toUpperCase() : '?';
  };

  const renderBody = () => (
    <div className="modal-body">
      <div className="profile-sec my-accounts-premium">
        {fetchLoading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!fetchLoading && fetchError && (
          <div className="alert alert-danger" role="alert">
            {fetchError}
          </div>
        )}

        {!fetchLoading && !fetchError && (
          <>
            <div className="my-accounts-premium-inner">
              <div className="my-accounts-avatar-col">
                <div className="my-accounts-avatar">
                  <div className="profile-img" style={{ position: 'relative' }}>
                    {formData.image ? (
                      <img src={formData.image} alt="" />
                    ) : (
                      <div className="my-accounts-initial">{getUserInitial()}</div>
                    )}
                    {isEditing && (
                      <label
                        htmlFor="image-upload"
                        className="camera-upload-btn"
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          backgroundColor: '#00368c',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '42px',
                          height: '42px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#002a6b';
                          e.currentTarget.style.transform = 'scale(1.06)';
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
                </div>
                {errors.avatar && (
                  <div className="text-danger small mt-3 text-center px-1" style={{ maxWidth: '240px' }}>
                    {errors.avatar}
                  </div>
                )}
              </div>

              <div className="profile-details my-accounts-fields">
                <div className="row permInputs g-4">
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        id="accountFullName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="First name"
                        autoComplete="name"
                        style={{
                          backgroundColor: !isEditing ? '#f8f9fc' : '#fff',
                          cursor: !isEditing ? 'not-allowed' : 'text',
                        }}
                      />
                      <label htmlFor="accountFullName">
                        First name <span className="text-danger">*</span>
                      </label>
                      {errors.firstName && (
                        <span className="error text-danger small d-block mt-1">{errors.firstName}</span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="phone-wrapper">
                      <label className="phone-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <PhoneInput
                        country="sa"
                        enableSearch
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        disabled={!isEditing}
                        inputClass={`phone-input ${errors.phone ? 'is-invalid' : ''}`}
                        buttonClass="phone-flag"
                      />
                      {errors.phone && (
                        <span className="error text-danger small d-block mt-1">{errors.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Email"
                        autoComplete="email"
                        style={{
                          backgroundColor: !isEditing ? '#f8f9fc' : '#fff',
                          cursor: !isEditing ? 'not-allowed' : 'text',
                          opacity: !isEditing ? 0.95 : 1,
                        }}
                      />
                      <label htmlFor="email">
                        Email <span className="text-danger">*</span>
                      </label>
                      {errors.email && (
                        <span className="error text-danger small d-block mt-1">{errors.email}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-accounts-actions profile-btn two-btn">
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
                    onClick={() => {
                      if (!validate()) return;
                      baselineRef.current = { ...formData };
                      setIsEditing(false);
                    }}
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
          </>
        )}
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
        <div className="modal-header my-accounts-premium-header border-0 pb-0">
          <h5 className="modal-title my-accounts-premium-title">My Accounts</h5>
        </div>
      }
      body={renderBody()}
    />
  );
}

export default MyAccountsModal;
