import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaTicketAlt, FaChair, FaClock, FaRoute, FaSpinner, FaInbox, FaMapMarkerAlt, FaArrowRight, FaBus } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const CARD_STYLE = { padding: 'clamp(16px, 4vw, 40px)', marginTop: 'clamp(20px, 6vw, 80px)', background: 'rgba(255,255,255,0.90)', border: '1.5px solid rgba(21, 0, 255, 0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' };

export default function Profile({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/reservations/my?name=${encodeURIComponent(user.name)}`)
        .then(res => { if (!res.ok) throw new Error('Could not load your bookings.'); return res.json(); }),
      fetch(`${API_URL}/api/routes`)
        .then(res => { if (!res.ok) throw new Error('Could not load routes.'); return res.json(); })
    ])
      .then(([bookingsData, routesData]) => {
        setBookings(bookingsData);
        const routeMap = {};
        routesData.forEach(route => { routeMap[route.id] = route; });
        setRoutes(routeMap);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-7xl rounded-2xl mx-auto space-y-5 sm:space-y-7" style={CARD_STYLE}>

      {/* Profile Card */}
      <div className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5"
        style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 capitalize">{user?.name}</h1>
          <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs sm:text-sm">
            <FaEnvelope className="text-indigo-400" /> {user?.email}
          </div>
        </div>
        <button id="profile-back-btn" onClick={onBack}
          className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 self-start"
          style={{ border: '1.5px solid #e0e7ff' }}>
          ← Back
        </button>
      </div>

      {/* Bookings Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaTicketAlt className="text-indigo-500" /> My Bookings
        </h2>
        {!loading && !error && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 self-start sm:self-auto"
            style={{ background: '#eef2ff' }}>
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400">
          <FaSpinner className="animate-spin text-2xl sm:text-3xl text-indigo-400 mb-3" />
          <p className="text-sm">Loading your bookings…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-red-600 text-sm"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400">
          <FaInbox className="text-4xl sm:text-5xl text-gray-200 mb-4" />
          <p className="font-semibold text-gray-500 text-sm sm:text-base">No bookings yet</p>
          <p className="text-xs sm:text-sm mt-1">Book a seat and it'll appear here.</p>
          <button onClick={onBack}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            Browse Routes
          </button>
        </div>
      )}

      {/* Booking Cards */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {bookings.map((booking, idx) => {
            const route = routes[booking.routeId];
            return (
              <div key={booking.id ?? idx} className="rounded-2xl p-4 sm:p-5 transition-shadow hover:shadow-md"
                style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#eef2ff' }}>
                      <FaTicketAlt className="text-indigo-500 text-xs sm:text-sm" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">Booking #{idx + 1}</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-green-700"
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    Confirmed
                  </span>
                </div>

                {/* Source → Destination */}
                {route ? (
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl flex-wrap"
                    style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}>
                    <FaMapMarkerAlt className="text-indigo-400 text-xs flex-shrink-0" />
                    <span className="font-semibold text-gray-800 text-sm">{route.origin}</span>
                    <FaArrowRight className="text-gray-300 text-xs flex-shrink-0" />
                    <span className="font-semibold text-gray-800 text-sm">{route.destination}</span>
                    {route.busName && (
                      <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-indigo-500 font-medium"
                        style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                        <FaBus className="text-[10px]" /> {route.busName}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-3">
                    <FaRoute className="text-indigo-300 text-xs" />
                    <span className="text-xs text-gray-400">Route: <span className="font-medium text-gray-600">{booking.routeId}</span></span>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-start gap-2">
                    <FaClock className="text-indigo-400 mt-0.5 flex-shrink-0 text-xs" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Travel Time</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">{booking.travelTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaChair className="text-indigo-400 mt-0.5 flex-shrink-0 text-xs" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Seat Number</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Seat {booking.seatNumber}</p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}