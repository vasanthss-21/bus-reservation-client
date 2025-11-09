import React, { useState } from 'react';
import RouteList from './components/RouteList.jsx';
import BookSeat from './components/BookSeat.jsx';
import CancelBooking from './components/CancelBooking.jsx';

function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'book', 'cancel'
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleBookNow = (route) => {
    setSelectedRoute(route);
    setCurrentView('book');
  };

  const showListView = () => {
    setSelectedRoute(null);
    setCurrentView('list');
  };

  const renderView = () => {
    switch (currentView) {
      case 'book':
        return <BookSeat selectedRoute={selectedRoute} onBack={showListView} />;
      
      case 'cancel':
        return <CancelBooking onBack={showListView} />;
      
      default:
        return <RouteList onBookNow={handleBookNow} />;
    }
  };

  return (
    <div 
      className="min-h-screen font-sans"
      style={{
        backgroundImage: "url('bg.png')", // <-- YOUR IMAGE HERE
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="text-2xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
            onClick={showListView}
          >
            BusReservation
          </div>
          <div>
            <button
              onClick={showListView}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Search Routes
            </button>
            <button
              onClick={() => setCurrentView('cancel')}
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel Booking
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

