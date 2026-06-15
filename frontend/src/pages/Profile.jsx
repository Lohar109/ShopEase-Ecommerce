import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  User, Package, Store, Gift, CreditCard, Bell, Headphones, Megaphone, Download,
  MapPin, Home, ChevronRight, ArrowLeft, ArrowRight, Check, X, Shield, Lock,
  Percent, Users, UserPlus, FileText, CheckCircle, TrendingUp, Clock,
  Search, Truck, XCircle, RotateCcw, Star, Award, Info
} from "lucide-react";
import toast from "react-hot-toast";
import "./Profile.css";

const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: User, path: '/profile' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/profile?tab=orders' },
  { id: 'seller', label: 'Become a Seller', icon: Store, path: '/profile?tab=seller' },
  { id: 'rewards', label: 'Rewards', icon: Gift, path: '/profile?tab=rewards' },
  { id: 'giftcards', label: 'Gift Cards', icon: CreditCard, path: '/profile?tab=giftcards' },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell, path: '/profile?tab=notifications' },
  { id: 'care', label: '24x7 Customer Care', icon: Headphones, path: '/profile?tab=care' },
  { id: 'advertise', label: 'Advertise', icon: Megaphone, path: '/profile?tab=advertise' },
  { id: 'download', label: 'Download App', icon: Download, path: '/profile?tab=download' },
];

