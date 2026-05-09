import React, { useState } from 'react';
import { FaBus, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import PageLoader from './PageLoader';

const API_URL = import.meta.env.VITE_API_URL;

const techBadges = [
  { icon: '⚛️', label: 'React' },
  { icon: '🌿', label: 'Spring Boot' },
  { icon: '🍃', label: 'MongoDB' },
  { icon: '💨', label: 'Tailwind CSS' },
];

// ─── Register Form (rendered inline) ───────────────────────────────────────
function RegisterPanel({ onRegisterSuccess, onGoToLogin, onNavigate }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Registration failed. Try a different email.');
      }
      const data = await res.json();
      onRegisterSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'reg-name',     name: 'name',     label: 'Full Name',        type: 'text',                              placeholder: 'Enter your full name',    icon: <FaUser />,     show: null,          setShow: null },
    { id: 'reg-email',    name: 'email',    label: 'Email Address',    type: 'email',                             placeholder: 'Enter your email',         icon: <FaEnvelope />, show: null,          setShow: null },
    { id: 'reg-password', name: 'password', label: 'Password',         type: showPassword ? 'text' : 'password', placeholder: 'Create a password',         icon: <FaLock />,     show: showPassword,  setShow: setShowPassword },
    { id: 'reg-confirm',  name: 'confirm',  label: 'Confirm Password', type: showConfirm  ? 'text' : 'password', placeholder: 'Confirm your password',     icon: <FaLock />,     show: showConfirm,   setShow: setShowConfirm },
  ];

  return (
    <div className="w-full max-w-md">
      {loading && <PageLoader />}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create Account</h1>
      <p className="text-gray-500 text-sm mb-6">Join TransitFlow and start booking today</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-red-600 text-sm font-medium"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ id, name, label, type, placeholder, icon, show, setShow }) => (
          <div key={name}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
              <input
                id={id}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-11 pr-11 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
                style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}
              />
              {setShow && (
                <button
                  type="button"
                  id={`toggle-${id}`}
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {show ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          id="register-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating account…
            </span>
          ) : (
            <><FaUserPlus /> Create Account</>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <button
          id="go-to-login-btn"
          onClick={() => { onNavigate('login'); }}
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}

// ─── Login Form ─────────────────────────────────────────────────────────────
function LoginPanel({ onLoginSuccess, onGoToRegister, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { const msg = await res.text(); throw new Error(msg || 'Invalid email or password.'); }
      const data = await res.json();
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {loading && <PageLoader />}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back!</h1>
      <p className="text-gray-500 text-sm mb-8">Sign in to continue to your dashboard</p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl text-red-600 text-sm font-medium"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
              style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-11 pr-12 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
              style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}
            />
            <button
              type="button"
              id="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              id="remember-me-toggle"
              onClick={() => setRememberMe(!rememberMe)}
              className="w-4 h-4 rounded flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                background: rememberMe ? '#6366f1' : 'white',
                border: rememberMe ? '1.5px solid #6366f1' : '1.5px solid #cbd5e1',
              }}
            >
              {rememberMe && <span className="text-white text-xs leading-none">✓</span>}
            </div>
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <button type="button" id="forgot-password-btn"
            onClick={() => onNavigate('forgot')}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            Forgot password?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          id="sign-in-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Signing in…
            </span>
          ) : (
            <><FaSignInAlt /> Sign In</>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <button
          id="go-to-register-btn"
          onClick={() => onNavigate('register')}
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          Create Account
        </button>
      </p>
    </div>
  );
}

// ─── Main Export: Single page, toggles between Login & Register ─────────────
export default function Login({ onLoginSuccess, onGoToRegister: _unused }) {
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [navLoading, setNavLoading] = useState(false);

  // Shows the PageLoader briefly before switching view (or navigating elsewhere)
  const handleNavigate = (destination) => {
    setNavLoading(true);
    setTimeout(() => {
      setNavLoading(false);
      if (destination === 'login' || destination === 'register') {
        setView(destination);
      }
      // 'forgot' — extend here when you add a forgot-password flow
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center lg:gap-6 gap-4 p-4 lg:p-8"
      style={{ background: '#000000a5'}}>
      <video autoPlay loop muted playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
        style={{ pointerEvents: 'none' }}>
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      {navLoading && <PageLoader />}

      {/* ── Branding Card ─────────────────────────────────────────────────── */}
      <div
        className="w-full lg:w-[48%] flex flex-col lg:justify-between p-6 lg:p-10 lg:self-stretch"
        style={{
          background: 'linear-gradient(145deg, #00a2ffff 0%, #5c25ffff 50%, #124189ff 100%)',
          borderRadius: '24px',
          border: '2.5px solid rgba(19, 4, 132, 1)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.22)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FaBus className="text-white text-lg" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">TransitFlow</span>
        </div>

        {/* Body — desktop only */}
        <div className="hidden lg:block pt-8">
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your journey starts here. 🚌
          </h2>
          <p className="text-indigo-200 text-sm mb-6">"Seamless booking experience for everyone."</p>
          <p className="text-indigo-100 text-sm leading-relaxed mb-3" style={{ textAlign: 'justify' }}>
            TransitFlow is a full-stack web application designed to demonstrate modern software architecture,
            seamless frontend–backend integration, and scalable cloud deployment.
          </p>
          <p className="text-indigo-100 text-sm leading-relaxed mb-3" style={{ textAlign: 'justify' }}>
            The system provides a structured platform to manage transportation data, including routes, bookings,
            and operational insights through a centralized dashboard interface.
          </p>
          <p className="text-indigo-100 text-sm leading-relaxed mb-3" style={{ textAlign: 'justify' }}>
            Built with a focus on performance and usability, the application highlights real-time data handling,
            secure authentication, and efficient API communication between the client and server.
          </p>
          <p className="text-indigo-100 text-sm leading-relaxed mb-6" style={{ textAlign: 'justify' }}>
            This project reflects strong implementation of full-stack development principles, including RESTful
            services, database integration, and responsive UI design.
          </p>
          <div className="flex flex-wrap gap-2">
            {techBadges.map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile — compact tagline + badges */}
        <div className="lg:hidden mt-4">
          <p className="text-indigo-100 text-xs mb-3">Fleet Management &amp; Booking Platform</p>
          <div className="flex flex-wrap gap-2">
            {techBadges.map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote — desktop only */}
        <p className="hidden lg:block text-indigo-200 text-xs mt-8">
          "Seamless booking experience for everyone."
        </p>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <div
        className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-10 lg:self-stretch"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '2.5px solid rgba(19, 4, 132, 1)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.10)',
        }}
      >
        {view === 'login' ? (
          <LoginPanel
            onLoginSuccess={onLoginSuccess}
            onGoToRegister={() => handleNavigate('register')}
            onNavigate={handleNavigate}
          />
        ) : (
          <RegisterPanel
            onRegisterSuccess={() => {
              setNavLoading(true);
              setTimeout(() => { setNavLoading(false); setView('login'); }, 800);
            }}
            onGoToLogin={() => handleNavigate('login')}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
}