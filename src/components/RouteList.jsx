// --- OPTIMIZED ---
// Import useMemo for performance
import React, { useState, useEffect, useMemo } from 'react';

// --- OPTIMIZED ---
// Import FaSearch for the input
import { FaBus, FaRegClock, FaArrowRight, FaRupeeSign, FaChair, FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

// --- (Optional but Recommended) ---
// This is a "Loading Skeleton" component.
// It looks much better than just "Loading..."
const RouteCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-6 w-40 bg-gray-300 rounded mb-3"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="text-right">
        <div className="h-8 w-24 bg-gray-300 rounded mb-3"></div>
        <div className="h-10 w-28 bg-blue-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);
// ------------------------------------


function RouteList({ onBookNow }) {
  const [routes, setRoutes] = useState([]);
  // --- OPTIMIZED ---
  // We no longer need filteredRoutes in state.
  // const [filteredRoutes, setFilteredRoutes] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); // <-- Search input state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetch(`${API_URL}/api/routes`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok. Is the backend running?');
        }
        return response.json();
      })
      .then(data => {
        // --- MOCK DATA (DELETE THIS) ---
        // I'm adding mock data here so you can see the design.
        // Remove this when your API sends real data.
        const mockData = data.map(route => ({
          ...route,
          price: Math.floor(Math.random() * 500) + 300,
          departureTime: '10:30 AM',
          arrivalTime: '04:45 PM'
        }));
        // --- END OF MOCK DATA ---

        setRoutes(mockData); // <-- Use mockData (or just 'data' when ready)
        // setFilteredRoutes(mockData); // <-- We don't need this anymore
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // --- OPTIMIZED ---
  // We removed the filtering `useEffect` and replaced it with `useMemo`.
  // This is cleaner and more performant. It only recalculates
  // `filteredRoutes` when `routes` or `searchTerm` changes.
  const filteredRoutes = useMemo(() => {
    return routes.filter(route =>
      route.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [routes, searchTerm]);


  // --- Render Loading State ---
  if (loading) {
    // --- OPTIMIZED ---
    // Added the frosted glass classes to the skeleton container too
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-6 sm:p-8 bg-white/30 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center shadow-sm">Available Bus Routes</h2>
        <RouteCardSkeleton />
        <RouteCardSkeleton />
        <RouteCardSkeleton />
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  // --- Render Main Component ---
  return (
    // --- OPTIMIZED ---
    // This is the frosted glass container!
    <div className="space-y-6 max-w-6xl mx-auto p-6 sm:p-8 bg-black/20 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
      
      {/* --- OPTIMIZED ---
      // Changed text to white and added a subtle shadow to make it "pop"
      */}
      <h2 className="text-3xl font-bold text-white mb-6 text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
        Available Bus Routes
      </h2>

      {/* --- OPTIMIZED: Search Bar with Icon --- */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by city or bus name (e.g., Chennai, Express 1)..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.g.target.value)}
        />
      </div>

      {filteredRoutes.length === 0 ? (
        <p className="text-center text-white font-semibold py-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {routes.length === 0 ? "No routes available at the moment." : "No routes match your search."}
        </p> 
      ) : (
        // --- The route cards remain the same, they are already great ---
        filteredRoutes.map(route => (
          <div
            key={route.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              
              {/* Left Side: Route Details */}
              <div className="flex-grow mb-4 sm:mb-0">
                <div className="flex items-center mb-2">
                  <FaBus className="text-blue-600 mr-3" />
                  <h3 className="text-2xl font-semibold text-gray-900">{route.busName}</h3>
                </div>

                <p className="text-lg text-gray-700 flex items-center mb-3">
                  <span className="font-medium">{route.origin}</span>
                  <FaArrowRight className="mx-2 text-gray-500" />
                  <span className="font-medium">{route.destination}</span>
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center">
                    <FaRegClock className="mr-2" />
                    <span>{route.departureTime} - {route.arrivalTime}</span>
                  </div>
                  <div className="flex items-center">
                    <FaChair className="mr-2" />
                    <span>{route.capacity} Seats</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Price & Booking */}
              <div className="flex-shrink-0 text-left sm:text-right w-full sm:w-auto">
                <div className="flex items-center justify-start sm:justify-end mb-3">
                  <FaRupeeSign className="text-2xl text-green-600" />
                  <span className="text-3xl font-bold text-green-600">{route.price}</span>
                </div>
                <button
                  onClick={() => onBookNow(route)}
                  className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default RouteList;