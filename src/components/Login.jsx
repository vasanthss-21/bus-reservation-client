import React, { useState } from 'react';
import { FaBus, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaGoogle, FaGithub } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const techBadges = [
  { icon: '⚛️', label: 'React' },
  { icon: '🌿', label: 'Spring Boot' },
  { icon: '🍃', label: 'MongoDB' },
  { icon: '💨', label: 'Tailwind CSS' },
];

export default function Login({ onLoginSuccess, onGoToRegister }) {
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
    <div className="min-h-screen flex" style={{ background: '#f8faff' }}>

      {/* ── Left Panel: Branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-12"
        style={{ background: 'linear-gradient(145deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FaBus className="text-white text-lg" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">TransitFlow</span>
        </div>

        {/* Center text */}
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your journey starts<br />here. 🚌
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-8" style={{textAlign: 'justify'}}>
            TransitFlow is a full-stack web application designed to demonstrate modern software architecture, seamless frontend–backend integration, and scalable cloud deployment.
          </p>
          <p className="text-indigo-100 text-sm leading-relaxed mb-8" style={{textAlign: 'justify'}}>
            The system provides a structured platform to manage transportation data, including routes, bookings, and operational insights through a centralized dashboard interface.
          </p> 
          <p className="text-indigo-100 text-sm leading-relaxed mb-8" style={{textAlign: 'justify'}}>
            Built with a focus on performance and usability, the application highlights real-time data handling, secure authentication, and efficient API communication between the client and server.
          </p>
          <p className="text-indigo-100 text-sm leading-relaxed mb-8" style={{textAlign: 'justify'}}>
            This project reflects strong implementation of full-stack development principles, including RESTful services, database integration, and responsive UI design.
          </p>
          {/* Tech badges */}
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

        {/* Bottom quote */}
        <p className="text-indigo-200 text-xs">"Seamless booking experience for everyone."</p>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <FaBus className="text-indigo-600 text-xl" />
            <span className="text-xl font-bold text-gray-900">TransitFlow</span>
          </div>

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
              <button type="button" id="forgot-password-btn" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'google-btn', icon: <FaGoogle className="text-red-500" />, label: 'Google' },
              { id: 'github-btn', icon: <FaGithub className="text-gray-800" />, label: 'GitHub' },
            ].map(({ id, icon, label }) => (
              <button
                key={label}
                id={id}
                type="button"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95"
                style={{ background: 'white', border: '1.5px solid #e2e8f0' }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button
              id="go-to-register-btn"
              onClick={onGoToRegister}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
