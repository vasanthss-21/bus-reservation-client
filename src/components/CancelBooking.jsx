import React, { useState } from 'react';

// This component provides a form to cancel a booking.
function CancelBooking({ onBack }) {
  const [customerName, setCustomerName] = useState('');
  const [routeId, setRouteId] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleCancellation = async (e) => {
    e.preventDefault();
    if (!customerName || !routeId) {
      setError('Please provide both Customer Name and Route ID.');
      return;
    }
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/reservations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName,
          routeId: parseInt(routeId), // Ensure routeId is a number
        }),
      });

      const resultText = await response.text();

      if (!response.ok) {
        throw new Error(resultText || 'Cancellation failed. Please check details and try again.');
      }
      
      if (resultText.includes("cancelled")) {
          setMessage(resultText); // Store success message
          setIsCancelled(true);
      } else {
          setError(resultText); // E.g., "No reservation found."
      }

    } catch (err) {
      setError(err.message);
      console.error("Cancellation error:", err);
    }
  };
  
  if (isCancelled) {
      return (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Cancellation Confirmed</h2>
              <p className="text-gray-700">{message}</p>
              <p className="text-gray-600 mt-2">A confirmation email has been sent.</p>
              <button
                  onClick={onBack}
                  className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                  Back to Routes
              </button>
          </div>
      );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Cancel Your Booking</h2>
      <form onSubmit={handleCancellation}>
        <div className="mb-4">
          <label htmlFor="customerName" className="block text-gray-700 font-medium mb-2">Customer Name</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="The name used for booking"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="routeId" className="block text-gray-700 font-medium mb-2">Route ID</label>
          <input
            type="number"
            id="routeId"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter the Route ID"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex items-center justify-between mt-6">
           <button
             onClick={onBack}
             type="button"
             className="text-gray-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
           >
             Go Back
           </button>
           <button
             type="submit"
             className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
           >
             Cancel Booking
           </button>
        </div>
      </form>
    </div>
  );
}

export default CancelBooking;

