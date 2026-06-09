import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  User, Package, Heart, Store, Gift, CreditCard, Bell, Headphones, Megaphone, Download,
  Edit3, MapPin, Home, ChevronRight, ArrowLeft, Check, X, Shield, Lock
} from "lucide-react";
import "./Profile.css";

const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: User, path: '/profile' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/profile?tab=orders' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist' },
  { id: 'seller', label: 'Become a Seller', icon: Store, path: '/profile?tab=seller' },
  { id: 'rewards', label: 'Rewards', icon: Gift, path: '/profile?tab=rewards' },
  { id: 'giftcards', label: 'Gift Cards', icon: CreditCard, path: '/profile?tab=giftcards' },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell, path: '/profile?tab=notifications' },
  { id: 'care', label: '24x7 Customer Care', icon: Headphones, path: '/profile?tab=care' },
  { id: 'advertise', label: 'Advertise', icon: Megaphone, path: '/profile?tab=advertise' },
  { id: 'download', label: 'Download App', icon: Download, path: '/profile?tab=download' },
];

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";
  const navigate = useNavigate();

  // Load user data from localStorage or default values
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("shopease_profile_data");
    const defaultEmail = localStorage.getItem("shopease_user_email") || "pooja@gmail.com";
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, email: defaultEmail };
    }
    
    return {
      firstName: "Pooja",
      lastName: "Gilada",
      email: defaultEmail,
      mobile: "+91 9876543210",
      dob: "1998-03-12",
      gender: "Female"
    };
  });

  // State to manage editing profile details
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...profileData });

  // State to manage editing address details
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState(() => {
    const saved = localStorage.getItem("shopease_address_data");
    if (saved) return JSON.parse(saved);
    return {
      type: "Home",
      isDefault: true,
      line1: "45, Shreem Avenue, Near Iscon Temple, Satellite",
      city: "Ahmedabad",
      state: "Gujarat",
      pinCode: "380015",
      country: "India",
      phone: "+91 9876543210"
    };
  });
  const [addressFormData, setAddressFormData] = useState({ ...addressData });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleEditProfileToggle = () => {
    setEditFormData({ ...profileData });
    setIsEditing(!isEditing);
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData(editFormData);
    localStorage.setItem("shopease_profile_data", JSON.stringify(editFormData));
    setIsEditing(false);
  };

  const handleEditAddressToggle = () => {
    setAddressFormData({ ...addressData });
    setIsEditingAddress(!isEditingAddress);
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddressData(addressFormData);
    localStorage.setItem("shopease_address_data", JSON.stringify(addressFormData));
    setIsEditingAddress(false);
  };

  return (
    <div className="profile-page-container">
      {/* Top Navigation / Breadcrumbs */}
      <div className="profile-header-nav">
        <Link to="/" className="profile-back-link">
          <ArrowLeft size={16} />
          <span>Back to Shop</span>
        </Link>
        <div className="profile-badge-tag">User Account</div>
      </div>

      <div className="profile-layout-grid">
        {/* Left Navigation Sidebar */}
        <aside className="profile-sidebar-nav">
          <div className="user-brief-card">
            <div className="user-avatar-circle">
              {profileData.firstName.charAt(0).toUpperCase()}
              {profileData.lastName.charAt(0).toUpperCase()}
            </div>
            <div className="user-brief-info">
              <span className="user-brief-greeting">Hello,</span>
              <h3 className="user-brief-name">{profileData.firstName} {profileData.lastName}</h3>
            </div>
          </div>
          <div className="sidebar-divider" />
          <ul className="sidebar-link-list">
            {SIDEBAR_ITEMS.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentTab === item.id;
              
              if (item.path.startsWith('/profile')) {
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setSearchParams({ tab: item.id })}
                      className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                    >
                      <IconComponent size={16} className="sidebar-icon" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              } else {
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className="sidebar-nav-btn"
                    >
                      <IconComponent size={16} className="sidebar-icon" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        </aside>

        {/* Right Content Area */}
        <main className="profile-content-pane">
          {currentTab === "profile" && (
            <div className="profile-tab-content">
              {/* Tab Header */}
              <div className="pane-header-box">
                <div className="pane-title-group">
                  <h1>My Profile</h1>
                  <p>Manage your personal information and account details</p>
                </div>
              </div>

              {/* Personal Information Section */}
              <section className="profile-card-section">
                <div className="section-header-row">
                  <h2 className="section-title">Personal Information</h2>
                  {!isEditing ? (
                    <button onClick={handleEditProfileToggle} className="profile-action-btn">
                      <Edit3 size={15} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="edit-actions-group">
                      <button onClick={handleSaveProfile} className="profile-save-btn">
                        <Check size={15} />
                        <span>Save</span>
                      </button>
                      <button onClick={handleEditProfileToggle} className="profile-cancel-btn">
                        <X size={15} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="details-info-grid">
                    <div className="info-card-field">
                      <label className="info-field-label">First Name</label>
                      <div className="info-field-value">{profileData.firstName}</div>
                    </div>
                    <div className="info-card-field">
                      <label className="info-field-label">Last Name</label>
                      <div className="info-field-value">{profileData.lastName}</div>
                    </div>
                    <div className="info-card-field">
                      <label className="info-field-label">Email Address</label>
                      <div className="info-field-value">{profileData.email}</div>
                    </div>
                    <div className="info-card-field">
                      <label className="info-field-label">Mobile Number</label>
                      <div className="info-field-value">{profileData.mobile}</div>
                    </div>
                    <div className="info-card-field">
                      <label className="info-field-label">Date of Birth</label>
                      <div className="info-field-value">{formatDateForDisplay(profileData.dob)}</div>
                    </div>
                    <div className="info-card-field">
                      <label className="info-field-label">Gender</label>
                      <div className="info-field-value">{profileData.gender}</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="details-edit-form">
                    <div className="edit-form-grid">
                      <div className="form-input-field">
                        <label>First Name</label>
                        <input 
                          type="text" 
                          name="firstName" 
                          value={editFormData.firstName} 
                          onChange={handleProfileFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>Last Name</label>
                        <input 
                          type="text" 
                          name="lastName" 
                          value={editFormData.lastName} 
                          onChange={handleProfileFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field readonly-field">
                        <label>Email Address (Cannot change)</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={editFormData.email} 
                          readOnly 
                          disabled 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>Mobile Number</label>
                        <input 
                          type="text" 
                          name="mobile" 
                          value={editFormData.mobile} 
                          onChange={handleProfileFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>Date of Birth</label>
                        <input 
                          type="date" 
                          name="dob" 
                          value={editFormData.dob} 
                          onChange={handleProfileFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>Gender</label>
                        <select 
                          name="gender" 
                          value={editFormData.gender} 
                          onChange={handleProfileFormChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </form>
                )}
              </section>

              {/* Address Information Section */}
              <section className="profile-card-section address-section">
                <div className="section-header-row">
                  <h2 className="section-title">Address</h2>
                  {!isEditingAddress ? (
                    <button onClick={handleEditAddressToggle} className="profile-action-btn">
                      <MapPin size={15} />
                      <span>Manage Addresses</span>
                    </button>
                  ) : (
                    <div className="edit-actions-group">
                      <button onClick={handleSaveAddress} className="profile-save-btn">
                        <Check size={15} />
                        <span>Save Address</span>
                      </button>
                      <button onClick={handleEditAddressToggle} className="profile-cancel-btn">
                        <X size={15} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingAddress ? (
                  <div className="address-display-row">
                    <div className="address-icon-outer">
                      <Home size={18} />
                    </div>
                    <div className="address-info-details">
                      <div className="address-type-label">
                        <h4>{addressData.type}</h4>
                        {addressData.isDefault && <span className="default-address-pill">Default</span>}
                      </div>
                      <p className="address-text-paragraph">
                        {addressData.line1}, {addressData.city}, {addressData.state} - {addressData.pinCode}, {addressData.country} | {addressData.phone}
                      </p>
                    </div>
                    <ChevronRight size={18} className="address-row-chevron" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} className="address-edit-form">
                    <div className="edit-form-grid">
                      <div className="form-input-field full-width-input">
                        <label>Street Address</label>
                        <input 
                          type="text" 
                          name="line1" 
                          value={addressFormData.line1} 
                          onChange={handleAddressFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>City</label>
                        <input 
                          type="text" 
                          name="city" 
                          value={addressFormData.city} 
                          onChange={handleAddressFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>State</label>
                        <input 
                          type="text" 
                          name="state" 
                          value={addressFormData.state} 
                          onChange={handleAddressFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>PIN Code</label>
                        <input 
                          type="text" 
                          name="pinCode" 
                          value={addressFormData.pinCode} 
                          onChange={handleAddressFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field">
                        <label>Country</label>
                        <input 
                          type="text" 
                          name="country" 
                          value={addressFormData.country} 
                          onChange={handleAddressFormChange} 
                          required 
                        />
                      </div>
                      <div className="form-input-field full-width-input">
                        <label>Phone Number for Delivery</label>
                        <input 
                          type="text" 
                          name="phone" 
                          value={addressFormData.phone} 
                          onChange={handleAddressFormChange} 
                          required 
                        />
                      </div>
                    </div>
                  </form>
                )}
              </section>
            </div>
          )}

          {currentTab !== "profile" && (
            <div className="profile-tab-placeholder">
              <div className="pane-header-box">
                <div className="pane-title-group">
                  <h1>{SIDEBAR_ITEMS.find(item => item.id === currentTab)?.label}</h1>
                  <p>Access and manage your {SIDEBAR_ITEMS.find(item => item.id === currentTab)?.label.toLowerCase()} details</p>
                </div>
              </div>
              <div className="placeholder-details-card">
                <Shield size={32} className="placeholder-shield-icon" />
                <h3>Module Integration Pending</h3>
                <p>
                  This feature is currently being integrated into your ShopEase Hub. 
                  Check back soon for updates to your dashboard!
                </p>
                <button onClick={() => setSearchParams({ tab: "profile" })} className="placeholder-home-btn">
                  Back to My Profile
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
