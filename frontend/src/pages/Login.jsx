import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    // Mock successful login
    setTimeout(() => {
      setLoading(false);
      alert(`Welcome back to ShopEase! Authorized successfully as ${email}.`);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="login-page-container">
      {/* Background Glowing Blobs */}
      <div className="login-bg-glow blob-1" />
      <div className="login-bg-glow blob-2" />

      <div className="login-card-wrap">
        <div className="login-header-block">
          <div className="login-logo-mark">
            <Sparkles size={24} className="login-logo-icon" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your premium ShopEase account</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <span className="error-alert-dot" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form-fields">
          {/* Email input field */}
          <div className="login-input-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input
                type="email"
                id="login-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="login-input-group">
            <div className="login-password-header">
              <label htmlFor="login-password">Password</label>
              <a href="#forgot" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Secure indicator */}
          <div className="login-form-options">
            <label className="login-remember-checkbox">
              <input type="checkbox" defaultChecked />
              <span className="checkbox-checkmark" />
              Keep me signed in
            </label>
            <div className="secure-badge">
              <ShieldCheck size={13} />
              <span>Secure Session</span>
            </div>
          </div>

          {/* Action button */}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner-loader" />
            ) : (
              <>
                Sign In <ArrowRight size={16} className="submit-arrow" />
              </>
            )}
          </button>
        </form>

        <div className="login-divider-row">
          <span className="divider-line" />
          <span className="divider-text">or continue with</span>
          <span className="divider-line" />
        </div>

        {/* Social Authentication buttons */}
        <div className="social-auth-grid">
          <button type="button" className="social-auth-btn" onClick={() => alert('Google social login triggered.')}>
            <span className="social-logo-google">G</span> Google
          </button>
          <button type="button" className="social-auth-btn" onClick={() => alert('Apple social login triggered.')}>
            <span className="social-logo-apple"></span> Apple
          </button>
        </div>

        {/* Footer signup prompt */}
        <p className="login-footer-signup-prompt">
          Don't have an account? <span className="signup-link" onClick={() => alert('Sign up page triggered.')}>Create one now</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
