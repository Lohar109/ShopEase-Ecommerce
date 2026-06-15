import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  User, Package, Heart, Store, Gift, CreditCard, Bell, Headphones, Megaphone, Download,
  MapPin, Home, ChevronRight, ArrowLeft, Check, X, Shield, Lock,
  Percent, Users, UserPlus, FileText, CheckCircle, TrendingUp, Clock
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

  // Seller Onboarding States
  const [sellerApplication, setSellerApplication] = useState(() => {
    const saved = localStorage.getItem("shopease_seller_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [sellerFormData, setSellerFormData] = useState({
    storeName: "",
    category: "Electronics",
    description: "",
    gstin: "",
    pan: "",
    businessAddress: "",
    bankAccount: "",
    ifsc: "",
    holderName: ""
  });

  const handleSellerInputChange = (e) => {
    const { name, value } = e.target;
    // Length limits for GSTIN and PAN
    if (name === "gstin" && value.length > 15) return;
    if (name === "pan" && value.length > 10) return;
    setSellerFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSellerSubmit = (e) => {
    e.preventDefault();
    const submission = {
      ...sellerFormData,
      status: "UNDER_REVIEW",
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem("shopease_seller_data", JSON.stringify(submission));
    setSellerApplication(submission);
    setShowSellerForm(false);
    setFormStep(1);
  };

  const handleResetSellerApplication = () => {
    localStorage.removeItem("shopease_seller_data");
    setSellerApplication(null);
    setSellerFormData({
      storeName: "",
      category: "Electronics",
      description: "",
      gstin: "",
      pan: "",
      businessAddress: "",
      bankAccount: "",
      ifsc: "",
      holderName: ""
    });
  };

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
              {/* Personal Information Section */}
              <section className="profile-card-section">
                <div className="section-header-row">
                  <h2 className="section-title">Personal Information</h2>
                  {!isEditing ? (
                    <button onClick={handleEditProfileToggle} className="profile-action-btn">
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="edit-actions-group">
                      <button onClick={handleSaveProfile} className="profile-save-btn">
                        <span>Save</span>
                      </button>
                      <button onClick={handleEditProfileToggle} className="profile-cancel-btn">
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
                      <span>Edit Addresses</span>
                    </button>
                  ) : (
                    <div className="edit-actions-group">
                      <button onClick={handleSaveAddress} className="profile-save-btn">
                        <span>Save Address</span>
                      </button>
                      <button onClick={handleEditAddressToggle} className="profile-cancel-btn">
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

          {currentTab === "seller" && (
            <div className="seller-tab-content">
              {sellerApplication ? (
                /* UNDER REVIEW SCREEN */
                <div className="seller-status-pane">
                  <div className="pane-header-box">
                    <div className="pane-title-group">
                      <h1>Seller Application</h1>
                      <p>Track your merchant onboarding status</p>
                    </div>
                  </div>

                  <div className="seller-status-card">
                    <div className="status-badge-wrap">
                      <Clock size={32} className="status-clock-icon" />
                      <div>
                        <h3>Application Under Review</h3>
                        <p>Submitted on {new Date(sellerApplication.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="status-divider" />

                    <div className="status-details-grid">
                      <div className="status-field">
                        <label>Store Name</label>
                        <div>{sellerApplication.storeName}</div>
                      </div>
                      <div className="status-field">
                        <label>Category</label>
                        <div>{sellerApplication.category}</div>
                      </div>
                      <div className="status-field">
                        <label>GSTIN</label>
                        <div>{sellerApplication.gstin || "N/A"}</div>
                      </div>
                      <div className="status-field">
                        <label>PAN</label>
                        <div>{sellerApplication.pan || "N/A"}</div>
                      </div>
                      <div className="status-field">
                        <label>Bank Name</label>
                        <div>{sellerApplication.holderName}</div>
                      </div>
                      <div className="status-field">
                        <label>Account Number</label>
                        <div>••••••••{sellerApplication.bankAccount.slice(-4)}</div>
                      </div>
                    </div>

                    <div className="status-divider" />

                    <div className="status-info-box">
                      <Shield size={18} className="status-info-icon" />
                      <p>
                        Our merchant onboarding team is verifying your business PAN and GSTIN records.
                        Verification updates and portal credentials will be sent to your email <strong>{profileData.email}</strong> within 24-48 business hours.
                      </p>
                    </div>

                    <button onClick={handleResetSellerApplication} className="seller-reset-btn">
                      Reset Application
                    </button>
                  </div>
                </div>
              ) : showSellerForm ? (
                /* STEP-BY-STEP REGISTRATION FORM */
                <div className="seller-form-box">
                  <div className="pane-header-box">
                    <div className="pane-title-group">
                      <h1>Register as a Seller</h1>
                      <p>Provide your details to set up your ShopEase merchant account</p>
                    </div>
                  </div>

                  <div className="seller-form-card">
                    {/* Progress indicator */}
                    <div className="seller-form-progress">
                      <div className={`progress-step ${formStep >= 1 ? "active" : ""}`}>
                        <div className="step-number">1</div>
                        <span>Store Setup</span>
                      </div>
                      <div className="progress-line" />
                      <div className={`progress-step ${formStep >= 2 ? "active" : ""}`}>
                        <div className="step-number">2</div>
                        <span>Tax & Address</span>
                      </div>
                      <div className="progress-line" />
                      <div className={`progress-step ${formStep >= 3 ? "active" : ""}`}>
                        <div className="step-number">3</div>
                        <span>Bank Verification</span>
                      </div>
                    </div>

                    <form onSubmit={(e) => {
                      if (formStep < 3) {
                        e.preventDefault();
                        setFormStep(prev => prev + 1);
                      } else {
                        handleSellerSubmit(e);
                      }
                    }}>
                      {formStep === 1 && (
                        <div className="form-step-content">
                          <h3>Store Information</h3>
                          <p className="step-instruction">Let's start with your store identity and category details.</p>
                          
                          <div className="form-input-field">
                            <label>Store Name *</label>
                            <input 
                              type="text" 
                              name="storeName" 
                              value={sellerFormData.storeName} 
                              onChange={handleSellerInputChange} 
                              placeholder="e.g. Gilada Fashion Hub"
                              required 
                            />
                          </div>

                          <div className="form-input-field">
                            <label>Store Category *</label>
                            <select 
                              name="category" 
                              value={sellerFormData.category} 
                              onChange={handleSellerInputChange}
                            >
                              <option value="Electronics">Electronics</option>
                              <option value="Fashion">Fashion</option>
                              <option value="Home & Kitchen">Home & Kitchen</option>
                              <option value="Books">Books</option>
                              <option value="Beauty & Grooming">Beauty & Grooming</option>
                              <option value="Groceries">Groceries</option>
                            </select>
                          </div>

                          <div className="form-input-field">
                            <label>Store Description</label>
                            <textarea 
                              name="description" 
                              value={sellerFormData.description} 
                              onChange={handleSellerInputChange} 
                              placeholder="Briefly describe what products you plan to sell..."
                              rows={4}
                            />
                          </div>
                        </div>
                      )}

                      {formStep === 2 && (
                        <div className="form-step-content">
                          <h3>Tax & Compliance</h3>
                          <p className="step-instruction">Provide your business registration tax details and physical address.</p>
                          
                          <div className="form-input-field">
                            <label>GSTIN (15 Characters) *</label>
                            <input 
                              type="text" 
                              name="gstin" 
                              value={sellerFormData.gstin} 
                              onChange={handleSellerInputChange} 
                              placeholder="e.g. 22AAAAA0000A1Z5"
                              pattern="^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{3}$"
                              title="Please enter a valid 15-character GSTIN format."
                              required 
                            />
                          </div>

                          <div className="form-input-field">
                            <label>Business PAN (10 Characters) *</label>
                            <input 
                              type="text" 
                              name="pan" 
                              value={sellerFormData.pan} 
                              onChange={handleSellerInputChange} 
                              placeholder="e.g. ABCDE1234F"
                              pattern="^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$"
                              title="Please enter a valid 10-character PAN format."
                              required 
                            />
                          </div>

                          <div className="form-input-field">
                            <label>Business Address *</label>
                            <textarea 
                              name="businessAddress" 
                              value={sellerFormData.businessAddress} 
                              onChange={handleSellerInputChange} 
                              placeholder="Complete registered business address..."
                              rows={3}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {formStep === 3 && (
                        <div className="form-step-content">
                          <h3>Bank Payout Details</h3>
                          <p className="step-instruction">Enter your bank account credentials to receive customer payouts directly.</p>
                          
                          <div className="form-input-field">
                            <label>Account Holder Name *</label>
                            <input 
                              type="text" 
                              name="holderName" 
                              value={sellerFormData.holderName} 
                              onChange={handleSellerInputChange} 
                              placeholder="Account owner or entity name"
                              required 
                            />
                          </div>

                          <div className="form-input-field">
                            <label>Bank Account Number *</label>
                            <input 
                              type="password" 
                              name="bankAccount" 
                              value={sellerFormData.bankAccount} 
                              onChange={handleSellerInputChange} 
                              placeholder="Enter bank account number"
                              pattern="^[0-9]{9,18}$"
                              title="Please enter a valid 9 to 18-digit bank account number."
                              required 
                            />
                          </div>

                          <div className="form-input-field">
                            <label>IFSC Code *</label>
                            <input 
                              type="text" 
                              name="ifsc" 
                              value={sellerFormData.ifsc} 
                              onChange={handleSellerInputChange} 
                              placeholder="e.g. SBIN0001234"
                              pattern="^[A-Za-z]{4}[0-9A-Za-z]{7}$"
                              title="Please enter a valid 11-character IFSC code."
                              required 
                            />
                          </div>
                        </div>
                      )}

                      <div className="form-step-actions">
                        {formStep === 1 ? (
                          <button 
                            type="button" 
                            onClick={() => setShowSellerForm(false)} 
                            className="seller-btn-secondary"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => setFormStep(prev => prev - 1)} 
                            className="seller-btn-secondary"
                          >
                            Back
                          </button>
                        )}

                        <button type="submit" className="seller-btn-primary">
                          {formStep === 3 ? "Submit Application" : "Next Step"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* DEFAULT MERCHANT LANDING VIEW */
                <div className="seller-landing-pane">

                  {/* Hero Segment */}
                  <div className="seller-hero-row">
                    <div className="seller-hero-details">
                      <h2>Grow Your Business</h2>
                      <h2 className="highlight-text">With ShopEase</h2>
                      
                      <ul className="seller-bullet-list">
                        <li>
                          <CheckCircle size={16} className="bullet-check" />
                          <span>Reach millions of active buyers</span>
                        </li>
                        <li>
                          <CheckCircle size={16} className="bullet-check" />
                          <span>Zero listing fees for the first 30 days</span>
                        </li>
                        <li>
                          <CheckCircle size={16} className="bullet-check" />
                          <span>Secure payments & direct weekly bank payouts</span>
                        </li>
                        <li>
                          <CheckCircle size={16} className="bullet-check" />
                          <span>Quick, dedicated merchant support channels</span>
                        </li>
                      </ul>

                      <button onClick={() => setShowSellerForm(true)} className="seller-cta-btn">
                        <span>Start Selling Now</span>
                      </button>
                    </div>
                    <div className="seller-hero-img-wrap">
                      <img src="/assets/seller_hero.png" alt="Become a Seller on ShopEase" className="seller-hero-image" />
                    </div>
                  </div>

                  {/* How it Works Segment */}
                  <div className="seller-workflow-section">
                    <h3>How it Works</h3>
                    <div className="seller-workflow-flow">
                      <div className="seller-step-node">
                        <div className="seller-step-circle">
                          <UserPlus size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>1. Register</h4>
                        </div>
                      </div>
                      <div className="workflow-arrow" />
                      <div className="seller-step-node">
                        <div className="seller-step-circle">
                          <FileText size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>2. Submit Details</h4>
                        </div>
                      </div>
                      <div className="workflow-arrow" />
                      <div className="seller-step-node">
                        <div className="seller-step-circle">
                          <CheckCircle size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>3. Verification</h4>
                        </div>
                      </div>
                      <div className="workflow-arrow" />
                      <div className="seller-step-node">
                        <div className="seller-step-circle">
                          <TrendingUp size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>4. Start Selling</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Features & Requirements row */}
                  <div className="seller-split-row">
                    {/* Why Sell Grid */}
                    <div className="seller-split-col why-sell-col">
                      <h3>Why Sell on ShopEase?</h3>
                      <div className="seller-why-grid">
                        <div className="seller-feature-card">
                          <div className="feature-icon-outer pink-light-bg">
                            <Percent size={18} className="feature-icon pink-text" />
                          </div>
                          <div>
                            <h4>Low Commission</h4>
                            <p>Competitive selling fees tailored to your profit margins</p>
                          </div>
                        </div>
                        <div className="seller-feature-card">
                          <div className="feature-icon-outer blue-light-bg">
                            <Users size={18} className="feature-icon blue-text" />
                          </div>
                          <div>
                            <h4>Wide Customer Reach</h4>
                            <p>Instant access to millions of shoppers across major Indian cities</p>
                          </div>
                        </div>
                        <div className="seller-feature-card">
                          <div className="feature-icon-outer green-light-bg">
                            <CreditCard size={18} className="feature-icon green-text" />
                          </div>
                          <div>
                            <h4>Secure Payments</h4>
                            <p>Fully automated and highly secure weekly direct payouts</p>
                          </div>
                        </div>
                        <div className="seller-feature-card">
                          <div className="feature-icon-outer purple-light-bg">
                            <Headphones size={18} className="feature-icon purple-text" />
                          </div>
                          <div>
                            <h4>Dedicated Support</h4>
                            <p>24x7 merchant helpline and personalized seller account manager</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Card */}
                    <div className="seller-split-col requirements-col">
                      <h3>Seller Requirements</h3>
                      <div className="seller-reqs-card">
                        <ul className="seller-reqs-list">
                          <li>
                            <Check size={16} className="req-check-icon" />
                            <div>
                              <h5>Valid GSTIN / Business PAN</h5>
                              <p>GST registration is mandatory to sell taxable goods</p>
                            </div>
                          </li>
                          <li>
                            <Check size={16} className="req-check-icon" />
                            <div>
                              <h5>Active Bank Account Details</h5>
                              <p>Required for secure electronic catalog settlements</p>
                            </div>
                          </li>
                          <li>
                            <Check size={16} className="req-check-icon" />
                            <div>
                              <h5>Business Address Proof</h5>
                              <p>Electricity bill, rent agreement, or registry docs</p>
                            </div>
                          </li>
                          <li>
                            <Check size={16} className="req-check-icon" />
                            <div>
                              <h5>Valid Contact Info</h5>
                              <p>Active email and mobile number for notifications</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentTab !== "profile" && currentTab !== "seller" && (
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
