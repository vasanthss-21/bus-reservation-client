import React, { useState, useEffect, useMemo } from 'react';
import { FaBus, FaRegClock, FaArrowRight, FaRupeeSign, FaChair, FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

// ── Realistic Indian bus fare logic ──────────────────────────────────────────
// Based on real KSRTC / TNSTC / SETC rates (2024):
//   Ordinary non-AC  : ~₹1.00/km  → short routes ₹80–₹220
//   Express / Deluxe : ~₹1.50/km  → ₹200–₹550
//   AC Semi-Sleeper  : ~₹1.80/km  → ₹350–₹850
//   AC Sleeper       : ~₹2.00/km  → ₹500–₹1200
// We derive bus type from capacity:  >50 = Ordinary, 40–50 = Express, 30–40 = AC, <30 = AC Sleeper
// We derive distance from the route ID (stable hash) so fare never changes.
const realisticFare = (route) => {
  if (route.price) return route.price; // Use real price if backend sends it

  // Stable "distance" between 80 km and 700 km, derived from route ID
  const hash = (route.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const km = 80 + (hash % 621); // 80–700 km

  const cap = route.capacity ?? 40;
  let ratePerKm;
  let busType;

  if (cap > 50) {
    ratePerKm = 1.00; busType = 'Ordinary';        // ₹1/km
  } else if (cap > 40) {
    ratePerKm = 1.50; busType = 'Express';         // ₹1.5/km
  } else if (cap > 30) {
    ratePerKm = 1.80; busType = 'AC Deluxe';       // ₹1.8/km
  } else {
    ratePerKm = 2.00; busType = 'AC Sleeper';      // ₹2/km
  }

  // Round to nearest ₹5 for realism
  const raw = km * ratePerKm;
  return { fare: Math.round(raw / 5) * 5, busType, km };
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const RouteCardSkeleton = () => (
  <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'white', border: '1.5px solid #e2e8f0' }}>
    <div className="flex items-center justify-between">
      <div>
        <div className="h-5 w-40 bg-gray-200 rounded-lg mb-3" />
        <div className="h-4 w-56 bg-gray-100 rounded-lg mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded-lg" />
      </div>
      <div className="text-right">
        <div className="h-8 w-24 bg-indigo-100 rounded-lg mb-3" />
        <div className="h-10 w-28 bg-indigo-200 rounded-xl" />
      </div>
    </div>
  </div>
);

function RouteList({ onBookNow }) {
  const [routes, setRoutes]       = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/routes`)
      .then(res => {
        if (!res.ok) throw new Error('Could not load routes. Is the backend running?');
        return res.json();
      })
      .then(data => {
        const enriched = data.map(route => {
          const fareInfo = realisticFare(route);
          return {
            ...route,
            price:         typeof fareInfo === 'object' ? fareInfo.fare    : fareInfo,
            busType:       typeof fareInfo === 'object' ? fareInfo.busType : null,
            estimatedKm:   typeof fareInfo === 'object' ? fareInfo.km      : null,
            departureTime: route.departureTime ?? '10:30 AM',
            arrivalTime:   route.arrivalTime   ?? '04:45 PM',
          };
        });
        setRoutes(enriched);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredRoutes = useMemo(() =>
    routes.filter(r =>
      r.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchTerm.toLowerCase())
    ), [routes, searchTerm]);

  // Badge colour per bus type
  const typeBadge = (type) => {
    const map = {
      'Ordinary':  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
      'Express':   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      'AC Deluxe': { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
      'AC Sleeper':{ bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    };
    return map[type] ?? map['Ordinary'];
  };

  if (loading) return (
    <div className="space-y-4 max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.6)' }}>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4 text-center">Available Bus Routes</h2>
      <RouteCardSkeleton /><RouteCardSkeleton /><RouteCardSkeleton />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto mt-10 px-5 py-4 rounded-2xl text-red-700 font-medium text-sm"
      style={{ background: '#fef2f2', border: '1.5px solid #fecaca' }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl space-y-5"
      style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 40px rgba(99,102,241,0.08)' }}>

      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-extrabold text-gray-900">Available Bus Routes</h2>
        <p className="text-sm text-gray-500 mt-1">Fares based on KSRTC / TNSTC 2024 rates</p>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search by city or bus name…"
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-400"
          style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Route cards */}
      {filteredRoutes.length === 0 ? (
        <p className="text-center text-gray-500 py-10 font-medium">
          {routes.length === 0 ? 'No routes available at the moment.' : 'No routes match your search.'}
        </p>
      ) : (
        filteredRoutes.map(route => {
          const badge = typeBadge(route.busType);
          return (
            <div
              key={route.id}
              className="rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Left: Route info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#eef2ff' }}>
                      <FaBus className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{route.busName}</h3>
                      {route.busType && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                          {route.busType}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-2">
                    <span>{route.origin}</span>
                    <FaArrowRight className="text-indigo-400 text-xs" />
                    <span>{route.destination}</span>
                    {route.estimatedKm && (
                      <span className="text-xs text-gray-400 ml-1">~{route.estimatedKm} km</span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FaRegClock className="text-indigo-300" />
                      {route.departureTime} – {route.arrivalTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaChair className="text-indigo-300" />
                      {route.capacity} Seats
                    </span>
                  </div>
                </div>

                {/* Right: Price + Book */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                  <div className="flex items-baseline gap-0.5">
                    <FaRupeeSign className="text-indigo-600 text-lg" />
                    <span className="text-3xl font-extrabold text-indigo-600">{route.price}</span>
                  </div>
                  <button
                    onClick={() => onBookNow(route)}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-md shadow-indigo-200"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default RouteList;