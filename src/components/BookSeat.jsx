import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL; 
const SeatIcon = ({ status = 'available' }) => {
  const colors = {
    available: { fill: '#D1FAE5', stroke: '#10B981' }, // Light green fill, green stroke
    occupied: { fill: '#E5E7EB', stroke: '#6B7280' },  // Light gray fill, gray stroke
    selected: { fill: '#93C5FD', stroke: '#2563EB' },  // Blue fill, blue stroke
  };
  const { fill, stroke } = colors[status] || colors.available;

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

// This component now receives the full `selectedRoute` object
function BookSeat({ selectedRoute, onBack }) {
  const [customerName, setCustomerName] = useState('');
  const [travelTime, setTravelTime] = useState('09:00');
  
  // --- STATE ---
  const [selectedSeat, setSelectedSeat] = useState(null); // Stores the chosen seat number
  const [occupiedSeats, setOccupiedSeats] = useState([]); // Stores taken seats from backend
  const [message, setMessage] = useState(null);
  
  // --- UPDATED: Split error state for clarity ---
  const [bookingError, setBookingError] = useState(null); // For booking submission errors
  const [seatError, setSeatError] = useState(null);       // For seat loading errors

  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  
  const [isBooked, setIsBooked] = useState(false);

  // Create a 45-minute interval time list for the dropdown
  const timeSlots = [];
  for (let h = 6; h < 22; h++) { // From 6 AM to 10 PM
    timeSlots.push(`${h < 10 ? '0' : ''}${h}:00`);
    timeSlots.push(`${h < 10 ? '0' : ''}${h}:45`);
  }

  // Fetch occupied seats whenever the route or time changes
  // --- Updated fetch URLs to use environment variable ---
const API_URL = import.meta.env.VITE_API_URL; // Vercel env variable

useEffect(() => {
  setIsBooked(false);
  setMessage(null);

  if (!selectedRoute.id || !travelTime) return;

  setLoadingSeats(true);
  setSeatError(null);
  setBookingError(null);
  setSelectedSeat(null);

  fetch(`${API_URL}/api/reservations/occupied?routeId=${selectedRoute.id}&travelTime=${travelTime}`)
    .then(res => {
      if (!res.ok) throw new Error('Could not fetch seat data from backend.');
      return res.json();
    })
    .then(data => setOccupiedSeats(data))
    .catch(err => setSeatError(err.message))
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
    seatNumber: selectedSeat
  };

  fetch(`${API_URL}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingDetails)
  })
  .then(res => {
    if (!res.ok) return res.text().then(text => { throw new Error(text) });
    return res.text();
  })
  .then(msg => {
    setMessage(msg);
    setIsBooked(true);
  })
  .catch(err => setBookingError(err.message))
  .finally(() => setLoading(false));
};

  // --- NEW Seat Button Component ---
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
        className="w-12 h-12 relative disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Seat ${seatNumber}`}
      >
        <SeatIcon status={status} />
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${status === 'occupied' ? 'text-gray-600' : 'text-black'}`}>
          {seatNumber}
        </span>
      </button>
    );
  };

  // --- NEW 2x2 SEAT SELECTOR LAYOUT ---
  const renderSeatSelector = () => {
    const totalSeats = selectedRoute.capacity || 40;
    const numRows = totalSeats / 4;
    const rows = Array.from({ length: numRows }, (_, i) => i + 1); // [1, 2, ..., 10]

    // --- NEW: Handle seat loading error prominently ---
    if (seatError) {
      return (
        <div className="flex-1 p-6 bg-white shadow-lg rounded-lg overflow-auto flex flex-col items-center justify-center">
          <label className="block text-gray-700 font-bold mb-4 text-lg">Select Your Seat</label>
          <div className="p-4 bg-red-100 text-red-800 border border-red-300 rounded-md text-center">
            <strong>Error:</strong> {seatError}
            <br />
            <span className="text-sm">Please try a different time or ensure the backend is running.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6 bg-white shadow-lg rounded-lg overflow-auto">
        <label className="block text-gray-700 font-bold mb-4 text-lg">Select Your Seat</label>
        {loadingSeats ? (
          <div className="text-center text-gray-500">Loading seats...</div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Legend */}
            <div className="flex justify-around mb-4 w-full max-w-xs text-sm">
              <div className="flex items-center"><span className="w-5 h-5 mr-2"><SeatIcon status="available" /></span> Available</div>
              <div className="flex items-center"><span className="w-5 h-5 mr-2"><SeatIcon status="selected" /></span> Selected</div>
              <div className="flex items-center"><span className="w-5 h-5 mr-2"><SeatIcon status="occupied" /></span> Occupied</div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-3">
              {rows.map(row => {
                const seat1 = (row - 1) * 4 + 1;
                const seat2 = (row - 1) * 4 + 2;
                const seat3 = (row - 1) * 4 + 3;
                const seat4 = (row - 1) * 4 + 4;
                return (
                  <div key={row} className="flex items-center justify-center space-x-3">
                    <Seat seatNumber={seat1} />
                    <Seat seatNumber={seat2} />
                    <div className="w-8" aria-hidden="true"></div> {/* Aisle */}
                    <Seat seatNumber={seat3} />
                    <Seat seatNumber={seat4} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- ADDED CONFIRMATION SCREEN ---
  if (isBooked) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
        <p className="text-gray-700">{message}</p>
        <p className="text-gray-600 mt-2">
          Route: {selectedRoute.origin} to {selectedRoute.destination} <br />
          Seat: {selectedSeat} at {travelTime}
        </p>
        <button
          onClick={onBack}
          className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Routes
        </button>
      </div>
    );
  }

  // --- This is the main booking form ---
  return (
    // --- NEW HORIZONTAL LAYOUT ---
    <div className="max-w-6xl mx-auto mt-10">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        &larr; Back to Routes
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Form */}
        <div className="w-full md:w-1/3 p-8 bg-white shadow-lg rounded-lg h-fit">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Book Seat for: <br />
            <span className="text-xl text-gray-600">{selectedRoute.origin} to {selectedRoute.destination}</span>
          </h2>
          <form onSubmit={handleBooking}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Route</label>
              <input
                type="text"
                disabled
                value={`${selectedRoute.busName} (Capacity: ${selectedRoute.capacity})`}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="customerName">
                Your Name
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="travelTime">
                Departure Time (Every 45 min)
              </label>
              <select
                id="travelTime"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Selected Seat Info */}
            <div className="mb-6">
               <label className="block text-gray-700 font-medium mb-2">Selected Seat</label>
               <input
                type="text"
                disabled
                value={selectedSeat || 'None (Please select a seat)'}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || loadingSeats || !selectedSeat || !customerName || seatError}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400"
            >
              {loading ? 'Booking...' : 'Book Now'}
            </button>

            {/* --- UPDATE: Show bookingError --- */}
            {bookingError && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
                Booking Failed: {bookingError}
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Seat Selector */}
        {renderSeatSelector()}
      </div>
    </div>
  );
}

export default BookSeat;


