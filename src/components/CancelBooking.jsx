import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBus, FaChair, FaClock, FaRoute, FaTimesCircle, FaSpinner, FaInbox, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const CARD_STYLE = { padding: 'clamp(16px, 4vw, 40px)', marginTop: 'clamp(20px, 6vw, 80px)', background: 'rgba(255,255,255,0.90)', border: '1.5px solid rgba(21, 0, 255, 0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' };

function CancelBooking({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    fetch(`${API_URL}/api/reservations/my?name=${encodeURIComponent(user.name)}`)
      .then(res => { if (!res.ok) throw new Error('Could not load bookings.'); return res.json(); })
      .then(data => setBookings(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (booking) => {
    setCancelling(booking.id); setCancelError(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: booking.customerName, routeId: booking.routeId, travelTime: booking.travelTime, seatNumber: booking.seatNumber }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Cancellation failed.');
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setSuccessMsg('Booking cancelled successfully!');
    } catch (err) { setCancelError(err.message); }
    finally { setCancelling(null); }
  };

  /* Loading */
  if (loading) return (
    <div className="max-w-7xl rounded-2xl mx-auto" style={CARD_STYLE}>
      <div className="flex flex-col items-center justify-center py-12 sm:py-16">
        <FaSpinner className="animate-spin text-3xl sm:text-4xl text-indigo-400 mb-3" />
        <p className="text-gray-500 text-sm">Loading your bookings…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl rounded-2xl mx-auto space-y-5 sm:space-y-7" style={CARD_STYLE}>

      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid #e0e7ff' }}>
        <FaArrowLeft className="text-xs" /> Back to Routes
      </button>

      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl"
        style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#fff1f2' }}>
            <FaTimesCircle className="text-rose-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Cancel a Booking</h2>
            <p className="text-xs sm:text-sm text-gray-400">Select the booking you'd like to cancel</p>
          </div>
          {bookings.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-rose-600 self-start sm:self-auto"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              {bookings.length} active
            </span>
          )}
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="px-4 py-3 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span>✓</span> {successMsg}
        </div>
      )}

      {/* Error */}
      {(error || cancelError) && (
        <div className="px-4 py-3 rounded-xl text-red-600 text-sm flex items-center gap-2"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <FaExclamationTriangle className="flex-shrink-0" /> {error || cancelError}
        </div>
      )}

      {/* Empty */}
      {!error && bookings.length === 0 && (
        <div className="p-8 sm:p-10 rounded-2xl text-center"
          style={{ background: 'white', border: '1.5px solid #e2e8f0' }}>
          <FaInbox className="text-5xl sm:text-6xl text-gray-200 mx-auto mb-4" />
          <p className="font-bold text-gray-600 text-base sm:text-lg mb-1">No bookings found</p>
          <p className="text-gray-400 text-xs sm:text-sm mb-6">
            {successMsg ? "You've cancelled all your bookings." : "You haven't booked any seats yet."}
          </p>
          <button onClick={onBack}
            className="px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-110 shadow-md shadow-indigo-200"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            Browse Routes
          </button>
        </div>
      )}

      {/* Booking cards */}
      {bookings.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {bookings.map((booking, idx) => (
            <div key={booking.id ?? idx} className="p-4 sm:p-5 rounded-2xl transition-all"
              style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">

                {/* Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#eef2ff' }}>
                    <FaBus className="text-indigo-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">Booking #{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-green-700"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>Confirmed</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaRoute className="text-indigo-300 flex-shrink-0" />
                        <span className="truncate">Route: <span className="font-medium text-gray-700">{booking.routeId}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaClock className="text-indigo-300 flex-shrink-0" />
                        <span>Time: <span className="font-medium text-gray-700">{booking.travelTime}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaChair className="text-indigo-300 flex-shrink-0" />
                        <span>Seat: <span className="font-medium text-gray-700">#{booking.seatNumber}</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel button */}
                <button onClick={() => handleCancel(booking)} disabled={cancelling === booking.id}
                  className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start"
                  style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}>
                  {cancelling === booking.id
                    ? <><FaSpinner className="animate-spin" /> Cancelling…</>
                    : <><FaTimesCircle /> Cancel</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CancelBooking;
