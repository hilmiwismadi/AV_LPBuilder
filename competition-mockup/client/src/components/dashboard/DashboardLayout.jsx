import React from "react";
import { Link, useLocation } from "react-router-dom";
import { colors } from "../../utils/colors";

const DashboardLayout = ({ children, activeTab }) => {
  const location = useLocation();
  
  const tabs = [
    { id: "transactions", label: "Transactions", path: "/dashboard/transactions" },
    { id: "submissions", label: "Submissions", path: "/dashboard/submissions" },
    { id: "registrants", label: "Registrants", path: "/dashboard/registrants" }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral.light }}>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold"
            style={{ color: colors.primary.purple }}
          >
            Event Organizer Dashboard
          </h1>
          <button 
            className="px-4 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: colors.primary.purple }}
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const isActive = location.pathname === tab.path || 
                             (location.pathname === "/dashboard" && tab.id === "transactions");
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={"py-4 px-2 border-b-2 font-medium transition-colors " + (
                    isActive || (location.pathname === "/dashboard" && tab.id === "transactions")
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  style={isActive ? { 
                    borderColor: colors.primary.purple,
                    color: colors.primary.purple
                  } : {}}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
