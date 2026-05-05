import React, { useState } from 'react';
import { FaBus, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register({ onRegisterSuccess, onGoToLogin }) {
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
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
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
      const data = await res.json();   // expects { name, email, ... }
      onRegisterSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'reg-name',     name: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Enter your full name',  icon: <FaUser />,     show: null,       setShow: null },
    { id: 'reg-email',    name: 'email',    label: 'Email Address',   type: 'email',    placeholder: 'Enter your email',       icon: <FaEnvelope />, show: null,       setShow: null },
    { id: 'reg-password', name: 'password', label: 'Password',        type: showPassword ? 'text' : 'password', placeholder: 'Create a password', icon: <FaLock />, show: showPassword, setShow: setShowPassword },
    { id: 'reg-confirm',  name: 'confirm',  label: 'Confirm Password',type: showConfirm  ? 'text' : 'password', placeholder: 'Confirm your password', icon: <FaLock />, show: showConfirm,  setShow: setShowConfirm  },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 80% 50%, #0f1a3a 0%, #080d1e 60%, #0a0f24 100%)' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.25)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 60px rgba(99,102,241,0.08)',
          }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
            >
              <FaBus className="text-indigo-400 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                <span className="text-white">Transit</span>
                <span className="text-indigo-400">Flow</span>
              </div>
              <div className="text-xs text-slate-400 -mt-0.5">Fleet Management System</div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-1">Create Account</h1>
          <p className="text-slate-400 text-sm mb-6">Join TransitFlow and start booking today</p>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-red-400 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(({ id, name, label, type, placeholder, icon, show, setShow }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-300 mb-2">{label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{icon}</span>
                  <input
                    id={id}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  {setShow && (
                    <button
                      type="button"
                      id={`toggle-${id}`}
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
              className="mt-1 w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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
                <>
                  <FaUserPlus />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <button
              id="go-to-login-btn"
              onClick={onGoToLogin}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
