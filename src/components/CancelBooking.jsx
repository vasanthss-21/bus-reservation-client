import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBus, FaChair, FaClock, FaRoute, FaTimesCircle, FaSpinner, FaInbox, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

function CancelBooking({ user, onBack }) {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [cancelling, setCancelling]     = useState(null); // booking id being cancelled
  const [cancelError, setCancelError]   = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  // ── Fetch user's bookings ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    fetch(`${API_URL}/api/reservations/my?name=${encodeURIComponent(user.name)}`)
      .then(res => { if (!res.ok) throw new Error('Could not load bookings.'); return res.json(); })
      .then(data => setBookings(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // ── Cancel a single booking ──────────────────────────────────────────────────
  const handleCancel = async (booking) => {
    setCancelling(booking.id);
    setCancelError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: booking.customerName,
          routeId: booking.routeId,
          travelTime: booking.travelTime,
          seatNumber: booking.seatNumber,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Cancellation failed.');
      // Remove from list locally so UI updates instantly
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setSuccessMsg('Booking cancelled successfully!');
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-indigo-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your bookings…</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 mb-5 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid #e0e7ff', backdropFilter: 'blur(8px)' }}>
        <FaArrowLeft className="text-xs" /> Back to Routes
      </button>

      {/* Header card */}
      <div className="p-6 rounded-2xl mb-5"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 24px rgba(99,102,241,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#fff1f2' }}>
            <FaTimesCircle className="text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Cancel a Booking</h2>
            <p className="text-sm text-gray-400">Select the booking you'd like to cancel</p>
          </div>
          {!loading && !error && bookings.length > 0 && (
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold text-rose-600"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              {bookings.length} active
            </span>
          )}
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span>✓</span> {successMsg}
        </div>
      )}

      {/* Error banner */}
      {(error || cancelError) && (
        <div className="mb-4 px-4 py-3 rounded-xl text-red-600 text-sm flex items-center gap-2"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <FaExclamationTriangle className="flex-shrink-0" />
          {error || cancelError}
        </div>
      )}

      {/* Empty state */}
      {!error && bookings.length === 0 && (
        <div className="p-10 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)' }}>
          <FaInbox className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="font-bold text-gray-600 text-lg mb-1">No bookings found</p>
          <p className="text-gray-400 text-sm mb-6">
            {successMsg ? "You've cancelled all your bookings." : "You haven't booked any seats yet."}
          </p>
          <button onClick={onBack}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-110 shadow-md shadow-indigo-200"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            Browse Routes
          </button>
        </div>
      )}

      {/* Booking cards */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking, idx) => (
            <div key={booking.id ?? idx}
              className="p-5 rounded-2xl transition-all"
              style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

              <div className="flex items-start justify-between gap-4">

                {/* Left info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#eef2ff' }}>
                    <FaBus className="text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">Booking #{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-green-700"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        Confirmed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
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
                <button
                  onClick={() => handleCancel(booking)}
                  disabled={cancelling === booking.id}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}
                >
                  {cancelling === booking.id ? (
                    <><FaSpinner className="animate-spin" /> Cancelling…</>
                  ) : (
                    <><FaTimesCircle /> Cancel</>
                  )}
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
