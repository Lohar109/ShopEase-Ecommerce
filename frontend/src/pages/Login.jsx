import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Laptop, Heart, ShoppingBag, User, Sun, Cloud, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [registerOtp, setRegisterOtp] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('shopease_auth_mode');
    localStorage.removeItem('shopease_auth_mode');
    return saved === 'register' ? 'register' : 'login';
  });
  const [step, setStep] = useState(1); // 1: Enter Email/Mobile, 2: Enter OTP
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Timer logic for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // Check if the value starts with a digit or a plus sign
    const isNumeric = /^[0-9+]/.test(val);
    
    if (isNumeric) {
      // Strip any existing "+91" prefix
      let cleanVal = val.replace(/^\+91\s*/, '');
      // Keep only digits
      cleanVal = cleanVal.replace(/\D/g, '');
      // Strip a single leading zero if it was typed or pasted
      cleanVal = cleanVal.replace(/^0/, '');
      
      // Limit to 10 digits for standard Indian mobile number
      if (cleanVal.length > 10) {
        cleanVal = cleanVal.slice(0, 10);
      }
      
      if (cleanVal.length === 0) {
        setInputVal('');
      } else {
        setInputVal(`+91 ${cleanVal}`);
      }
    } else {
      // It's an email/other text, don't format with +91
      setInputVal(val);
    }
  };
  const handleOtpChange = (element, index) => {
    const value = element.value.replace(/\D/g, '');
    if (!value) {
      const newOtp = [...otpArray];
      newOtp[index] = '';
      setOtpArray(newOtp);
      return;
    }
    
    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);
    
    // Auto focus next input
    if (value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpArray];
      if (!otpArray[index] && e.target.previousSibling) {
        newOtp[index - 1] = '';
        setOtpArray(newOtp);
        e.target.previousSibling.focus();
      } else {
        newOtp[index] = '';
        setOtpArray(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otpArray];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtpArray(newOtp);
      
      const focusIndex = Math.min(pastedData.length, 5);
      const inputs = document.querySelectorAll('.otp-digit-input');
      if (inputs[focusIndex]) {
        inputs[focusIndex].focus();
      }
    }
  };

  const formatTimer = (seconds) => {
    const s = seconds < 10 ? `0${seconds}` : seconds;
    return `00:${s}`;
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      setError(viewMode === 'register' ? 'Please enter your Mobile number.' : 'Please enter your Email or Mobile number.');
      return;
    }

    if (viewMode === 'register') {
      const digitsOnly = inputVal.replace(/^\+91\s*/, '').replace(/\D/g, '');
      const isMobile = /^\d{10}$/.test(digitsOnly);
      if (!isMobile) {
        setError('Please enter a valid 10-digit Mobile number.');
        return;
      }
    } else {
      const isEmail = /\S+@\S+\.\S+/.test(inputVal);
      const digitsOnly = inputVal.replace(/^\+91\s*/, '').replace(/\D/g, '');
      const isMobile = /^\d{10}$/.test(digitsOnly);
      if (!isEmail && !isMobile) {
        setError('Please enter a valid Email address or 10-digit Mobile number.');
        return;
      }
    }

    setError('');
    setLoading(true);

    // Mock OTP dispatch
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimer(30);
      setOtpArray(['', '', '', '', '', '']);
      setRegisterOtp('');
      setToastMessage(`Verification code sent to ${inputVal}`);
      
      // Auto focus the first input after step transition
      setTimeout(() => {
        if (viewMode === 'register') {
          const regInput = document.querySelector('#register-otp-input');
          if (regInput) regInput.focus();
        } else {
          const firstInput = document.querySelector('.otp-digit-input');
          if (firstInput) firstInput.focus();
        }
      }, 50);

      // Dismiss toast after 4s
      setTimeout(() => {
        setToastMessage('');
      }, 4000);
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fullOtp = viewMode === 'register' ? registerOtp : otpArray.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (fullOtp !== '482065') {
      setError('Incorrect OTP. Try entering 482065.');
      return;
    }

    setError('');
    setLoading(true);

    // Mock verification
    setTimeout(() => {
      setLoading(false);
      alert(viewMode === 'register' ? 'Registration successful! Welcome to ShopEase.' : 'Login successful! Welcome back to ShopEase.');
      navigate('/');
    }, 1200);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setTimer(30);
    setError('');
    setOtpArray(['', '', '', '', '', '']);
    setRegisterOtp('');
    setToastMessage(`Verification code sent to ${inputVal}`);

    setTimeout(() => {
      if (viewMode === 'register') {
        const regInput = document.querySelector('#register-otp-input');
        if (regInput) regInput.focus();
      } else {
        const firstInput = document.querySelector('.otp-digit-input');
        if (firstInput) firstInput.focus();
      }
    }, 50);

    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  return (
    <div className="login-page-container">
      {/* Background Glowing Blobs */}
      <div className="login-bg-glow blob-1" />
      <div className="login-bg-glow blob-2" />

      {/* Main Flipkart-Style Split Login Card */}
      <div className="login-split-card">
        
        {/* Left Side: Brand Promo Panel */}
        <div className="login-left-brand-panel">
          <div className="brand-panel-text">
            <h2>{viewMode === 'register' ? "Looks like you're new here!" : "Login"}</h2>
            <p>{viewMode === 'register' ? "Sign up with your mobile number to get started" : "Get access to your Orders, Wishlist and Recommendations"}</p>
          </div>

          {/* Premium Bottom Vector Illustration */}
          <div className="brand-panel-illustration">
            {/* Sun & Cloud floating backdrop */}
            <div className="vector-sky-row">
              <span className="vector-sun"><Sun size={20} strokeWidth={2.5} /></span>
              <span className="vector-cloud"><Cloud size={24} strokeWidth={1.5} /></span>
            </div>

            {/* Laptop Screen & Floating badges */}
            <div className="vector-devices-wrap">
              {/* Left Badge: Heart */}
              <div className="floating-badge badge-heart">
                <Heart size={14} fill="#e33170" color="#e33170" />
              </div>

              {/* Main Laptop outline */}
              <div className="vector-laptop-container">
                <div className="laptop-screen-bezel">
                  <div className="laptop-screen-glass">
                    <User size={28} className="screen-avatar-icon" />
                  </div>
                </div>
                <div className="laptop-base-stand" />
              </div>

              {/* Right Badge: ShopBag */}
              <div className="floating-badge badge-bag">
                <ShoppingBag size={14} fill="#f59e0b" color="#f59e0b" />
              </div>
            </div>
            
            {/* Table stand ground line */}
            <div className="vector-ground-shelf" />
          </div>
        </div>

        {/* Right Side: Interactive Action Forms */}
        <div className="login-right-form-panel">
          {error && (
            <div className="login-error-alert" role="alert">
              <span className="error-alert-dot" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 ? (
            /* Form Step 1: Input Credential */
            <form onSubmit={handleRequestOtp} className="split-login-form">
              <div className="floating-underline-input-group">
                <input
                  type="text"
                  id="email-mobile-input"
                  className="underline-text-input"
                  placeholder=" " // necessary for CSS label state detection
                  value={inputVal}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  autoFocus
                />
                <label htmlFor="email-mobile-input" className="underline-floating-label">
                  {viewMode === 'register' ? 'Enter Mobile number' : 'Enter Email / Mobile number'}
                </label>
                <span className="underline-focus-bar" />
              </div>

              <p className="split-login-terms-text">
                By continuing, you agree to ShopEase's <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
              </p>

              <button type="submit" className="split-login-action-btn primary" disabled={loading}>
                {loading ? <span className="login-spinner-loader" /> : (viewMode === 'register' ? 'CONTINUE' : 'Request OTP')}
              </button>

              {viewMode === 'register' && (
                <button
                  type="button"
                  className="split-login-action-btn secondary-white"
                  onClick={() => { setViewMode('login'); setStep(1); setError(''); setInputVal(''); }}
                  disabled={loading}
                >
                  Existing User? Log in
                </button>
              )}
            </form>
          ) : (
            /* Form Step 2: Verify OTP */
            viewMode === 'register' ? (
              /* Registration OTP Screen */
              <form onSubmit={handleVerifyOtp} className="split-login-form step-otp register-otp">
                <div className="register-field-row disabled-mobile-row">
                  <div className="register-field-left">
                    <label className="register-field-label">Mobile Number</label>
                    <div className="register-field-value">{inputVal}</div>
                  </div>
                  <button 
                    type="button" 
                    className="register-field-action-btn"
                    onClick={() => { setStep(1); setError(''); }}
                  >
                    Change?
                  </button>
                </div>

                <div className="register-field-row otp-status-row">
                  <span className="otp-status-text">OTP sent to Mobile</span>
                  {timer > 0 ? (
                    <span className="otp-status-countdown">Resend in {formatTimer(timer)}</span>
                  ) : (
                    <button 
                      type="button" 
                      className="register-field-action-btn"
                      onClick={handleResendOtp}
                    >
                      Resend?
                    </button>
                  )}
                </div>

                <div className="floating-underline-input-group">
                  <input
                    type="text"
                    id="register-otp-input"
                    className="underline-text-input"
                    placeholder=" "
                    maxLength={6}
                    value={registerOtp}
                    onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    required
                    autoFocus
                  />
                  <label htmlFor="register-otp-input" className="underline-floating-label">
                    Enter OTP
                  </label>
                  <span className="underline-focus-bar" />
                </div>

                <button type="submit" className="split-login-action-btn primary" disabled={loading}>
                  {loading ? <span className="login-spinner-loader" /> : 'Signup'}
                </button>

                <button
                  type="button"
                  className="split-login-action-btn secondary-white"
                  onClick={() => { setViewMode('login'); setStep(1); setError(''); setInputVal(''); }}
                  disabled={loading}
                >
                  Existing User? Log in
                </button>
              </form>
            ) : (
              /* Login OTP Screen */
              <form onSubmit={handleVerifyOtp} className="split-login-form step-otp">
                <div className="otp-verification-header">
                  <p className="otp-sent-to-text">
                    Please enter the OTP sent to<br />
                    <span className="otp-recipient-highlight">{inputVal}</span>. 
                    <button type="button" className="otp-change-number-btn" onClick={() => { setStep(1); setError(''); }}>
                      Change
                    </button>
                  </p>
                </div>

                <div className="otp-inputs-row" onPaste={handleOtpPaste}>
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="otp-digit-input"
                      disabled={loading}
                      required
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="otp-timer-resend-row">
                  {timer > 0 ? (
                    <p className="otp-countdown-timer">
                      Not received your code? <span>{formatTimer(timer)}</span>
                    </p>
                  ) : (
                    <div className="otp-resend-action-wrap">
                      <p className="otp-countdown-timer">Not received your code? </p>
                      <button type="button" className="resend-otp-btn" onClick={handleResendOtp}>
                        Resend OTP
                      </button>
                    </div>
                  )}
                </div>

                <button type="submit" className="split-login-action-btn primary" disabled={loading}>
                  {loading ? <span className="login-spinner-loader" /> : 'Verify'}
                </button>
              </form>
            )
          )}

          {/* Bottom Card Sign-up Link */}
          {step === 1 && viewMode === 'login' && (
            <div className="split-login-footer">
              <span className="footer-register-link" onClick={() => { setViewMode('register'); setStep(1); setError(''); setInputVal(''); }}>
                New to ShopEase? Create an account
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Flipkart-Style Bottom Toast Notification */}
      {toastMessage && (
        <div className="login-bottom-toast">
          <span className="toast-success-icon">✓</span>
          <span className="toast-message-text">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Login;
