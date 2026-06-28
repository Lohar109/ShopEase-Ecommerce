import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  User, Package, Store, Gift, CreditCard, Bell, Headphones, Megaphone, Download,
  MapPin, Home, ChevronRight, ChevronDown, ArrowLeft, ArrowRight, Check, X, Shield, Lock,
  Percent, Users, UserPlus, FileText, CheckCircle, TrendingUp, Clock,
  Search, Truck, XCircle, RotateCcw, Star, Award, Info, Landmark, UploadCloud,
  BellOff, Tag, MessageSquare, Mail, Phone, MessageCircle, Target, Trophy, ShoppingBag, Zap
} from "lucide-react";
import toast from "react-hot-toast";
import "./Profile.css";

const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: User, path: '/profile' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/profile?tab=orders' },
  { id: 'seller', label: 'Become a Seller', icon: Store, path: '/profile?tab=seller' },
  { id: 'rewards', label: 'Rewards', icon: Gift, path: '/profile?tab=rewards' },
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

const getWeekLabel = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Other";
  
  // Find the Sunday of that week
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);
  
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const formatShortDate = (d) => {
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };
  
  return `Week of ${formatShortDate(sunday)} - ${formatShortDate(saturday)}`;
};

const groupByWeek = (activities) => {
  const groups = {};
  activities.forEach(act => {
    const weekLabel = getWeekLabel(act.date);
    if (!groups[weekLabel]) {
      groups[weekLabel] = [];
    }
    groups[weekLabel].push(act);
  });
  return groups;
};

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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= 12) return parsed;
    }
    return [
      { date: "09 Jun 2024", desc: "Order #SE123456789", points: 120, status: "Credited" },
      { date: "01 Jun 2024", desc: "Order #SE123456780", points: 80, status: "Credited" },
      { date: "25 May 2024", desc: "Redeemed Amazon Pay Voucher (₹50)", points: -500, status: "Debited" },
      { date: "18 May 2024", desc: "Order #SE123456770", points: 60, status: "Credited" },
      { date: "12 May 2024", desc: "Order #SE123456750", points: 100, status: "Credited" },
      { date: "05 May 2024", desc: "Welcome Bonus", points: 200, status: "Credited" },
      { date: "28 Apr 2024", desc: "Order #SE123456740", points: 90, status: "Credited" },
      { date: "20 Apr 2024", desc: "Redeemed BookMyShow Voucher (₹20)", points: -200, status: "Debited" },
      { date: "15 Apr 2024", desc: "Order #SE123456720", points: 150, status: "Credited" },
      { date: "10 Apr 2024", desc: "Redeemed Myntra Voucher (₹10)", points: -100, status: "Debited" },
      { date: "02 Apr 2024", desc: "Order #SE123456710", points: 70, status: "Credited" },
      { date: "25 Mar 2024", desc: "Profile Completion Bonus", points: 50, status: "Credited" },
      { date: "15 Mar 2024", desc: "Order #SE123456690", points: 110, status: "Credited" },
      { date: "08 Mar 2024", desc: "Redeemed Uber Voucher (₹15)", points: -150, status: "Debited" },
      { date: "01 Mar 2024", desc: "First Purchase Bonus", points: 100, status: "Credited" }
    ];
  });
  const [showAllRewardsActivity, setShowAllRewardsActivity] = useState(false);

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
    confirmBankAccount: "",
    ifsc: "",
    bankName: "HDFC Bank",
    branchName: "Andheri West, Mumbai",
    holderName: ""
  });

  const [ifscVerified, setIfscVerified] = useState(false);
  const [uploadedChequeName, setUploadedChequeName] = useState("");

  // Notification Preferences States
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    const saved = localStorage.getItem("shopease_notification_prefs");
    if (saved) return JSON.parse(saved);
    return {
      orderConfirmations: { email: true, sms: true, push: true },
      shippingUpdates: { email: true, sms: false, push: true },
      cancellationsReturns: { email: true, sms: false, push: true },
      exclusiveOffers: { email: true, sms: true, push: true },
      saleDiscounts: { email: true, sms: true, push: false },
      priceDrops: { email: false, sms: false, push: true },
      accountActivity: { email: true, sms: false, push: true },
      securityAlerts: { email: true, sms: true, push: true },
      newArrivals: { email: false, sms: false, push: true },
      surveysFeedback: { email: false, sms: false, push: false }
    };
  });

  const handleTogglePref = (prefKey, channel) => {
    setNotificationPrefs(prev => {
      const updated = {
        ...prev,
        [prefKey]: {
          ...prev[prefKey],
          [channel]: !prev[prefKey][channel]
        }
      };
      localStorage.setItem("shopease_notification_prefs", JSON.stringify(updated));
      return updated;
    });
    toast.success("Preferences updated successfully!", { duration: 1500 });
  };

  const handleUnsubscribeAll = () => {
    const unsubscribed = {
      orderConfirmations: { email: false, sms: false, push: false },
      shippingUpdates: { email: false, sms: false, push: false },
      cancellationsReturns: { email: false, sms: false, push: false },
      exclusiveOffers: { email: false, sms: false, push: false },
      saleDiscounts: { email: false, sms: false, push: false },
      priceDrops: { email: false, sms: false, push: false },
      accountActivity: { email: false, sms: false, push: false },
      securityAlerts: { email: false, sms: false, push: false },
      newArrivals: { email: false, sms: false, push: false },
      surveysFeedback: { email: false, sms: false, push: false }
    };
    setNotificationPrefs(unsubscribed);
    localStorage.setItem("shopease_notification_prefs", JSON.stringify(unsubscribed));
    toast.success("Unsubscribed from all notifications.", { duration: 2000 });
  };

  // 24x7 Customer Care States & Handlers
  const [supportSearchQuery, setSupportSearchQuery] = useState("");
  const [supportTicket, setSupportTicket] = useState({ issueType: "", description: "" });
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  const handleSupportSearch = (e) => {
    e.preventDefault();
    if (!supportSearchQuery.trim()) {
      toast.error("Please enter a search term.");
      return;
    }
    toast.success(`Searching support topics for: "${supportSearchQuery}"`, { icon: "🔍" });
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!supportTicket.issueType) {
      toast.error("Please select an issue type.");
      return;
    }
    if (!supportTicket.description.trim()) {
      toast.error("Please describe your issue.");
      return;
    }
    toast.success("Support ticket submitted successfully! We will get back to you shortly.", {
      duration: 3000,
      icon: "🎫"
    });
    setSupportTicket({ issueType: "", description: "" });
  };

  const handleCreateCampaign = () => {
    toast.success("Initializing Campaign Creator Tool...", { icon: "📈" });
  };

  const handleCreateOffer = () => {
    toast.success("Initializing Deal and Offer Creator...", { icon: "🏷️" });
  };

  const handleContactSales = () => {
    toast.success("Connecting with our Advertising Relations team...", { icon: "🤝" });
  };

  const handleSellerInputChange = (e) => {
    const { name, value } = e.target;
    // Length limits for GSTIN and PAN
    if (name === "gstin" && value.length > 15) return;
    if (name === "pan" && value.length > 10) return;
    setSellerFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSellerSubmit = (e) => {
    e.preventDefault();

    if (sellerFormData.bankAccount !== sellerFormData.confirmBankAccount) {
      toast.error("Account Numbers do not match! Please check and confirm.");
      return;
    }

    if (!ifscVerified) {
      toast.error("Please verify your IFSC code first.");
      return;
    }

    if (!uploadedChequeName) {
      toast.error("Please upload a copy of your cancelled cheque or passbook.");
      return;
    }

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
    setIfscVerified(false);
    setUploadedChequeName("");
  };

  const handleResetSellerApplication = () => {
    localStorage.removeItem("shopease_seller_data");
    setSellerApplication(null);
    setIfscVerified(false);
    setUploadedChequeName("");
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
      confirmBankAccount: "",
      ifsc: "",
      bankName: "HDFC Bank",
      branchName: "Andheri West, Mumbai",
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
      {/* Premium Profile Header Banner */}
      <div className="profile-hero-header">
        <div className="profile-hero-user-info">
          <div className="profile-hero-avatar">
            {profileData.firstName.charAt(0).toUpperCase()}
            {profileData.lastName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-hero-welcome">
            <span className="profile-hero-greeting">Welcome back,</span>
            <h1 className="profile-hero-name">{profileData.firstName} {profileData.lastName}</h1>
            <p className="profile-hero-meta">
              <span className="meta-item">{profileData.email}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{profileData.mobile}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="profile-tab-wrapper">
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
                          style={{ width: `${formStep === 1 ? 0 : 50}%` }}
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
                        {formStep === 3 && <Landmark size={22} className="seller-step-icon" />}
                      </div>
                      <div className="seller-step-header-text">
                        {formStep === 1 && (
                          <>
                            <h3>Store Setup</h3>
                            <p>Tell us about your store to set up your merchant account.</p>
                          </>
                        )}
                        {formStep === 2 && (
                          <>
                            <h3>Tax & Address</h3>
                            <p>Please provide your business tax information and address details.</p>
                          </>
                        )}
                        {formStep === 3 && (
                          <>
                            <h3>Bank Verification</h3>
                            <p>Add your bank account details to receive payments from ShopEase.</p>
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
                            <label>Store Name<span className="required-star">*</span></label>
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
                            <label>Store Category<span className="required-star">*</span></label>
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
                            <label>Store Description<span className="required-star">*</span></label>
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
                              <label>Business Type<span className="required-star">*</span></label>
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
                              <label>PAN Number<span className="required-star">*</span></label>
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
                              <label>Address Line 1<span className="required-star">*</span></label>
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
                              <label>City<span className="required-star">*</span></label>
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
                              <label>State<span className="required-star">*</span></label>
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
                              <label>Pincode<span className="required-star">*</span></label>
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
                              <label>Country<span className="required-star">*</span></label>
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
                          {/* Inside Card Security Notice */}
                          <div className="bank-security-notice">
                            <Shield size={16} className="security-notice-shield-icon" />
                            <span>Your bank details are 100% secure and encrypted. We do not share your bank information.</span>
                          </div>

                          <h4 className="form-section-title">Bank Account Details</h4>

                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>Account Holder Name<span className="required-star">*</span></label>
                              <input 
                                type="text" 
                                name="holderName" 
                                value={sellerFormData.holderName} 
                                onChange={handleSellerInputChange} 
                                placeholder="Pooja Gilada"
                                required 
                              />
                              <span className="field-helper-text">Name should be as per bank records</span>
                            </div>

                            <div className="form-input-field">
                              <label>Account Number<span className="required-star">*</span></label>
                              <input 
                                type="text" 
                                name="bankAccount" 
                                value={sellerFormData.bankAccount} 
                                onChange={handleSellerInputChange} 
                                placeholder="50200012345678"
                                pattern="^[0-9]{9,18}$"
                                title="Please enter a valid 9 to 18-digit bank account number."
                                required 
                              />
                              <span className="field-helper-text">Enter your active bank account number</span>
                            </div>
                          </div>

                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>Confirm Account Number<span className="required-star">*</span></label>
                              <input 
                                type="text" 
                                name="confirmBankAccount" 
                                value={sellerFormData.confirmBankAccount} 
                                onChange={handleSellerInputChange} 
                                placeholder="50200012345678"
                                required 
                              />
                              <span className="field-helper-text">Re-enter account number to confirm</span>
                            </div>

                            <div className="form-input-field">
                              <label>IFSC Code<span className="required-star">*</span></label>
                              <div className="ifsc-input-verify-wrapper">
                                <input 
                                  type="text" 
                                  name="ifsc" 
                                  value={sellerFormData.ifsc} 
                                  onChange={handleSellerInputChange} 
                                  placeholder="HDFCO0001234"
                                  pattern="^[A-Za-z]{4}[0-9A-Za-z]{7}$"
                                  title="Please enter a valid 11-character IFSC code."
                                  required 
                                />
                                <button 
                                  type="button" 
                                  className="verify-ifsc-btn"
                                  onClick={() => {
                                    if (sellerFormData.ifsc.length === 11) {
                                      setIfscVerified(true);
                                      toast.success("IFSC Code verified successfully!");
                                    } else {
                                      toast.error("Please enter a valid 11-character IFSC code.");
                                    }
                                  }}
                                >
                                  Verify IFSC
                                </button>
                              </div>
                              <span className="field-helper-text">Enter 11 character IFSC code</span>
                              
                              {ifscVerified && (
                                <div className="ifsc-verified-badge">
                                  <Check size={12} className="badge-check-icon" />
                                  <span>{sellerFormData.bankName} Limited</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="form-grid-2-col">
                            <div className="form-input-field">
                              <label>Bank Name<span className="required-star">*</span></label>
                              <select 
                                name="bankName" 
                                value={sellerFormData.bankName} 
                                onChange={handleSellerInputChange}
                                required
                              >
                                <option value="HDFC Bank">HDFC Bank</option>
                                <option value="SBI">SBI</option>
                                <option value="ICICI Bank">ICICI Bank</option>
                                <option value="Axis Bank">Axis Bank</option>
                              </select>
                            </div>

                            <div className="form-input-field">
                              <label>Branch Name<span className="required-star">*</span></label>
                              <input 
                                type="text" 
                                name="branchName" 
                                value={sellerFormData.branchName} 
                                onChange={handleSellerInputChange} 
                                placeholder="Andheri West, Mumbai"
                                required 
                              />
                              <span className="field-helper-text">Enter your bank branch name</span>
                            </div>
                          </div>

                          <h4 className="form-section-title">Upload Cancelled Cheque / Passbook</h4>
                          <p className="upload-description">Upload a clear image of your cancelled cheque or passbook first page.</p>

                          <div className="upload-grid-row">
                            <div className="upload-dropzone-col">
                              <label className="dropzone-label">
                                <input 
                                  type="file" 
                                  accept="image/*,.pdf" 
                                  className="dropzone-file-input" 
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setUploadedChequeName(e.target.files[0].name);
                                      toast.success(`Selected file: ${e.target.files[0].name}`);
                                    }
                                  }}
                                />
                                <div className="dropzone-inner-content">
                                  <UploadCloud size={32} className="upload-cloud-icon" />
                                  <span className="upload-action-text">
                                    {uploadedChequeName ? `File: ${uploadedChequeName}` : "Click to upload or drag and drop"}
                                  </span>
                                  <span className="upload-sub-text">JPG, PNG or PDF (Max. 5MB)</span>
                                </div>
                              </label>
                            </div>

                            <div className="upload-example-col">
                              <img 
                                src="/cancelled_cheque_example.png" 
                                alt="Cancelled Cheque Example" 
                                className="cheque-example-img" 
                              />
                              <div className="example-details">
                                <span className="example-label">Example</span>
                                <p className="example-desc">Make sure account number and IFSC are clearly visible.</p>
                              </div>
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
                          <span>{formStep === 3 ? "Submit for Verification" : "Next Step"}</span>
                          <ArrowRight size={16} className="btn-right-icon" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security notice footer */}
                  <div className={`seller-form-security-footer step-${formStep}`}>
                    {formStep === 1 && (
                      <>
                        <Shield size={16} className="security-footer-icon" />
                        <span>Your information is secure and will only be used to set up your seller account.</span>
                      </>
                    )}
                    {formStep === 2 && (
                      <>
                        <Lock size={16} className="security-footer-icon" />
                        <span>Your information is secure and will only be used to set up your seller account.</span>
                      </>
                    )}
                    {formStep === 3 && (
                      <>
                        <Clock size={16} className="security-footer-icon" />
                        <span>Verification may take up to 24-48 hours. You will be notified via email once approved.</span>
                      </>
                    )}
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
                </div>
              </div>
              {/* Bottom Layout section */}
              <div className="rewards-bottom-layout">
                {/* Recent Activity */}
                <div className="recent-activity-panel">
                  <div className="panel-header-row">
                    <h3>Recent Activity</h3>
                  </div>
                  <div className="activity-table-container">
                    {/* Fixed Header Table */}
                    <table className="activity-table header-only-table">
                      <thead>
                        <tr>
                          <th className="col-date">Date</th>
                          <th className="col-desc">Description</th>
                          <th className="col-points">Points</th>
                          <th className="col-status">Status</th>
                        </tr>
                      </thead>
                    </table>
                    
                    {/* Scrollable Body Table */}
                    <div className="activity-table-scrollbar-wrapper">
                      <table className="activity-table body-only-table">
                        <tbody>
                          {rewardsActivities.slice(0, 10).map((act, idx) => {
                            const isCredit = act.status === "Credited";
                            return (
                              <tr key={idx}>
                                <td className="col-date">{act.date}</td>
                                <td className="col-desc">{act.desc}</td>
                                <td className={`col-points ${isCredit ? "points-credited" : "points-debited"}`}>
                                  {Math.abs(act.points)}
                                </td>
                                <td className="col-status">
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

          {currentTab === "notifications" && (
            <div className="notifications-tab-content">
              {/* Header Row */}
              <div className="notifications-header-row">
                <div className="notifications-title-group">
                  <h1>Notification Preferences</h1>
                  <p>Choose how and when you want to hear from ShopEase.</p>
                </div>
                <button 
                  onClick={handleUnsubscribeAll}
                  className="unsubscribe-btn"
                >
                  <BellOff size={16} />
                  <span>Unsubscribe from All</span>
                </button>
              </div>

              {/* Preferences Cards */}
              <div className="notifications-cards-list">
                
                {/* 1. Order Updates */}
                <div className="notification-section-card">
                  <div className="notification-card-header">
                    <div className="notification-icon-wrapper gift-wrapper">
                      <Gift size={20} />
                    </div>
                    <div className="notification-header-details">
                      <h3>Order Updates</h3>
                      <p>Stay updated about your orders and deliveries.</p>
                    </div>
                    <div className="channel-headers">
                      <span>Email</span>
                      <span>SMS</span>
                      <span>Push</span>
                    </div>
                  </div>

                  <div className="notification-settings-list">
                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Order Confirmations</h4>
                        <p>Get notified when your order is placed successfully.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.orderConfirmations.email} 
                            onChange={() => handleTogglePref("orderConfirmations", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.orderConfirmations.sms} 
                            onChange={() => handleTogglePref("orderConfirmations", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.orderConfirmations.push} 
                            onChange={() => handleTogglePref("orderConfirmations", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>

                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Shipping & Delivery Updates</h4>
                        <p>Get notified about shipping, out for delivery and delivered updates.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.shippingUpdates.email} 
                            onChange={() => handleTogglePref("shippingUpdates", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.shippingUpdates.sms} 
                            onChange={() => handleTogglePref("shippingUpdates", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.shippingUpdates.push} 
                            onChange={() => handleTogglePref("shippingUpdates", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>

                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Order Cancellations & Returns</h4>
                        <p>Get notified for order cancellations, returns and refunds.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.cancellationsReturns.email} 
                            onChange={() => handleTogglePref("cancellationsReturns", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.cancellationsReturns.sms} 
                            onChange={() => handleTogglePref("cancellationsReturns", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.cancellationsReturns.push} 
                            onChange={() => handleTogglePref("cancellationsReturns", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Offers & Promotions */}
                <div className="notification-section-card">
                  <div className="notification-card-header">
                    <div className="notification-icon-wrapper tag-wrapper">
                      <Tag size={20} />
                    </div>
                    <div className="notification-header-details">
                      <h3>Offers & Promotions</h3>
                      <p>Never miss an exciting deal or discount.</p>
                    </div>
                    <div className="channel-headers">
                      <span>Email</span>
                      <span>SMS</span>
                      <span>Push</span>
                    </div>
                  </div>

                  <div className="notification-settings-list">
                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Exclusive Offers</h4>
                        <p>Receive exclusive offers, deals and early access.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.exclusiveOffers.email} 
                            onChange={() => handleTogglePref("exclusiveOffers", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.exclusiveOffers.sms} 
                            onChange={() => handleTogglePref("exclusiveOffers", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.exclusiveOffers.push} 
                            onChange={() => handleTogglePref("exclusiveOffers", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>

                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Sale & Discounts</h4>
                        <p>Get notified about sales, discounts and limited time offers.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.saleDiscounts.email} 
                            onChange={() => handleTogglePref("saleDiscounts", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.saleDiscounts.sms} 
                            onChange={() => handleTogglePref("saleDiscounts", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.saleDiscounts.push} 
                            onChange={() => handleTogglePref("saleDiscounts", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>

                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Price Drop Alerts</h4>
                        <p>Be the first to know when the price of your wishlist items drops.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.priceDrops.email} 
                            onChange={() => handleTogglePref("priceDrops", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.priceDrops.sms} 
                            onChange={() => handleTogglePref("priceDrops", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.priceDrops.push} 
                            onChange={() => handleTogglePref("priceDrops", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Account & Security */}
                <div className="notification-section-card">
                  <div className="notification-card-header">
                    <div className="notification-icon-wrapper shield-wrapper">
                      <Shield size={20} />
                    </div>
                    <div className="notification-header-details">
                      <h3>Account & Security</h3>
                      <p>Important updates related to your account.</p>
                    </div>
                    <div className="channel-headers">
                      <span>Email</span>
                      <span>SMS</span>
                      <span>Push</span>
                    </div>
                  </div>

                  <div className="notification-settings-list">
                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Account Activity</h4>
                        <p>Get notified about logins, password changes and profile updates.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.accountActivity.email} 
                            onChange={() => handleTogglePref("accountActivity", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.accountActivity.sms} 
                            onChange={() => handleTogglePref("accountActivity", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.accountActivity.push} 
                            onChange={() => handleTogglePref("accountActivity", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>

                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Security Alerts</h4>
                        <p>Important alerts about suspicious activity and security updates.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.securityAlerts.email} 
                            onChange={() => handleTogglePref("securityAlerts", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.securityAlerts.sms} 
                            onChange={() => handleTogglePref("securityAlerts", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.securityAlerts.push} 
                            onChange={() => handleTogglePref("securityAlerts", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. General Notifications */}
                <div className="notification-section-card">
                  <div className="notification-card-header">
                    <div className="notification-icon-wrapper general-wrapper">
                      <Megaphone size={20} />
                    </div>
                    <div className="notification-header-details">
                      <h3>General Notifications</h3>
                      <p>General updates from ShopEase.</p>
                    </div>
                    <div className="channel-headers">
                      <span>Email</span>
                      <span>SMS</span>
                      <span>Push</span>
                    </div>
                  </div>

                  <div className="notification-settings-list">
                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>New Arrivals</h4>
                        <p>Get notified about new products and collections.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.newArrivals.email} 
                            onChange={() => handleTogglePref("newArrivals", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.newArrivals.sms} 
                            onChange={() => handleTogglePref("newArrivals", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.newArrivals.push} 
                            onChange={() => handleTogglePref("newArrivals", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>

                    <div className="setting-row-item">
                      <div className="setting-info">
                        <h4>Surveys & Feedback</h4>
                        <p>Receive requests for surveys and share your feedback.</p>
                      </div>
                      <div className="setting-channels-toggles">
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.surveysFeedback.email} 
                            onChange={() => handleTogglePref("surveysFeedback", "email")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.surveysFeedback.sms} 
                            onChange={() => handleTogglePref("surveysFeedback", "sms")}
                          />
                          <span className="switch-slider" />
                        </label>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={notificationPrefs.surveysFeedback.push} 
                            onChange={() => handleTogglePref("surveysFeedback", "push")}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentTab === "care" && (
            <div className="care-tab-content">
              {/* 1. Hero Banner */}
              <div className="care-hero-banner">
                <div className="care-hero-text">
                  <h1>We're Here to Help!</h1>
                  <p>Find answers to your queries or connect with our support team. Our team is available 24x7 to assist you.</p>
                  
                  <div className="search-topics-section">
                    <label className="search-topics-label">Search Support Topics</label>
                    <form onSubmit={handleSupportSearch} className="care-search-form">
                      <div className="search-input-wrapper">
                        <Search size={18} className="search-icon-inside" />
                        <input 
                          type="text" 
                          placeholder="Search for help topics, issues or questions..."
                          value={supportSearchQuery}
                          onChange={(e) => setSupportSearchQuery(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="care-search-btn">Search</button>
                    </form>
                  </div>
                </div>
                
                <div className="care-hero-illustration">
                  <div className="illustration-backdrop-circle"></div>
                  <img src="/assets/support_agent.png" alt="Customer Support Agent" className="support-agent-img" />
                  <div className="badge-247">24/7</div>
                </div>
              </div>

              {/* 2. Middle Row: Popular Topics & Need More Help? */}
              <div className="care-row-split middle-row">
                {/* Popular Topics */}
                <div className="popular-topics-container">
                  <h2>Popular Topics</h2>
                  <div className="popular-topics-grid">
                    <div className="topic-card" onClick={() => setSearchParams({ tab: "orders" })}>
                      <div className="topic-icon-wrapper">
                        <Package size={22} />
                      </div>
                      <div className="topic-details">
                        <h3>Track Order</h3>
                        <p>Track your order status in real-time</p>
                      </div>
                      <ChevronRight size={18} className="topic-arrow" />
                    </div>

                    <div className="topic-card" onClick={() => setSearchParams({ tab: "orders" })}>
                      <div className="topic-icon-wrapper">
                        <RotateCcw size={22} />
                      </div>
                      <div className="topic-details">
                        <h3>Return Product</h3>
                        <p>Request a return or check eligibility</p>
                      </div>
                      <ChevronRight size={18} className="topic-arrow" />
                    </div>

                    <div className="topic-card" onClick={() => setSearchParams({ tab: "orders" })}>
                      <div className="topic-icon-wrapper">
                        <CreditCard size={22} />
                      </div>
                      <div className="topic-details">
                        <h3>Refund Status</h3>
                        <p>Check your refund status and history</p>
                      </div>
                      <ChevronRight size={18} className="topic-arrow" />
                    </div>

                    <div className="topic-card" onClick={() => toast.success("Opening payment resolutions desk...", { icon: "💳" })}>
                      <div className="topic-icon-wrapper">
                        <Landmark size={22} />
                      </div>
                      <div className="topic-details">
                        <h3>Payment Issue</h3>
                        <p>Resolve payment failures or errors</p>
                      </div>
                      <ChevronRight size={18} className="topic-arrow" />
                    </div>
                  </div>
                </div>

                {/* Need More Help? */}
                <div className="help-channels-container">
                  <h2>Need More Help?</h2>
                  <div className="help-channels-list">
                    <div className="help-channel-item" onClick={() => toast.success("Connecting to a live chat agent...", { icon: "💬" })}>
                      <div className="channel-icon-wrapper">
                        <MessageSquare size={18} />
                      </div>
                      <div className="channel-details">
                        <h3>Chat Support</h3>
                        <p>Talk to our support executive</p>
                      </div>
                      <div className="channel-action-area">
                        <span className="channel-badge green-badge">Available 24x7</span>
                        <ChevronRight size={18} className="channel-arrow" />
                      </div>
                    </div>

                    <a href="mailto:support@shopease.sbs" className="help-channel-item link-item">
                      <div className="channel-icon-wrapper">
                        <Mail size={18} />
                      </div>
                      <div className="channel-details">
                        <h3>Email Support</h3>
                        <p>support@shopease.sbs</p>
                      </div>
                      <div className="channel-action-area">
                        <ChevronRight size={18} className="channel-arrow" />
                      </div>
                    </a>

                    <a href="tel:+911234567890" className="help-channel-item link-item">
                      <div className="channel-icon-wrapper">
                        <Phone size={18} />
                      </div>
                      <div className="channel-details">
                        <h3>Call Support</h3>
                        <p>+91 12345 67890 <span className="subtext">(Toll Free)</span></p>
                      </div>
                      <div className="channel-action-area">
                        <span className="channel-badge green-badge">Available 24x7</span>
                        <ChevronRight size={18} className="channel-arrow" />
                      </div>
                    </a>

                    <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="help-channel-item link-item">
                      <div className="channel-icon-wrapper">
                        <MessageCircle size={18} />
                      </div>
                      <div className="channel-details">
                        <h3>WhatsApp Support</h3>
                        <p>+91 12345 67890</p>
                      </div>
                      <div className="channel-action-area">
                        <span className="channel-badge green-badge">Available 24x7</span>
                        <ChevronRight size={18} className="channel-arrow" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* 3. Bottom Row: Raise a Support Ticket & Frequently Asked Questions */}
              <div className="care-row-split bottom-row">
                {/* Raise a Support Ticket */}
                <div className="ticket-form-card">
                  <div className="ticket-header-block">
                    <div className="ticket-title-desc">
                      <h2>Raise a Support Ticket</h2>
                      <p>Can't find what you're looking for? Submit a ticket and we'll get back to you.</p>
                    </div>
                    <div className="ticket-graphic-icon">
                      <svg className="clipboard-icon-svg" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="15" y="10" width="30" height="42" rx="4" fill="#FFEAEB" stroke="#c10654" strokeWidth="2"/>
                        <rect x="22" y="6" width="16" height="8" rx="2" fill="#c10654"/>
                        <line x1="22" y1="22" x2="38" y2="22" stroke="#c10654" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="22" y1="30" x2="34" y2="30" stroke="#c10654" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="22" y1="38" x2="38" y2="38" stroke="#c10654" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="44" cy="44" r="8" fill="#4ade80" />
                        <path d="M41 44L43 46L47 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  <form onSubmit={handleTicketSubmit} className="ticket-form">
                    <div className="form-group">
                      <select 
                        value={supportTicket.issueType}
                        onChange={(e) => setSupportTicket(prev => ({ ...prev, issueType: e.target.value }))}
                        className="ticket-select"
                      >
                        <option value="" disabled>Select Issue Type</option>
                        <option value="Order Tracking">Order Tracking</option>
                        <option value="Returns & Refunds">Returns & Refunds</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Seller Onboarding">Seller Onboarding</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group textarea-group">
                      <textarea 
                        placeholder="Describe your issue in detail..."
                        value={supportTicket.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 1000) {
                            setSupportTicket(prev => ({ ...prev, description: e.target.value }));
                          }
                        }}
                        className="ticket-textarea"
                        rows={4}
                      />
                      <span className="char-counter">{supportTicket.description.length}/1000</span>
                    </div>

                    <button type="submit" className="ticket-submit-btn">Submit Ticket</button>
                  </form>
                </div>

                {/* Frequently Asked Questions */}
                <div className="faq-accordion-container">
                  <div className="faq-header-block">
                    <h2>Frequently Asked Questions</h2>
                    <span className="view-all-faqs" onClick={() => toast.success("Loading all FAQ topics...", { icon: "📖" })}>View All FAQs</span>
                  </div>

                  <div className="faq-accordion-list">
                    {[
                      {
                        q: "How do I track my order?",
                        a: "You can track your order using the 'Track Order' option under your profile page or by entering your order ID on the tracking page."
                      },
                      {
                        q: "How long does a refund take?",
                        a: "Refunds usually take 5-7 business days to reflect in your original payment method once the return is processed."
                      },
                      {
                        q: "My payment failed but money was deducted. What should I do?",
                        a: "If money was deducted for a failed payment, it is usually refunded automatically by your bank within 2-3 business days. If not, raise a ticket with payment details."
                      },
                      {
                        q: "How do I return a product?",
                        a: "Go to your Orders, select the item you want to return, and click on 'Return Product'. If eligible, we will schedule a pickup."
                      }
                    ].map((item, index) => {
                      const isExpanded = expandedFaqIndex === index;
                      return (
                        <div key={index} className={`faq-accordion-item ${isExpanded ? 'active' : ''}`}>
                          <div className="faq-question-row" onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}>
                            <h3>{item.q}</h3>
                            <ChevronDown size={18} className="faq-chevron" />
                          </div>
                          <div className="faq-answer-row">
                            <p>{item.a}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "advertise" && (
            <div className="advertise-tab-content">
              {/* 1. Hero Banner */}
              <div className="advertise-hero-banner">
                <div className="advertise-hero-left">
                  <h1>Advertise on <span className="highlight-text">ShopEase</span></h1>
                  <p className="advertise-subtitle">Promote your products, increase visibility and reach millions of active customers across India.</p>
                  
                  <div className="advertise-bullets-row">
                    <div className="bullet-item">
                      <div className="bullet-icon-circle">
                        <Users size={16} />
                      </div>
                      <div className="bullet-text">
                        <h4>Millions of</h4>
                        <p>Active Users</p>
                      </div>
                    </div>
                    <div className="bullet-item">
                      <div className="bullet-icon-circle">
                        <TrendingUp size={16} />
                      </div>
                      <div className="bullet-text">
                        <h4>Boost Brand</h4>
                        <p>Visibility</p>
                      </div>
                    </div>
                    <div className="bullet-item">
                      <div className="bullet-icon-circle">
                        <Target size={16} />
                      </div>
                      <div className="bullet-text">
                        <h4>Higher Conversions</h4>
                        <p>& Sales</p>
                      </div>
                    </div>
                  </div>

                  <div className="advertise-btn-group">
                    <button onClick={handleCreateCampaign} className="btn-filled-pink">Start Advertising</button>
                    <button onClick={() => toast.success("Loading advertising guides...")} className="btn-outlined-pink">Learn More</button>
                  </div>
                </div>

                <div className="advertise-hero-illustration">
                  <div className="illustration-glow-effect"></div>
                  <img src="/assets/advertise_hero.png" alt="Advertising Megaphone" className="advertise-banner-img" />
                </div>
              </div>

              {/* 2. Advertising Solutions Grid */}
              <div className="solutions-section">
                <h2>Advertising Solutions</h2>
                <div className="solutions-grid">
                  {/* Sponsored Products */}
                  <div className="solution-column-card card-pink">
                    <div className="solution-icon-wrapper circle-pink">
                      <Tag size={20} />
                    </div>
                    <h3>Sponsored Products</h3>
                    <p className="solution-card-desc">Promote your products in search results and product pages.</p>
                    
                    <ul className="solution-features-list">
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Increase product visibility</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Reach high-intent customers</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Pay only for performance</span>
                      </li>
                    </ul>
                    
                    <button onClick={handleCreateCampaign} className="solution-card-btn btn-pink">Create Campaign</button>
                  </div>

                  {/* Brand Showcase */}
                  <div className="solution-column-card card-orange">
                    <div className="solution-icon-wrapper circle-orange">
                      <Store size={20} />
                    </div>
                    <h3>Brand Showcase</h3>
                    <p className="solution-card-desc">Showcase your brand with a dedicated banner and store.</p>
                    
                    <ul className="solution-features-list">
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Build brand awareness</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Premium brand presence</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Drive more traffic</span>
                      </li>
                    </ul>
                    
                    <button onClick={() => toast.success("Opening brand showcase details...")} className="solution-card-btn btn-orange">Learn More</button>
                  </div>

                  {/* Deals & Offers */}
                  <div className="solution-column-card card-purple">
                    <div className="solution-icon-wrapper circle-purple">
                      <Zap size={20} />
                    </div>
                    <h3>Deals & Offers</h3>
                    <p className="solution-card-desc">Promote your offers and discounts to attract more buyers.</p>
                    
                    <ul className="solution-features-list">
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Highlight exciting offers</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Increase engagement</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Boost conversions</span>
                      </li>
                    </ul>
                    
                    <button onClick={handleCreateOffer} className="solution-card-btn btn-purple">Create Offer</button>
                  </div>

                  {/* Premium Placement */}
                  <div className="solution-column-card card-green">
                    <div className="solution-icon-wrapper circle-green">
                      <Star size={20} />
                    </div>
                    <h3>Premium Placement</h3>
                    <p className="solution-card-desc">Get premium placements on homepage and category pages.</p>
                    
                    <ul className="solution-features-list">
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Maximum visibility</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Top slots on key pages</span>
                      </li>
                      <li>
                        <Check size={14} className="check-icon" />
                        <span>Higher brand recall</span>
                      </li>
                    </ul>
                    
                    <button onClick={handleContactSales} className="solution-card-btn btn-green">Contact Sales</button>
                  </div>
                </div>
              </div>

              {/* 3. Grow Your Business horizontal banner */}
              <div className="grow-business-banner">
                <div className="grow-left-block">
                  <div className="trophy-wrapper">
                    <Trophy size={32} className="trophy-icon-style" />
                  </div>
                  <div className="grow-title-text">
                    <h3>Grow Your Business with <span className="highlight-text">ShopEase</span></h3>
                    <p>Join thousands of successful sellers who are growing their business with our advertising solutions.</p>
                  </div>
                </div>

                <div className="grow-stats-group">
                  <div className="grow-stat-box">
                    <div className="stat-icon-wrapper">
                      <Users size={16} />
                    </div>
                    <div className="stat-text-val">
                      <h4>10M+</h4>
                      <p>Monthly Visitors</p>
                    </div>
                  </div>
                  
                  <div className="grow-stat-box">
                    <div className="stat-icon-wrapper">
                      <Store size={16} />
                    </div>
                    <div className="stat-text-val">
                      <h4>50K+</h4>
                      <p>Active Sellers</p>
                    </div>
                  </div>

                  <div className="grow-stat-box">
                    <div className="stat-icon-wrapper">
                      <ShoppingBag size={16} />
                    </div>
                    <div className="stat-text-val">
                      <h4>5M+</h4>
                      <p>Products Sold</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleCreateCampaign} className="grow-cta-btn">Start Now</button>
              </div>
            </div>
          )}

          {currentTab !== "profile" && currentTab !== "seller" && currentTab !== "orders" && currentTab !== "rewards" && currentTab !== "notifications" && currentTab !== "care" && currentTab !== "advertise" && (
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
      </div>
    </div>
  );
};

export default Profile;
