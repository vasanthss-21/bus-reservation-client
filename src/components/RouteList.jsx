import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL; // <-- Use this for backend URL

function RouteList({ onBookNow }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/routes`) // <-- Updated
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok. Is the backend running?');
        }
        return response.json();
      })
      .then(data => {
        setRoutes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading available routes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Available Bus Routes</h2>
      {routes.length === 0 ? (
        <p className="text-center text-gray-500">No routes available at the moment.</p>
      ) : (
        routes.map(route => (
          <div key={route.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{route.busName}</h3>
              <p className="text-gray-600 mt-2">
                From <span className="font-medium text-blue-600">{route.origin}</span> to <span className="font-medium text-blue-600">{route.destination}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Bus Capacity: {route.capacity} seats
              </p>
            </div>
            <button
              onClick={() => onBookNow(route)}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Book Now
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default RouteList;
