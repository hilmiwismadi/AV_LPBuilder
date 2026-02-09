import React from "react";

const Header = ({ event }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h1 className="text-xl sm:text-2xl font-bold text-primary">
            Roetix
          </h1>
          
          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Location */}
            <span className="hidden sm:block text-neutral-dark text-sm">
              {event?.location || "Yogyakarta"}
            </span>
            
            {/* My Orders Button */}
            <button 
              className="px-3 py-2 sm:px-4 border-2 border-primary text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200"
            >
              My Orders
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
