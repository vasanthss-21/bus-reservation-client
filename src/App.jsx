import React, { useState, useCallback } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import RouteList from './components/RouteList.jsx';
import BookSeat from './components/BookSeat.jsx';
import CancelBooking from './components/CancelBooking.jsx';
import Profile from './components/Profile.jsx';
import PageLoader from './components/PageLoader.jsx';
import { FaBus, FaSignOutAlt } from 'react-icons/fa';

const LOADER_DURATION = 600; // ms

function App() {
  // Auth
  const [authView, setAuthView] = useState('login');
  const [user, setUser]         = useState(null);

  // View
  const [currentView, setCurrentView]   = useState('list');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // ── Navigates to a view with loader ──────────────────────────────────────────
  const navigateTo = useCallback((view, route = null) => {
    setIsNavigating(true);
    setTimeout(() => {
      setSelectedRoute(route);
      setCurrentView(view);
      setIsNavigating(false);
    }, LOADER_DURATION);
  }, []);

  // ── Auth Handlers ────────────────────────────────────────────────────────────
  const handleLoginSuccess = (userData) => {
    setIsNavigating(true);
    setTimeout(() => {
      setUser(userData);
      setCurrentView('list');
      setIsNavigating(false);
    }, LOADER_DURATION);
  };

  const handleRegisterSuccess = (userData) => {
    setIsNavigating(true);
    setTimeout(() => {
      setUser(userData);
      setCurrentView('list');
      setIsNavigating(false);
    }, LOADER_DURATION);
  };

  const handleLogout = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setUser(null);
      setAuthView('login');
      setSelectedRoute(null);
      setCurrentView('list');
      setIsNavigating(false);
    }, LOADER_DURATION);
  };

  // ── View renderer ─────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case 'book':    return <BookSeat user={user} selectedRoute={selectedRoute} onBack={() => navigateTo('list')} />;
      case 'cancel':  return <CancelBooking user={user} onBack={() => navigateTo('list')} />;
      case 'profile': return <Profile user={user} onBack={() => navigateTo('list')} />;
      default:        return <RouteList onBookNow={(route) => navigateTo('book', route)} />;
    }
  };

  // ── Auth screens ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        {isNavigating && <PageLoader />}
        {authView === 'register'
          ? <Register onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setAuthView('login')} />
          : <Login    onLoginSuccess={handleLoginSuccess}       onGoToRegister={() => setAuthView('register')} />
        }
      </>
    );
  }

  // ── Main App ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans relative">

      {/* ── Video Background ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
        style={{ pointerEvents: 'none' }}
      >
        <source src="/bg.mp4" type="video/mp4" />
        {/* Fallback to image if video not supported */}
        Your browser does not support video backgrounds.
      </video>
      {/* Dark overlay so content stays readable */}
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(0,0,0,0.35)' }} />

      {/* Page transition overlay */}
      {isNavigating && <PageLoader />}

      {/* Header */}
      <header
        className="sticky top-0 z-50 text-white shadow-sm"
        style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">

          {/* Brand */}
          <button
            onClick={() => navigateTo('list')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <FaBus className="text-indigo-400 text-xl" />
            <span className="text-xl font-bold">
              <span className="text-white">Transit</span>
              <span className="text-indigo-400">Flow</span>
            </span>
          </button>

          {/* Nav */}
          <div className="flex items-center gap-1">
            <button
              id="nav-search-routes"
              onClick={() => navigateTo('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentView === 'list' || currentView === 'book'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/10'}`}
            >
              Search Routes
            </button>
            <button
              id="nav-cancel-booking"
              onClick={() => navigateTo('cancel')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentView === 'cancel'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/10'}`}
            >
              Cancel Booking
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            {/* Profile button */}
            <button
              id="nav-profile-btn"
              onClick={() => navigateTo('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentView === 'profile'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-white/10'}`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              >
                {user.name?.[0] ?? 'U'}
              </div>
              <span className="capitalize hidden sm:block">{user.name}</span>
            </button>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
