import React, { useState, useEffect, useCallback } from 'react';
import {
  FaArrowLeft, FaBus, FaChair, FaUser, FaClock, FaMapMarkerAlt,
  FaArrowRight, FaSpinner, FaInbox, FaTrash, FaExclamationTriangle,
  FaCheckCircle, FaLayerGroup, FaTicketAlt, FaRoute
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const CARD_STYLE = {
  padding: 'clamp(16px, 4vw, 40px)',
  marginTop: 'clamp(20px, 1vw, 80px)',
  background: 'rgba(255,255,255,0.90)',
  border: '1.5px solid rgba(21, 0, 255, 0.7)',
  boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
};

export default function CancelBooking({ user, onBack }) {
  const [bookings, setBookings]       = useState([]);
  const [routes, setRoutes]           = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [cancelling, setCancelling]   = useState(null);   // id of ticket being cancelled
  const [cancelError, setCancelError] = useState('');
  const [cancelled, setCancelled]     = useState([]);     // ids already cancelled this session
  const [confirmId, setConfirmId]     = useState(null);   // id awaiting confirm dialog

  const fetchBookings = useCallback(() => {
    if (!user?.name) return;
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`${API_URL}/api/reservations/my?bookedBy=${encodeURIComponent(user.name)}&name=${encodeURIComponent(user.name)}`)
        .then(res => { if (!res.ok) throw new Error('Could not load your bookings.'); return res.json(); }),
      fetch(`${API_URL}/api/routes`)
        .then(res => { if (!res.ok) throw new Error('Could not load routes.'); return res.json(); })
    ])
      .then(([bookingsData, routesData]) => {
        // Filter out already-cancelled tickets from this session
        setBookings(bookingsData.filter(b => !cancelled.includes(b.id)));
        const routeMap = {};
        routesData.forEach(r => { routeMap[r.id] = r; });
        setRoutes(routeMap);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, cancelled]);

  useEffect(() => { fetchBookings(); }, [user]);

  const handleCancel = async (id) => {
    setConfirmId(null);
    setCancelling(id);
    setCancelError('');
    try {
      const res = await fetch(`${API_URL}/api/reservations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Cancellation failed.');
      }
      setCancelled(prev => [...prev, id]);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  // Group bookings by groupId for group badges
  const groupCounts = bookings.reduce((acc, b) => {
    if (b.groupId) acc[b.groupId] = (acc[b.groupId] || 0) + 1;
    return acc;
  }, {});

  const visibleBookings = bookings.filter(b => !cancelled.includes(b.id));

  return (
    <div className="max-w-7xl rounded-2xl mx-auto space-y-5 sm:space-y-7" style={CARD_STYLE}>

      {/* Header */}
      <div className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5"
        style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
          <FaTrash className="text-white text-xl sm:text-2xl" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">Cancel Booking</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Select a ticket to cancel. Only your account's bookings are shown.
          </p>
        </div>
        <button onClick={onBack}
          className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 self-start flex items-center gap-2"
          style={{ border: '1.5px solid #e0e7ff' }}>
          <FaArrowLeft className="text-xs" /> Back
        </button>
      </div>

      {/* Cancel error banner */}
      {cancelError && (
        <div className="px-4 py-3 rounded-xl text-red-600 text-sm flex items-center gap-2"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <FaExclamationTriangle className="flex-shrink-0" /> {cancelError}
        </div>
      )}

      {/* Ticket count */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaTicketAlt className="text-red-500" /> Your Tickets
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-red-700 self-start sm:self-auto"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            {visibleBookings.length} {visibleBookings.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400">
          <FaSpinner className="animate-spin text-2xl sm:text-3xl text-indigo-400 mb-3" />
          <p className="text-sm">Loading your tickets…</p>
        </div>
      )}

      {/* Fetch error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-red-600 text-sm"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && visibleBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400">
          <FaInbox className="text-4xl sm:text-5xl text-gray-200 mb-4" />
          <p className="font-semibold text-gray-500 text-sm sm:text-base">No active bookings</p>
          <p className="text-xs sm:text-sm mt-1">All your tickets have been cancelled or you haven't booked yet.</p>
          <button onClick={onBack}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            Browse Routes
          </button>
        </div>
      )}

      {/* Ticket Cards */}
      {!loading && !error && visibleBookings.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {visibleBookings.map((booking, idx) => {
            const route = routes[booking.routeId];
            const isGrouped = booking.groupId && groupCounts[booking.groupId] > 1;
            const isCancelling = cancelling === booking.id;
            const isConfirming = confirmId === booking.id;

            return (
              <div key={booking.id ?? idx}
                className="rounded-2xl p-4 sm:p-5 transition-all duration-200"
                style={{
                  background: 'white',
                  border: isConfirming ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
                  boxShadow: isConfirming ? '0 0 0 3px #fef2f2' : '0 1px 8px rgba(0,0,0,0.04)'
                }}>

                {/* Ticket Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#eef2ff' }}>
                      <FaTicketAlt className="text-indigo-500 text-xs sm:text-sm" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">Ticket #{idx + 1}</span>

                    {/* Passenger name */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-indigo-700"
                      style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                      <FaUser className="text-[9px]" />
                      {booking.customerName || booking.bookedBy || '—'}
                    </span>

                    {/* Group badge */}
                    {isGrouped && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-purple-700"
                        style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                        <FaLayerGroup className="text-[9px]" />
                        Group booking
                      </span>
                    )}
                  </div>

                  {/* Status + Cancel button */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-green-700"
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      Active
                    </span>
                    {!isConfirming && (
                      <button
                        onClick={() => setConfirmId(booking.id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                        style={{ border: '1.5px solid #fecaca' }}>
                        {isCancelling
                          ? <><FaSpinner className="animate-spin" /> Cancelling…</>
                          : <><FaTrash className="text-[10px]" /> Cancel</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline confirm dialog */}
                {isConfirming && (
                  <div className="mb-3 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div className="flex items-center gap-2 flex-1">
                      <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-700">
                        Cancel <span className="font-bold">{booking.customerName || 'this'}'s</span> ticket for Seat <span className="font-bold">#{booking.seatNumber}</span>?
                        <span className="block text-xs font-normal text-red-500 mt-0.5">This cannot be undone.</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                        style={{ border: '1px solid #e2e8f0' }}>
                        Keep it
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={isCancelling}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        style={{ background: '#ef4444' }}>
                        {isCancelling ? 'Cancelling…' : 'Yes, Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Route pill */}
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

                {/* Details grid */}
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

      {/* Cancelled-in-session summary */}
      {cancelled.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-green-700 text-sm"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <FaCheckCircle className="flex-shrink-0" />
          {cancelled.length} ticket{cancelled.length > 1 ? 's' : ''} successfully cancelled this session.
        </div>
      )}

    </div>
  );
}