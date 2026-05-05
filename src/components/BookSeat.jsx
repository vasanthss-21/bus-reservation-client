import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBus, FaChair, FaUser, FaBirthdayCake, FaCheckCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const CARD_STYLE = { padding: 'clamp(16px, 4vw, 40px)', marginTop: 'clamp(20px, 6vw, 80px)', background: 'rgba(255,255,255,0.90)', border: '1.5px solid rgba(21, 0, 255, 0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' };

const generateSchedules = (route) => {
  const hash = (route.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const slots = [
    { label: 'Early Morning', base: 5, color: '#f0f9ff', border: '#bae6fd', tag: '#0284c7' },
    { label: 'Morning', base: 8, color: '#f0fdf4', border: '#bbf7d0', tag: '#15803d' },
    { label: 'Afternoon', base: 12, color: '#fefce8', border: '#fde68a', tag: '#b45309' },
    { label: 'Evening', base: 16, color: '#faf5ff', border: '#e9d5ff', tag: '#7e22ce' },
    { label: 'Night', base: 21, color: '#1e1b4b', border: '#4338ca', tag: '#818cf8' },
  ];
  const km = 80 + (hash % 621);
  const speedKmh = 45 + (hash % 21);
  const durationMins = Math.round((km / speedKmh) * 60);

  return slots.map((slot, i) => {
    const offsetMins = (hash * (i + 1)) % 30;
    const totalDepartMins = slot.base * 60 + offsetMins;
    const totalArriveMins = totalDepartMins + durationMins;
    const fmtTime = (m) => { const h = Math.floor(m / 60) % 24; const min = m % 60; return `${h % 12 || 12}:${String(min).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
    const fmtDur = (m) => { const h = Math.floor(m / 60); const min = m % 60; return min > 0 ? `${h}h ${min}m` : `${h}h`; };
    return {
      id: `slot-${i}`, label: slot.label, departure: fmtTime(totalDepartMins), arrival: fmtTime(totalArriveMins),
      duration: fmtDur(durationMins), travelTime: `${String(slot.base).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`,
      color: slot.color, border: slot.border, tag: slot.tag, isNight: slot.label === 'Night',
    };
  });
};

const SeatIcon = ({ status = 'available' }) => {
  const colors = { available: { fill: '#eef2ff', stroke: '#6366f1' }, occupied: { fill: '#f1f5f9', stroke: '#cbd5e1' }, selected: { fill: '#6366f1', stroke: '#4f46e5' } };
  const { fill, stroke } = colors[status] || colors.available;
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
      <path d="M5 10C5 8.34315 6.34315 7 8 7H16C17.6569 7 19 8.34315 19 10V17C19 17.5523 18.5523 18 18 18H6C5.44772 18 5 17.5523 5 17V10Z" fill={fill} stroke={stroke} strokeWidth="2" />
      <path d="M4 18V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

function BookSeat({ user, selectedRoute, onBack }) {
  const schedules = generateSchedules(selectedRoute);
  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [age, setAge] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [seatError, setSeatError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (!selectedRoute.id || !selectedSchedule) return;
    setLoadingSeats(true); setSeatError(null); setBookingError(null); setSelectedSeat(null);
    fetch(`${API_URL}/api/reservations/occupied?routeId=${selectedRoute.id}&travelTime=${selectedSchedule.travelTime}`)
      .then(res => { if (!res.ok) throw new Error('Could not load seat data.'); return res.json(); })
      .then(data => setOccupiedSeats(data))
      .catch(err => setSeatError(err.message))
      .finally(() => setLoadingSeats(false));
  }, [selectedRoute.id, selectedSchedule]);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedSchedule) return setBookingError('Please select a departure time.');
    if (!selectedSeat) return setBookingError('Please select a seat.');
    if (!age || age < 1 || age > 120) return setBookingError('Please enter a valid age.');
    setLoading(true); setBookingError(null);
    fetch(`${API_URL}/api/reservations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, routeId: selectedRoute.id, travelTime: selectedSchedule.travelTime, seatNumber: selectedSeat }),
    })
      .then(res => { if (!res.ok) return res.text().then(t => { throw new Error(t); }); return res.text(); })
      .then(() => setIsBooked(true))
      .catch(err => setBookingError(err.message))
      .finally(() => setLoading(false));
  };

  const Seat = ({ seatNumber }) => {
    const isOccupied = occupiedSeats.includes(seatNumber);
    const isSelected = selectedSeat === seatNumber;
    const status = isOccupied ? 'occupied' : isSelected ? 'selected' : 'available';
    return (
      <button type="button" disabled={isOccupied}
        onClick={() => !isOccupied && setSelectedSeat(seatNumber)}
        className={`w-9 h-9 sm:w-11 sm:h-11 relative transition-transform duration-150 ${isOccupied ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'} ${isSelected ? 'ring-2 ring-indigo-500 rounded-lg' : ''}`}>
        <SeatIcon status={status} />
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold ${isSelected ? 'text-white' : isOccupied ? 'text-gray-400' : 'text-indigo-700'}`}>
          {seatNumber}
        </span>
      </button>
    );
  };

  const renderSeats = () => {
    const rows = Array.from({ length: Math.ceil((selectedRoute.capacity || 40) / 4) }, (_, i) => i + 1);
    if (!selectedSchedule) return (
      <div className="p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px dashed #c7d2fe' }}>
        <FaBus className="text-3xl sm:text-4xl text-indigo-200 mb-3" />
        <p className="text-xs sm:text-sm font-medium text-gray-400">Select a departure time<br />to view available seats</p>
      </div>
    );
    if (seatError) return (
      <div className="p-4 sm:p-6 rounded-2xl text-center text-red-600 text-sm"
        style={{ background: '#fef2f2', border: '1.5px solid #fecaca' }}>⚠️ {seatError}</div>
    );
    return (
      <div className="p-4 sm:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">Select Your Seat</h3>
        {/* Legend */}
        <div className="flex gap-3 sm:gap-5 mb-4 sm:mb-5 text-xs font-medium text-gray-500">
          {[['available', 'Available'], ['selected', 'Selected'], ['occupied', 'Occupied']].map(([s, l]) => (
            <div key={s} className="flex items-center gap-1.5"><div className="w-4 h-4 sm:w-5 sm:h-5"><SeatIcon status={s} /></div> {l}</div>
          ))}
        </div>
        {/* Driver */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="px-3 sm:px-4 py-1 rounded-full text-xs font-semibold text-indigo-600"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>🚌 Driver</div>
        </div>
        {loadingSeats ? (
          <p className="text-center text-gray-400 text-sm py-6">Loading seats…</p>
        ) : (
          <div className="space-y-2 sm:space-y-2.5 overflow-x-auto">
            {rows.map(row => {
              const s = (row - 1) * 4;
              return (
                <div key={row} className="flex justify-center items-center gap-1.5 sm:gap-2">
                  <Seat seatNumber={s + 1} /><Seat seatNumber={s + 2} />
                  <div className="w-4 sm:w-6" />
                  <Seat seatNumber={s + 3} /><Seat seatNumber={s + 4} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* Booking confirmed */
  if (isBooked) return (
    <div className="max-w-7xl rounded-2xl mx-auto" style={CARD_STYLE}>
      <div className="text-center max-w-sm mx-auto py-6 sm:py-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
          <FaCheckCircle className="text-white text-xl sm:text-2xl" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">Booking Confirmed!</h2>
        <p className="text-gray-500 text-sm mb-3">{selectedRoute.origin} → {selectedRoute.destination}</p>
        <div className="rounded-xl p-3 mb-4 text-sm text-left space-y-1"
          style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <p><span className="text-gray-500">Passenger:</span> <span className="font-semibold text-gray-800">{customerName}</span> (Age {age})</p>
          <p><span className="text-gray-500">Seat:</span> <span className="font-semibold text-indigo-600">#{selectedSeat}</span></p>
          <p><span className="text-gray-500">Departs:</span> <span className="font-semibold text-gray-800">{selectedSchedule?.departure}</span></p>
          <p><span className="text-gray-500">Arrives:</span> <span className="font-semibold text-gray-800">{selectedSchedule?.arrival}</span></p>
        </div>
        <button onClick={onBack} className="w-full py-3 rounded-xl font-semibold text-sm text-white transition hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Back to Routes</button>
      </div>
    </div>
  );

  /* Main layout */
  return (
    <div className="max-w-7xl rounded-2xl mx-auto" style={CARD_STYLE}>

      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 mb-4 sm:mb-5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid #e0e7ff' }}>
        <FaArrowLeft className="text-xs" /> Back to Routes
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* Booking Form */}
        <div className="p-5 sm:p-7 rounded-2xl space-y-4 sm:space-y-5"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 24px rgba(99,102,241,0.08)' }}>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: '#eef2ff' }}>
                <FaBus className="text-indigo-500 text-xs sm:text-sm" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Book Your Seat</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 pl-9 sm:pl-10">{selectedRoute.origin} → {selectedRoute.destination}</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-3 sm:space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Passenger Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-400"
                  style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age</label>
              <div className="relative">
                <FaBirthdayCake className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="number" required min="1" max="120" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-400"
                  style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
              </div>
            </div>

            {/* Departure schedule cards */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Choose Departure</label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {schedules.map(schedule => {
                  const isSelected = selectedSchedule?.id === schedule.id;
                  return (
                    <button key={schedule.id} type="button" onClick={() => setSelectedSchedule(schedule)}
                      className="w-full text-left rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150"
                      style={{
                        background: isSelected ? (schedule.isNight ? '#1e1b4b' : '#eef2ff') : (schedule.isNight ? 'rgba(30,27,75,0.7)' : 'white'),
                        border: isSelected ? `2px solid ${schedule.tag}` : `1.5px solid ${schedule.border}`,
                        boxShadow: isSelected ? `0 0 0 3px ${schedule.tag}22` : 'none',
                      }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: schedule.color, color: schedule.tag, border: `1px solid ${schedule.border}` }}>
                              {schedule.label}
                            </span>
                            {isSelected && <FaCheckCircle className="text-xs" style={{ color: schedule.tag }} />}
                          </div>
                          <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold ${schedule.isNight ? 'text-indigo-200' : 'text-gray-800'}`}>
                            <span>{schedule.departure}</span>
                            <span className={`text-xs font-normal ${schedule.isNight ? 'text-indigo-400' : 'text-gray-400'}`}>→</span>
                            <span>{schedule.arrival}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] sm:text-xs font-medium ${schedule.isNight ? 'text-indigo-300' : 'text-gray-400'}`}>
                          ⏱ {schedule.duration}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected seat */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Selected Seat</label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: selectedSeat ? '#eef2ff' : '#f8fafc', border: `1.5px solid ${selectedSeat ? '#c7d2fe' : '#e2e8f0'}` }}>
                <FaChair className={selectedSeat ? 'text-indigo-500' : 'text-gray-300'} />
                <span className={`text-xs sm:text-sm ${selectedSeat ? 'text-indigo-700 font-semibold' : 'text-gray-400'}`}>
                  {selectedSeat ? `Seat ${selectedSeat}` : 'Pick from the seat grid'}
                </span>
              </div>
            </div>

            {bookingError && (
              <div className="px-4 py-3 rounded-xl text-red-600 text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>{bookingError}</div>
            )}

            <button type="submit"
              disabled={loading || loadingSeats || !selectedSeat || !selectedSchedule || !customerName || !age}
              className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
              {loading ? 'Booking…' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        {/* Seat Grid */}
        {renderSeats()}
      </div>
    </div>
  );
}

export default BookSeat;
