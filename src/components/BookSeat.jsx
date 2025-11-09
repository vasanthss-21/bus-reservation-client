import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

// --- Seat Icon ---
const SeatIcon = ({ status = 'available' }) => {
  const colors = {
    available: { fill: '#D1FAE5', stroke: '#10B981' },
    occupied: { fill: '#E5E7EB', stroke: '#6B7280' },
    selected: { fill: '#93C5FD', stroke: '#2563EB' },
  };
  const { fill, stroke } = colors[status] || colors.available;

  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 10C5 8.34315 6.34315 7 8 7H16C17.6569 7 19 8.34315 19 10V17C19 17.5523 18.5523 18 18 18H6C5.44772 18 5 17.5523 5 17V10Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M4 18V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V18"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

function BookSeat({ selectedRoute, onBack }) {
  const [customerName, setCustomerName] = useState('');
  const [travelTime, setTravelTime] = useState('09:00');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [message, setMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [seatError, setSeatError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Generate time slots
  const timeSlots = [];
  for (let h = 6; h < 22; h++) {
    timeSlots.push(`${h < 10 ? '0' : ''}${h}:00`);
    timeSlots.push(`${h < 10 ? '0' : ''}${h}:45`);
  }

  // Fetch occupied seats
  useEffect(() => {
    if (!selectedRoute.id || !travelTime) return;
    setLoadingSeats(true);
    setSeatError(null);
    setBookingError(null);
    setSelectedSeat(null);
    setIsBooked(false);

    fetch(`${API_URL}/api/reservations/occupied?routeId=${selectedRoute.id}&travelTime=${travelTime}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not fetch seat data from backend.');
        return res.json();
      })
      .then((data) => setOccupiedSeats(data))
      .catch((err) => setSeatError(err.message))
      .finally(() => setLoadingSeats(false));
  }, [selectedRoute.id, travelTime]);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedSeat) return setBookingError('Please select a seat.');
    setLoading(true);
    setBookingError(null);
    setMessage(null);

    const bookingDetails = {
      customerName,
      routeId: selectedRoute.id,
      travelTime,
      seatNumber: selectedSeat,
    };

    fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((text) => { throw new Error(text); });
        return res.text();
      })
      .then((msg) => {
        setMessage(msg);
        setIsBooked(true);
      })
      .catch((err) => setBookingError(err.message))
      .finally(() => setLoading(false));
  };

  // --- Seat Component ---
  const Seat = ({ seatNumber }) => {
    const isOccupied = occupiedSeats.includes(seatNumber);
    const isSelected = selectedSeat === seatNumber;
    let status = 'available';
    if (isOccupied) status = 'occupied';
    if (isSelected) status = 'selected';

    return (
      <button
        type="button"
        disabled={isOccupied}
        onClick={() => !isOccupied && setSelectedSeat(seatNumber)}
        className={`w-12 h-12 relative transition-transform duration-200 
          ${isOccupied ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'}
          ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
        aria-label={`Seat ${seatNumber}`}
      >
        <SeatIcon status={status} />
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-semibold 
            ${status === 'occupied' ? 'text-gray-600' : 'text-black'}`}
        >
          {seatNumber}
        </span>
      </button>
    );
  };

  // --- Render Seat Grid ---
  const renderSeatSelector = () => {
    const totalSeats = selectedRoute.capacity || 40;
    const numRows = totalSeats / 4;
    const rows = Array.from({ length: numRows }, (_, i) => i + 1);

    if (seatError) {
      return (
        <div className="flex-1 p-6 bg-white/80 rounded-xl shadow-md text-center text-red-700">
          <p className="font-bold mb-2">Error: {seatError}</p>
          <p className="text-sm">Try again or ensure backend is running.</p>
        </div>
      );
    }

    return (
      <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Your Seat</h3>

        {/* Legend */}
        <div className="flex justify-around mb-6 text-sm font-medium">
          <div className="flex items-center gap-2"><SeatIcon status="available" /> <span>Available</span></div>
          <div className="flex items-center gap-2"><SeatIcon status="selected" /> <span>Selected</span></div>
          <div className="flex items-center gap-2"><SeatIcon status="occupied" /> <span>Occupied</span></div>
        </div>

        {/* Seat Grid */}
        {loadingSeats ? (
          <p className="text-gray-500 text-center">Loading seats...</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const s = (row - 1) * 4;
              return (
                <div key={row} className="flex justify-center items-center gap-3">
                  <Seat seatNumber={s + 1} />
                  <Seat seatNumber={s + 2} />
                  <div className="w-8" />
                  <Seat seatNumber={s + 3} />
                  <Seat seatNumber={s + 4} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // --- Booking Confirmation ---
  if (isBooked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
        <div className="p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-3xl font-bold text-green-600 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-700">{message}</p>
          <p className="text-gray-600 mt-3">
            {selectedRoute.origin} → {selectedRoute.destination}<br />
            Seat: <span className="font-semibold">{selectedSeat}</span> at {travelTime}
          </p>
          <button
            onClick={onBack}
            className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:scale-105 transition-transform"
          >
            Back to Routes
          </button>
        </div>
      </div>
    );
  }

  // --- Main Booking Layout ---
  return (
    <div className="min-h-screen bg-gradient-to-br  bg-black/20 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <button
          onClick={onBack}
          className="group relative inline-flex items-center gap-2 px-5 py-2 my-2 rounded-xl 
                    bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
                    shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 
                          opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 rounded-xl"></span>
          <span className="relative flex items-center gap-2 z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Routes
          </span>
        </button>


        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Booking Form */}
          <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Book Seat for<br />
              <span className="text-lg text-gray-600">
                {selectedRoute.origin} → {selectedRoute.destination}
              </span>
            </h2>

            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Route</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedRoute.busName} (Capacity: ${selectedRoute.capacity})`}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Departure Time</label>
                <select
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Selected Seat</label>
                <input
                  type="text"
                  disabled
                  value={selectedSeat || 'None (Please select a seat)'}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading || loadingSeats || !selectedSeat || !customerName || seatError}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:scale-[1.02] transition-transform shadow-md disabled:bg-gray-400"
              >
                {loading ? 'Booking...' : 'Book Now'}
              </button>

              {bookingError && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
                  Booking Failed: {bookingError}
                </div>
              )}
            </form>
          </div>

          {/* Right: Seat Selector */}
          {renderSeatSelector()}
        </div>
      </div>
    </div>
  );
}

export default BookSeat;
