import React, { useState, useEffect, useMemo } from 'react';
import { FaBus, FaRegClock, FaArrowRight, FaRupeeSign, FaChair, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaExchangeAlt, FaRoad, FaClock } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const CARD_STYLE = { padding: 'clamp(16px, 4vw, 40px)', marginTop: 'clamp(20px, 6vw, 80px)', background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(21, 0, 255, 1)', boxShadow: '0 0px 15px rgba(0, 81, 255, 0.8)' };

const realisticFare = (route) => {
  if (route.price) return route.price;
  const distKm = route.distanceKm ?? route.distance_km;
  if (distKm) {
    const cap = route.capacity ?? 40;
    let ratePerKm, busType;
    if (cap > 50) { ratePerKm = 1.00; busType = 'Ordinary'; }
    else if (cap > 40) { ratePerKm = 1.50; busType = 'Express'; }
    else if (cap > 30) { ratePerKm = 1.80; busType = 'AC Deluxe'; }
    else { ratePerKm = 2.00; busType = 'AC Sleeper'; }
    return { fare: Math.round((distKm * ratePerKm) / 5) * 5, busType };
  }
  // fallback hash-based
  const hash = (route.id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const km = 80 + (hash % 621);
  const cap = route.capacity ?? 40;
  let ratePerKm, busType;
  if (cap > 50) { ratePerKm = 1.00; busType = 'Ordinary'; }
  else if (cap > 40) { ratePerKm = 1.50; busType = 'Express'; }
  else if (cap > 30) { ratePerKm = 1.80; busType = 'AC Deluxe'; }
  else { ratePerKm = 2.00; busType = 'AC Sleeper'; }
  return { fare: Math.round((km * ratePerKm) / 5) * 5, busType };
};

const formatDuration = (hrs) => {
  if (!hrs) return null;
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const RouteCardSkeleton = () => (
  <div className="rounded-2xl p-4 sm:p-5 animate-pulse" style={{ background: 'white', border: '1.5px solid #e2e8f0' }}>
    <div className="flex items-center justify-between">
      <div>
        <div className="h-5 w-32 sm:w-40 bg-gray-200 rounded-lg mb-3" />
        <div className="h-4 w-44 sm:w-56 bg-gray-100 rounded-lg mb-2" />
        <div className="h-4 w-24 sm:w-32 bg-gray-100 rounded-lg" />
      </div>
      <div className="text-right">
        <div className="h-8 w-20 sm:w-24 bg-indigo-100 rounded-lg mb-3" />
        <div className="h-10 w-24 sm:w-28 bg-indigo-200 rounded-xl" />
      </div>
    </div>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const today = () => new Date().toISOString().split('T')[0];

function RouteList({ onBookNow }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [onwardDate, setOnwardDate] = useState(today());
  const [returnDate, setReturnDate] = useState('');
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/routes`)
      .then(res => { if (!res.ok) throw new Error('Could not load routes. Is the backend running?'); return res.json(); })
      .then(data => {
        const enriched = data.map(route => {
          const fareInfo = realisticFare(route);
          return {
            ...route,
            price: typeof fareInfo === 'object' ? fareInfo.fare : fareInfo,
            busType: typeof fareInfo === 'object' ? fareInfo.busType : null,
            distanceKm: route.distanceKm ?? route.distance_km ?? null,
            durationHrs: route.durationHrs ?? route.duration_hrs ?? null,
            via: route.via ?? null,
            busNumber: route.busNumber ?? route.bus_number ?? null,
            departureTime: route.departureTime ?? '10:30 AM',
            arrivalTime: route.arrivalTime ?? '04:45 PM',
          };
        });
        setRoutes(enriched);
        setAllCities([...new Set(enriched.flatMap(r => [r.origin, r.destination]))].sort());
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filteredRoutes = useMemo(() => {
    if (!searched) return [];
    return routes.filter(r => {
      const srcMatch = !source || r.origin.toLowerCase().includes(source.toLowerCase());
      const destMatch = !destination || r.destination.toLowerCase().includes(destination.toLowerCase());
      return srcMatch && destMatch;
    });
  }, [routes, source, destination, searched]);

  const handleSearch = (e) => { e.preventDefault(); setSearched(true); };
  const handleSwap = () => { setSource(destination); setDestination(source); setSearched(false); };

  const typeBadge = (type) => {
    const map = {
      'Ordinary': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
      'Express': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      'AC Deluxe': { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
      'AC Sleeper': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    };
    return map[type] ?? map['Ordinary'];
  };

  if (loading) return (
    <div className="max-w-7xl rounded-2xl mx-auto space-y-5" style={CARD_STYLE}>
      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 text-center">Loading routes…</h2>
      <div className="max-w-6xl mx-auto space-y-4">
        <RouteCardSkeleton /><RouteCardSkeleton /><RouteCardSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl rounded-2xl mx-auto space-y-5" style={CARD_STYLE}>
      <div className="max-w-lg mx-auto px-4 py-3 rounded-2xl text-red-700 font-medium text-sm"
        style={{ background: '#fef2f2', border: '1.5px solid #fecaca' }}>
        ⚠️ {error}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl rounded-2xl mx-auto space-y-5 sm:space-y-7" style={CARD_STYLE}>

      {/* Search Panel */}
      <div className="p-4 sm:p-6 max-w-6xl mx-auto rounded-2xl"
        style={{ background: 'rgba(255,255,255,1)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,1)', boxShadow: '0 8px 40px rgba(99,102,241,0.08)' }}>

        <div className="text-center mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Search Bus Routes</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Find buses by source, destination & travel date</p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">

            {/* From */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">From</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 text-xs" />
                <input type="text" list="city-list" value={source}
                  onChange={e => { setSource(e.target.value); setSearched(false); }}
                  placeholder="Source city"
                  className="w-full pl-10 pr-3 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-400"
                  style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
              </div>
            </div>

            {/* Swap */}
            <div className="lg:col-span-1 flex justify-center">
              <button type="button" onClick={handleSwap}
                className="w-9 h-9 rounded-full flex items-center justify-center text-indigo-500 transition hover:bg-indigo-50"
                style={{ background: '#eef2ff', border: '1.5px solid #c7d2fe' }}>
                <FaExchangeAlt className="text-sm" />
              </button>
            </div>

            {/* To */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">To</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 text-xs" />
                <input type="text" list="city-list" value={destination}
                  onChange={e => { setDestination(e.target.value); setSearched(false); }}
                  placeholder="Destination city"
                  className="w-full pl-10 pr-3 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-400"
                  style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
              </div>
            </div>

            {/* Onward Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Onward Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 text-xs" />
                <input type="date" required min={today()} value={onwardDate}
                  onChange={e => setOnwardDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-indigo-400"
                  style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
              </div>
            </div>

            {/* Return Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Return <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="date" min={onwardDate || today()} value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-indigo-400"
                  style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1 sm:col-span-2">
              <button type="submit"
                className="w-full h-[46px] rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 shadow-md shadow-indigo-200"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                <FaSearch /> <span className="lg:hidden">Search</span>
              </button>
            </div>
          </div>

          {/* Date summary */}
          {onwardDate && (
            <div className="mt-3 flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                <FaCalendarAlt className="text-indigo-400" />
                Onward: <span className="font-semibold text-gray-700">{formatDate(onwardDate)}</span>
              </span>
              {returnDate && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <FaCalendarAlt className="text-rose-400" />
                  Return: <span className="font-semibold text-gray-700">{formatDate(returnDate)}</span>
                </span>
              )}
            </div>
          )}
        </form>

        <datalist id="city-list">
          {allCities.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      {/* Results */}
      {!searched ? (
        <div className="text-center p-8 sm:p-10 max-w-6xl mx-auto rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)' }}>
          <FaBus className="text-4xl sm:text-5xl text-indigo-200 mx-auto mb-4" />
          <p className="font-bold text-gray-600 text-base sm:text-lg mb-1">Where do you want to go?</p>
          <p className="text-gray-400 text-xs sm:text-sm">Enter your source and destination above, then hit search.</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="text-center p-8 sm:p-10 max-w-6xl mx-auto rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)' }}>
          <FaBus className="text-4xl sm:text-5xl text-gray-200 mx-auto mb-4" />
          <p className="font-bold text-gray-600 text-base sm:text-lg mb-1">No buses found</p>
          <p className="text-gray-400 text-xs sm:text-sm">
            No routes match{source && <> from <span className="font-semibold text-gray-600">{source}</span></>}
            {destination && <> to <span className="font-semibold text-gray-600">{destination}</span></>}. Try a different city.
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto rounded-2xl space-y-4"
          style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 24px rgba(99,102,241,0.06)' }}>

          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              {source || 'Any'} → {destination || 'Any'}
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 self-start sm:self-auto"
              style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
              {filteredRoutes.length} bus{filteredRoutes.length !== 1 ? 'es' : ''} found
            </span>
          </div>

          {/* Route cards */}
          {filteredRoutes.map(route => {
            const badge = typeBadge(route.busType);
            const duration = formatDuration(route.durationHrs);
            return (
              <div key={route.id} className="rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Route info */}
                  <div className="flex-grow">

                    {/* Bus number + type badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#eef2ff' }}>
                        <FaBus className="text-indigo-500 text-sm" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {route.busNumber && (
                          <span className="text-sm sm:text-base font-bold text-gray-900 tracking-wide">
                            {route.busNumber}
                          </span>
                        )}
                        {route.busType && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                            {route.busType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Origin → Via → Destination */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm">{route.origin}</span>
                      {route.via && (
                        <>
                          <FaArrowRight className="text-gray-300 text-xs flex-shrink-0" />
                          <span className="text-xs text-gray-400 italic flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-300 text-[10px]" /> via {route.via}
                          </span>
                        </>
                      )}
                      <FaArrowRight className="text-indigo-400 text-xs flex-shrink-0" />
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm">{route.destination}</span>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <FaRegClock className="text-indigo-300" />
                        {route.departureTime} – {route.arrivalTime}
                      </span>
                      {duration && (
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-indigo-300" /> {duration}
                        </span>
                      )}
                      {route.distanceKm && (
                        <span className="flex items-center gap-1.5">
                          <FaRoad className="text-indigo-300" /> {route.distanceKm} km
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <FaChair className="text-indigo-300" /> {route.capacity} Seats
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-indigo-300" /> {formatDate(onwardDate)}
                      </span>
                    </div>
                  </div>

                  {/* Price + Book */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                    <div className="flex items-baseline gap-0.5">
                      <FaRupeeSign className="text-indigo-600 text-base sm:text-lg" />
                      <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{route.price}</span>
                    </div>
                    <button onClick={() => onBookNow({ ...route, travelDate: onwardDate, returnDate })}
                      className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-md shadow-indigo-200"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RouteList;