const INITIAL_ORDERS = [
  {
    orderId: "#SE123456789",
    orderDate: "09 Jun 2024, 05:12 PM",
    paymentMethod: "Paid via UPI",
    totalAmount: 1249,
    status: "Delivered",
    productName: "boAt Airdopes 131 Pro",
    productDesc: "Wireless Earbuds with 40H Playback",
    quantity: 1,
    statusDetail: "Delivered on 12 Jun 2024",
    imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=300&auto=format&fit=crop"
  },
  {
    orderId: "#SE123456788",
    orderDate: "07 Jun 2024, 11:24 AM",
    paymentMethod: "Paid via Card",
    totalAmount: 799,
    status: "Shipped",
    productName: "Lavie Women's Shoulder Bag",
    productDesc: "Elegant & Stylish Handbag",
    quantity: 1,
    statusDetail: "Shipped on 08 Jun 2024",
    statusDetailSub: "Expected Delivery: 11 Jun 2024",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=300&auto=format&fit=crop"
  },
  {
    orderId: "#SE123456787",
    orderDate: "05 Jun 2024, 09:15 PM",
    paymentMethod: "Paid via UPI",
    totalAmount: 2299,
    status: "Processing",
    productName: "Noise ColorFit Pulse 3",
    productDesc: "Smartwatch with 1.85\" Display",
    quantity: 1,
    statusDetail: "Processing",
    statusDetailSub: "Will be shipped soon",
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=300&auto=format&fit=crop"
  },
  {
    orderId: "#SE123456786",
    orderDate: "12 May 2024, 02:45 PM",
    paymentMethod: "Paid via Card",
    totalAmount: 3499,
    status: "Cancelled",
    productName: "Adidas Men's Running Shoes",
    productDesc: "Comfortable Gym & Training Footwear",
    quantity: 1,
    statusDetail: "Cancelled on 13 May 2024",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop"
  },
  {
    orderId: "#SE123456785",
    orderDate: "28 Apr 2024, 10:15 AM",
    paymentMethod: "Paid via UPI",
    totalAmount: 1899,
    status: "Returned",
    productName: "Zara Slim Fit Cotton Shirt",
    productDesc: "Classic Fit Casual Shirt",
    quantity: 1,
    statusDetail: "Returned on 30 Apr 2024",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300&auto=format&fit=crop"
  }
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

  // State to manage active orders, search query, and active filter tab
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("shopease_orders_list");
    if (saved) return JSON.parse(saved);
    return INITIAL_ORDERS;
  });
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");
  const [ordersActiveTab, setOrdersActiveTab] = useState("All");

  useEffect(() => {
    localStorage.setItem("shopease_orders_list", JSON.stringify(orders));
  }, [orders]);

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const now = new Date();
      const months = ["Jun", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.orderId === orderId) {
            return {
              ...order,
              status: "Cancelled",
              statusDetail: `Cancelled on ${formattedDate}`,
              statusDetailSub: undefined
            };
          }
          return order;
        })
      );
    }
  };

  // Rewards tab states
  const [availablePoints, setAvailablePoints] = useState(() => {
    const saved = localStorage.getItem("shopease_available_points");
    return saved ? parseInt(saved, 10) : 750;
  });
  const [pointsEarned, setPointsEarned] = useState(() => {
    const saved = localStorage.getItem("shopease_points_earned");
    return saved ? parseInt(saved, 10) : 1250;
  });
  const [pointsUsed, setPointsUsed] = useState(() => {
    const saved = localStorage.getItem("shopease_points_used");
    return saved ? parseInt(saved, 10) : 500;
  });
  const [rewardsActivities, setRewardsActivities] = useState(() => {
    const saved = localStorage.getItem("shopease_rewards_activities");
    if (saved) return JSON.parse(saved);
    return [
      { date: "09 Jun 2024", desc: "Order #SE123456789", points: 120, status: "Credited" },
      { date: "01 Jun 2024", desc: "Order #SE123456780", points: 80, status: "Credited" },
      { date: "25 May 2024", desc: "Redeemed Amazon Pay Voucher (₹50)", points: -500, status: "Debited" },
      { date: "18 May 2024", desc: "Order #SE123456770", points: 60, status: "Credited" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("shopease_available_points", availablePoints);
  }, [availablePoints]);

  useEffect(() => {
    localStorage.setItem("shopease_points_earned", pointsEarned);
  }, [pointsEarned]);

  useEffect(() => {
    localStorage.setItem("shopease_points_used", pointsUsed);
  }, [pointsUsed]);

  useEffect(() => {
    localStorage.setItem("shopease_rewards_activities", JSON.stringify(rewardsActivities));
  }, [rewardsActivities]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(ordersSearchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(ordersSearchQuery.toLowerCase());
      
    if (ordersActiveTab === "All") {
      return matchesSearch;
    }
    return order.status === ordersActiveTab && matchesSearch;
  });

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
    businessType: "Individual",
    pan: "",
    gstin: "",
    registrationNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    country: "India",
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
    const addressString = `${sellerFormData.addressLine1}${sellerFormData.addressLine2 ? ', ' + sellerFormData.addressLine2 : ''}, ${sellerFormData.city}, ${sellerFormData.state} - ${sellerFormData.pincode}, ${sellerFormData.country}`;
    const submission = {
      ...sellerFormData,
      businessAddress: addressString,
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
      businessType: "Individual",
      pan: "",
      gstin: "",
      registrationNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Maharashtra",
      pincode: "",
      country: "India",
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
                  {/* Stepper Card */}
                  <div className="seller-stepper-card">
                    <div className="seller-form-progress">
                      <div className="progress-lines-bg">
                        <div 
                          className="progress-line-fill" 
                          style={{ width: `${(formStep - 1) * 50}%` }}
                        />
                      </div>
                      
                      <div className={`progress-step ${formStep >= 1 ? "active" : ""} ${formStep > 1 ? "completed" : ""}`}>
                        <div className="step-number">
                          {formStep > 1 ? <Check size={16} strokeWidth={3} /> : 1}
                        </div>
                        <div className="step-labels">
                          <span className="step-title">Store Setup</span>
                          <span className="step-desc">Tell us about your store</span>
                        </div>
                      </div>

                      <div className={`progress-step ${formStep >= 2 ? "active" : ""} ${formStep > 2 ? "completed" : ""}`}>
                        <div className="step-number">
                          {formStep > 2 ? <Check size={16} strokeWidth={3} /> : 2}
                        </div>
                        <div className="step-labels">
                          <span className="step-title">Tax & Address</span>
                          <span className="step-desc">Add your business details</span>
                        </div>
                      </div>

                      <div className={`progress-step ${formStep >= 3 ? "active" : ""} ${formStep > 3 ? "completed" : ""}`}>
                        <div className="step-number">
                          {formStep > 3 ? <Check size={16} strokeWidth={3} /> : 3}
                        </div>
                        <div className="step-labels">
                          <span className="step-title">Bank Verification</span>
                          <span className="step-desc">Verify your bank account</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Content Card */}
                  <div className="seller-form-card">
                    {/* Header with Icon */}
                    <div className="seller-step-header">
                      <div className="seller-step-icon-wrapper">
                        {formStep === 1 && <Store size={22} className="seller-step-icon" />}
                        {formStep === 2 && <FileText size={22} className="seller-step-icon" />}
                        {formStep === 3 && <CreditCard size={22} className="seller-step-icon" />}
                      </div>
                      <div className="seller-step-header-text">
                        {formStep === 1 && (
                          <>
                            <h3>Store Information</h3>
                            <p>Let's start with your store identity and category details.</p>
                          </>
                        )}
                        {formStep === 2 && (
                          <>
                            <h3>Tax & Business Address</h3>
                            <p>Please provide your tax information and business address.</p>
                          </>
                        )}
                        {formStep === 3 && (
                          <>
                            <h3>Bank Payout Details</h3>
                            <p>Enter your bank account credentials to receive customer payouts directly.</p>
                          </>
                        )}
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
                          <div className="form-input-field">
                            <label>Store Name *</label>
                            <div className="input-with-icon-wrapper">
                              <input 
                                type="text" 
                                name="storeName" 
                                value={sellerFormData.storeName} 
                                onChange={handleSellerInputChange} 
                                placeholder="e.g. Gilada Fashion Hub"
                                required 
                              />
                              <Store size={18} className="input-right-icon" />
                            </div>
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
                            <label>Store Description *</label>
                            <div className="textarea-counter-wrapper">
                              <textarea 
                                name="description" 
                                value={sellerFormData.description} 
                                onChange={handleSellerInputChange} 
                                placeholder="Briefly describe what products you plan to sell..."
                                rows={4}
                                maxLength={500}
                                required
                              />
                              <span className="textarea-character-counter">
                                {sellerFormData.description ? sellerFormData.description.length : 0} / 500
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {formStep === 2 && (
                        <div className="form-step-content">
                          <h4 className="form-section-title">Tax Information</h4>
                          
                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>Business Type *</label>
                              <select 
                                name="businessType" 
                                value={sellerFormData.businessType} 
                                onChange={handleSellerInputChange}
                                required
                              >
                                <option value="Individual">Individual</option>
                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                <option value="Partnership">Partnership</option>
                                <option value="Private Limited Company">Private Limited Company</option>
                                <option value="Public Limited Company">Public Limited Company</option>
                              </select>
                            </div>

                            <div className="form-input-field">
                              <label>PAN Number *</label>
                              <input 
                                type="text" 
                                name="pan" 
                                value={sellerFormData.pan} 
                                onChange={handleSellerInputChange} 
                                placeholder="ABCDE1234F"
                                pattern="^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$"
                                title="Please enter a valid 10-character PAN format."
                                required 
                              />
                              <span className="field-helper-text">Enter valid PAN number</span>
                            </div>
                          </div>

                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>GST Number (Optional)</label>
                              <input 
                                type="text" 
                                name="gstin" 
                                value={sellerFormData.gstin} 
                                onChange={handleSellerInputChange} 
                                placeholder="e.g. 27ABCDE1234F1Z5"
                                pattern="^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{3}$"
                                title="Please enter a valid 15-character GSTIN format."
                              />
                            </div>

                            <div className="form-input-field">
                              <label>Business Registration Number (Optional)</label>
                              <input 
                                type="text" 
                                name="registrationNumber" 
                                value={sellerFormData.registrationNumber} 
                                onChange={handleSellerInputChange} 
                                placeholder="e.g. UDYAM-MH-01-0001234"
                              />
                            </div>
                          </div>

                          <h4 className="form-section-title">Business Address</h4>
                          
                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>Address Line 1 *</label>
                              <input 
                                type="text" 
                                name="addressLine1" 
                                value={sellerFormData.addressLine1} 
                                onChange={handleSellerInputChange} 
                                placeholder="123, MG Road, Opp. City Mall"
                                required 
                              />
                            </div>

                            <div className="form-input-field">
                              <label>Address Line 2 (Optional)</label>
                              <input 
                                type="text" 
                                name="addressLine2" 
                                value={sellerFormData.addressLine2} 
                                onChange={handleSellerInputChange} 
                                placeholder="Unit No. 5, 2nd Floor"
                              />
                            </div>
                          </div>

                          <div className="form-grid-3-col">
                            <div className="form-input-field">
                              <label>City *</label>
                              <input 
                                type="text" 
                                name="city" 
                                value={sellerFormData.city} 
                                onChange={handleSellerInputChange} 
                                placeholder="Mumbai"
                                required 
                              />
                            </div>

                            <div className="form-input-field">
                              <label>State *</label>
                              <select 
                                name="state" 
                                value={sellerFormData.state} 
                                onChange={handleSellerInputChange}
                                required
                              >
                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                <option value="West Bengal">West Bengal</option>
                              </select>
                            </div>

                            <div className="form-input-field">
                              <label>Pincode *</label>
                              <input 
                                type="text" 
                                name="pincode" 
                                value={sellerFormData.pincode} 
                                onChange={handleSellerInputChange} 
                                placeholder="400001"
                                pattern="^[1-9][0-9]{5}$"
                                title="Please enter a valid 6-digit pin code."
                                required 
                              />
                            </div>
                          </div>

                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>Country *</label>
                              <select 
                                name="country" 
                                value={sellerFormData.country} 
                                onChange={handleSellerInputChange}
                                required
                              >
                                <option value="India">India</option>
                              </select>
                            </div>
                            <div />
                          </div>
                        </div>
                      )}

                      {formStep === 3 && (
                        <div className="form-step-content">
                          <div className="form-input-field">
                            <label>Account Holder Name *</label>
                            <div className="input-with-icon-wrapper">
                              <input 
                                type="text" 
                                name="holderName" 
                                value={sellerFormData.holderName} 
                                onChange={handleSellerInputChange} 
                                placeholder="Account owner or entity name"
                                required 
                              />
                              <User size={18} className="input-right-icon" />
                            </div>
                          </div>

                          <div className="form-input-field">
                            <label>Bank Account Number *</label>
                            <div className="input-with-icon-wrapper">
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
                              <Lock size={18} className="input-right-icon" />
                            </div>
                          </div>

                          <div className="form-input-field">
                            <label>IFSC Code *</label>
                            <div className="input-with-icon-wrapper">
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
                              <CreditCard size={18} className="input-right-icon" />
                            </div>
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
                            className="seller-btn-secondary back-btn-with-arrow"
                          >
                            <span>&larr; Back</span>
                          </button>
                        )}

                        <button type="submit" className="seller-btn-primary">
                          <span>{formStep === 3 ? "Submit Application" : "Next Step"}</span>
                          <ArrowRight size={16} className="btn-right-icon" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security notice footer */}
                  <div className={`seller-form-security-footer step-${formStep}`}>
                    {formStep === 2 ? (
                      <Lock size={16} className="security-footer-icon" />
                    ) : (
                      <Shield size={16} className="security-footer-icon" />
                    )}
                    <span>Your information is secure and will only be used to set up your seller account.</span>
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
                        <div className="seller-step-circle pink-light-bg pink-text">
                          <UserPlus size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>Register</h4>
                        </div>
                      </div>
                      <div className="workflow-arrow">
                        <svg className="desktop-arrow" width="100%" height="2" viewBox="0 0 100 2" fill="none" preserveAspectRatio="none">
                          <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" className="moving-stepper-line" />
                        </svg>
                        <svg className="mobile-arrow" width="2" height="36" viewBox="0 0 2 36" fill="none" preserveAspectRatio="none">
                          <line x1="1" y1="0" x2="1" y2="36" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" className="moving-stepper-line-vertical" />
                        </svg>
                      </div>
                      <div className="seller-step-node">
                        <div className="seller-step-circle blue-light-bg blue-text">
                          <FileText size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>Submit Details</h4>
                        </div>
                      </div>
                      <div className="workflow-arrow">
                        <svg className="desktop-arrow" width="100%" height="2" viewBox="0 0 100 2" fill="none" preserveAspectRatio="none">
                          <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" className="moving-stepper-line" />
                        </svg>
                        <svg className="mobile-arrow" width="2" height="36" viewBox="0 0 2 36" fill="none" preserveAspectRatio="none">
                          <line x1="1" y1="0" x2="1" y2="36" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" className="moving-stepper-line-vertical" />
                        </svg>
                      </div>
                      <div className="seller-step-node">
                        <div className="seller-step-circle green-light-bg green-text">
                          <CheckCircle size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>Verification</h4>
                        </div>
                      </div>
                      <div className="workflow-arrow">
                        <svg className="desktop-arrow" width="100%" height="2" viewBox="0 0 100 2" fill="none" preserveAspectRatio="none">
                          <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" className="moving-stepper-line" />
                        </svg>
                        <svg className="mobile-arrow" width="2" height="36" viewBox="0 0 2 36" fill="none" preserveAspectRatio="none">
                          <line x1="1" y1="0" x2="1" y2="36" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" className="moving-stepper-line-vertical" />
                        </svg>
                      </div>
                      <div className="seller-step-node">
                        <div className="seller-step-circle purple-light-bg purple-text">
                          <TrendingUp size={22} />
                        </div>
                        <div className="seller-step-info">
                          <h4>Start Selling</h4>
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

          {currentTab === "orders" && (
            <div className="orders-tab-content">
              <div className="orders-header-row">
                <div className="orders-actions-wrap">
                  <div className="orders-search-wrapper">
                    <Search size={16} className="orders-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search by Order ID or Product" 
                      value={ordersSearchQuery}
                      onChange={(e) => setOrdersSearchQuery(e.target.value)}
                      className="orders-search-input"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-navigation Tabs */}
              <div className="orders-nav-tabs">
                {["All", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOrdersActiveTab(tab)}
                    className={`orders-tab-btn ${ordersActiveTab === tab ? "active" : ""}`}
                  >
                    {tab === "All" ? "All Orders" : tab}
                  </button>
                ))}
              </div>

              {/* Orders Cards List */}
              <div className="orders-cards-list">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.orderId} className="order-card-row">
                      {/* Left Metadata Column */}
                      <div className="order-meta-col">
                        <div className="meta-item">
                          <span className="meta-label">ORDER ID</span>
                          <span className="meta-value bold-value">{order.orderId}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">ORDER DATE</span>
                          <span className="meta-value">{order.orderDate}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">PAYMENT</span>
                          <span className="meta-value">{order.paymentMethod}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">TOTAL AMOUNT</span>
                          <span className="meta-value price-value">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Middle Product Column */}
                      <div className="order-product-col">
                        <div className="product-image-container">
                          <img src={order.imageUrl} alt={order.productName} className="order-product-image" />
                        </div>
                        <div className="product-details-container">
                          <h4 className="product-title">{order.productName}</h4>
                          <p className="product-desc">{order.productDesc}</p>
                          <div className="product-qty-row">
                            <span className="product-price">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            <span className="qty-divider">•</span>
                            <span className="product-qty">Qty: {order.quantity}</span>
                          </div>
                          <div className={`product-status-details status-${order.status.toLowerCase()}`}>
                            <span className="status-detail-text">{order.statusDetail}</span>
                            {order.statusDetailSub && (
                              <span className="status-detail-subtext">{order.statusDetailSub}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action/Status Column */}
                      <div className="order-actions-col">
                        <div className={`order-status-badge badge-${order.status.toLowerCase()}`}>
                          {order.status === "Delivered" && <CheckCircle size={14} className="status-badge-icon" />}
                          {order.status === "Shipped" && <Truck size={14} className="status-badge-icon" />}
                          {order.status === "Processing" && <Clock size={14} className="status-badge-icon" />}
                          {order.status === "Cancelled" && <XCircle size={14} className="status-badge-icon" />}
                          {order.status === "Returned" && <RotateCcw size={14} className="status-badge-icon" />}
                          <span>{order.status}</span>
                        </div>
                        <div className="order-actions-buttons">
                          <button className="order-btn-outline-pink">View Details</button>
                          {order.status === "Delivered" && (
                            <button className="order-btn-outline-gray">Buy Again</button>
                          )}
                          {order.status === "Shipped" && (
                            <button className="order-btn-outline-gray">Track Order</button>
                          )}
                          {order.status === "Processing" && (
                            <button 
                              onClick={() => handleCancelOrder(order.orderId)} 
                              className="order-btn-outline-gray"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="orders-empty-state">
                    <p>No orders found matching your criteria.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {currentTab === "rewards" && (
            <div className="rewards-tab-content">

              {/* Summary Cards Grid */}
              <div className="rewards-summary-grid">
                <div className="reward-summary-card pink-theme">
                  <div className="reward-card-header">
                    <div className="reward-card-icon-circle">
                      <Star size={20} className="reward-icon-pink" />
                    </div>
                    <div className="reward-card-label-group">
                      <span className="reward-card-label">Available Points</span>
                      <h2 className="reward-card-value">{availablePoints}</h2>
                      <span className="reward-card-subtext">Worth ₹{Math.floor(availablePoints * 0.1)}</span>
                    </div>
                  </div>
                  <button 
                    className="reward-card-action-btn-pink"
                    onClick={() => {
                      const element = document.getElementById("redeem-vouchers-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Redeem Now
                  </button>
                </div>

                <div className="reward-summary-card purple-theme">
                  <div className="reward-card-header">
                    <div className="reward-card-icon-circle">
                      <Clock size={20} className="reward-icon-purple" />
                    </div>
                    <div className="reward-card-label-group">
                      <span className="reward-card-label">Points Earned</span>
                      <h2 className="reward-card-value">{pointsEarned}</h2>
                      <span className="reward-card-subtext">This Year</span>
                    </div>
                  </div>
                  <span className="reward-card-link-purple" onClick={() => toast("View History coming soon!", { icon: "🔮" })}>
                    View History &rarr;
                  </span>
                </div>

                <div className="reward-summary-card green-theme">
                  <div className="reward-card-header">
                    <div className="reward-card-icon-circle">
                      <Gift size={20} className="reward-icon-green" />
                    </div>
                    <div className="reward-card-label-group">
                      <span className="reward-card-label">Points Used</span>
                      <h2 className="reward-card-value">{pointsUsed}</h2>
                      <span className="reward-card-subtext">This Year</span>
                    </div>
                  </div>
                  <span className="reward-card-link-green" onClick={() => toast("View History coming soon!", { icon: "🔮" })}>
                    View History &rarr;
                  </span>
                </div>

                <div className="reward-summary-card orange-theme">
                  <div className="reward-card-header">
                    <div className="reward-card-icon-circle">
                      <Award size={20} className="reward-icon-orange" />
                    </div>
                    <div className="reward-card-label-group">
                      <span className="reward-card-label">Expiring Soon</span>
                      <h2 className="reward-card-value">120</h2>
                      <span className="reward-card-subtext">Points expire on 30 Jun 2024</span>
                    </div>
                  </div>
                  <span className="reward-card-link-orange" onClick={() => toast("Expiry Details: 120 points expire at the end of this month.", { icon: "⚠️" })}>
                    View Details &rarr;
                  </span>
                </div>
              </div>
              {/* Bottom Layout section */}
              <div className="rewards-bottom-layout">
                {/* Recent Activity */}
                <div className="recent-activity-panel">
                  <div className="panel-header-row">
                    <h3>Recent Activity</h3>
                    <span className="view-all-activity-link" onClick={() => toast("Full history coming soon!")}>
                      View All Activity &rarr;
                    </span>
                  </div>
                  <div className="activity-table-wrapper">
                    <table className="activity-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Points</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rewardsActivities.map((act, idx) => {
                          const isCredit = act.status === "Credited";
                          return (
                            <tr key={idx}>
                              <td>{act.date}</td>
                              <td>{act.desc}</td>
                              <td className={isCredit ? "points-credited" : "points-debited"}>
                                {isCredit ? `+${act.points}` : act.points}
                              </td>
                              <td>
                                <span className={`status-pill ${isCredit ? "status-credited" : "status-debited"}`}>
                                  {act.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Earn More Points */}
                <div className="earn-more-panel">
                  <h3>Earn More Points</h3>
                  <div className="earn-more-list">
                    <div className="earn-more-list-item">
                      <div className="earn-more-icon-circle pink-bg">
                        <Package size={16} className="reward-icon-pink" />
                      </div>
                      <div className="earn-more-details">
                        <h4>Shop More</h4>
                        <p>Earn points on every eligible purchase.</p>
                      </div>
                    </div>

                    <div className="earn-more-list-item purple-bg">
                      <div className="earn-more-icon-circle purple-bg-light">
                        <Star size={16} className="reward-icon-purple" />
                      </div>
                      <div className="earn-more-details">
                        <h4>Exclusive Offers</h4>
                        <p>Look out for special offers to earn extra points.</p>
                      </div>
                    </div>

                    <div className="earn-more-list-item green-bg">
                      <div className="earn-more-icon-circle green-bg-light">
                        <Gift size={16} className="reward-icon-green" />
                      </div>
                      <div className="earn-more-details">
                        <h4>Bonus Points</h4>
                        <p>Get bonus points on your birthday & special days.</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="explore-offers-btn"
                    onClick={() => toast("Navigating to offers dashboard...", { icon: "🛍️" })}
                  >
                    Explore Offers
                  </button>
                </div>
              </div>

              {/* Alert Footer Bar */}
              <div className="rewards-footer-alert-bar">
                <Info size={16} className="alert-bar-info-icon" />
                <span><strong>1 Point = ₹0.10</strong> | Minimum 500 Points required to redeem.</span>
              </div>
            </div>
          )}

          {currentTab !== "profile" && currentTab !== "seller" && currentTab !== "orders" && currentTab !== "rewards" && (
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
