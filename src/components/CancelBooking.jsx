import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBus, FaChair, FaClock, FaRoute, FaTimesCircle, FaSpinner, FaInbox, FaExclamationTriangle, FaMapMarkerAlt, FaArrowRight, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const CARD_STYLE = { padding: 'clamp(16px, 4vw, 40px)', marginTop: 'clamp(20px, 6vw, 80px)', background: 'rgba(255,255,255,0.90)', border: '1.5px solid rgba(21, 0, 255, 0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' };
const SEAT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

function CancelBooking({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null); // booking.id being cancelled
  const [cancelError, setCancelError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({}); // routeId+travelTime -> bool

  useEffect(() => {
    if (!user?.name) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/reservations/my?name=${encodeURIComponent(user.name)}`)
        .then(res => { if (!res.ok) throw new Error('Could not load bookings.'); return res.json(); }),
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

  // Group bookings by routeId + travelTime (same trip)
  const groupedBookings = bookings.reduce((acc, booking) => {
    const key = `${booking.routeId}__${booking.travelTime}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCancelOne = async (booking) => {
    setCancelling(booking.id); setCancelError(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: booking.customerName, routeId: booking.routeId, travelTime: booking.travelTime, seatNumber: booking.seatNumber }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Cancellation failed.');
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setSuccessMsg(`Seat #${booking.seatNumber} cancelled successfully.`);
    } catch (err) { setCancelError(err.message); }
    finally { setCancelling(null); }
  };

  const handleCancelAll = async (groupBookings) => {
    setCancelError(''); setSuccessMsg('');
    for (const booking of groupBookings) {
      setCancelling(booking.id);
      try {
        const res = await fetch(`${API_URL}/api/reservations`, {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName: booking.customerName, routeId: booking.routeId, travelTime: booking.travelTime, seatNumber: booking.seatNumber }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || `Cancellation failed for seat ${booking.seatNumber}.`);
        setBookings(prev => prev.filter(b => b.id !== booking.id));
      } catch (err) { setCancelError(err.message); setCancelling(null); return; }
    }
    setCancelling(null);
    setSuccessMsg('All seats in this trip cancelled successfully.');
  };

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
            <p className="text-xs sm:text-sm text-gray-400">Cancel individual seats or an entire trip</p>
          </div>
          {bookings.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-rose-600 self-start sm:self-auto"
              style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              {bookings.length} seat{bookings.length > 1 ? 's' : ''} active
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

      {/* Grouped booking cards */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedBookings).map(([key, groupBookings], gIdx) => {
            const route = routes[groupBookings[0].routeId];
            const isMulti = groupBookings.length > 1;
            const isExpanded = expandedGroups[key] ?? true;
            const allCancelling = groupBookings.every(b => cancelling === b.id);

            return (
              <div key={key} className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

                {/* Group header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#eef2ff' }}>
                        <FaBus className="text-indigo-500 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">

                        {/* Title + badge */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">Trip #{gIdx + 1}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-green-700"
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>Confirmed</span>
                          {isMulti && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-indigo-600"
                              style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                              {groupBookings.length} passengers
                            </span>
                          )}
                        </div>

                        {/* Route */}
                        {route ? (
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <FaMapMarkerAlt className="text-indigo-400 text-xs flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm">{route.origin}</span>
                            <FaArrowRight className="text-gray-300 text-xs flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm">{route.destination}</span>
                            {(route.busNumber ?? route.bus_number) && (
                              <span className="ml-1 px-2 py-0.5 rounded-full text-xs text-indigo-500 font-medium"
                                style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                {route.busNumber ?? route.bus_number}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mb-2">
                            <FaRoute className="text-indigo-300 text-xs" />
                            <span className="text-xs text-gray-400">Route ID: <span className="font-medium text-gray-600">{groupBookings[0].routeId}</span></span>
                          </div>
                        )}

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FaClock className="text-indigo-300 flex-shrink-0" />
                          <span>Departure: <span className="font-medium text-gray-700">{groupBookings[0].travelTime}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0 min-w-[120px]">
                      {/* Cancel all (only for multi) */}
                      {isMulti && (
                        <button
                          onClick={() => handleCancelAll(groupBookings)}
                          disabled={!!cancelling}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 justify-center"
                          style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}>
                          {cancelling && groupBookings.some(b => b.id === cancelling)
                            ? <><FaSpinner className="animate-spin" /> Cancelling…</>
                            : <><FaTimesCircle /> Cancel All</>}
                        </button>
                      )}

                      {/* Single booking cancel (shown inline for solo trips) */}
                      {!isMulti && (
                        <button
                          onClick={() => handleCancelOne(groupBookings[0])}
                          disabled={cancelling === groupBookings[0].id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 justify-center"
                          style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}>
                          {cancelling === groupBookings[0].id
                            ? <><FaSpinner className="animate-spin" /> Cancelling…</>
                            : <><FaTimesCircle /> Cancel</>}
                        </button>
                      )}

                      {/* Expand/collapse for multi */}
                      {isMulti && (
                        <button
                          onClick={() => toggleGroup(key)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-600 justify-center transition hover:bg-indigo-50"
                          style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                          {isExpanded ? <><FaChevronUp className="text-[10px]" /> Hide seats</> : <><FaChevronDown className="text-[10px]" /> View seats</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Per-seat rows (expanded) */}
                {isMulti && isExpanded && (
                  <div className="border-t" style={{ borderColor: '#f1f5f9' }}>
                    {groupBookings.map((booking, sIdx) => (
                      <div key={booking.id ?? sIdx}
                        className="flex items-center justify-between px-4 sm:px-5 py-3 gap-3 transition-colors hover:bg-slate-50"
                        style={{ borderBottom: sIdx < groupBookings.length - 1 ? '1px solid #f1f5f9' : 'none' }}>

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Colored seat dot */}
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: SEAT_COLORS[sIdx % SEAT_COLORS.length] }}>
                            {sIdx + 1}
                          </span>

                          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <FaUser className="text-indigo-300 text-[10px]" />
                              <span className="font-medium text-gray-800">{booking.customerName}</span>
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FaChair className="text-indigo-300 text-[10px]" />
                              Seat <span className="font-semibold text-gray-700">#{booking.seatNumber}</span>
                            </span>
                          </div>
                        </div>

                        {/* Cancel single seat */}
                        <button
                          onClick={() => handleCancelOne(booking)}
                          disabled={!!cancelling}
                          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 transition-all hover:brightness-95 active:scale-95 disabled:opacity-50"
                          style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                          {cancelling === booking.id
                            ? <FaSpinner className="animate-spin text-[10px]" />
                            : <><FaTimesCircle className="text-[10px]" /> Cancel seat</>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CancelBooking;