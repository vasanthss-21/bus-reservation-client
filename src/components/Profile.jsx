import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaTicketAlt, FaChair, FaClock, FaRoute, FaSpinner, FaInbox } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    fetch(`${API_URL}/api/reservations/my?name=${encodeURIComponent(user.name)}`)
      .then(res => {
        if (!res.ok) throw new Error('Could not load your bookings.');
        return res.json();
      })
      .then(data => setBookings(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

      {/* ── Profile Card ── */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-5"
        style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}
      >
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        >
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-gray-900 capitalize">{user?.name}</h1>
          <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
            <FaEnvelope className="text-indigo-400" />
            {user?.email}
          </div>
        </div>

        <button
          id="profile-back-btn"
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          style={{ border: '1.5px solid #e0e7ff' }}
        >
          ← Back
        </button>
      </div>

      {/* ── Bookings Section ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaTicketAlt className="text-indigo-500" />
          My Bookings
        </h2>
        {!loading && !error && (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-indigo-700"
            style={{ background: '#eef2ff' }}
          >
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FaSpinner className="animate-spin text-3xl text-indigo-400 mb-3" />
          <p className="text-sm">Loading your bookings…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-red-600 text-sm"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FaInbox className="text-5xl text-gray-200 mb-4" />
          <p className="font-semibold text-gray-500">No bookings yet</p>
          <p className="text-sm mt-1">Book a seat and it'll appear here.</p>
          <button
            onClick={onBack}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            Browse Routes
          </button>
        </div>
      )}

      {/* Booking Cards */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking, idx) => (
            <div
              key={booking.id ?? idx}
              className="rounded-2xl p-5 transition-shadow hover:shadow-md"
              style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#eef2ff' }}
                  >
                    <FaTicketAlt className="text-indigo-500 text-sm" />
                  </div>
                  <span className="font-bold text-gray-800">Booking #{idx + 1}</span>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-green-700"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                >
                  Confirmed
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2">
                  <FaRoute className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Route ID</p>
                    <p className="text-sm font-semibold text-gray-700">{booking.routeId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FaClock className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Travel Time</p>
                    <p className="text-sm font-semibold text-gray-700">{booking.travelTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FaChair className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Seat Number</p>
                    <p className="text-sm font-semibold text-gray-700">Seat {booking.seatNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
