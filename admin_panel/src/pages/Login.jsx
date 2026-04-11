import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/authService';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      // Save token or admin info as needed (e.g., localStorage)
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-bg h-screen overflow-hidden flex flex-col items-center pt-16">
      <div className="login-shell flex flex-col items-center gap-8">
        <div className="admin-logo text-3xl sm:text-4xl font-semibold tracking-tight text-center text-gray-900 w-full">
          Shop<span className="logo-e">E</span>ase Admin
        </div>

        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Hello Admin, Please login to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="field-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopease.com"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
