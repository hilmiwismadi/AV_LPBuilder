import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardTransactionsPage from "./pages/DashboardTransactionsPage";
import DashboardSubmissionsPage from "./pages/DashboardSubmissionsPage";
import DashboardRegistrantsPage from "./pages/DashboardRegistrantsPage";
import EventRegistrationPage from "./pages/EventRegistrationPage";
import ConfirmationPage from "./pages/ConfirmationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/transactions" replace />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/transactions" element={<DashboardTransactionsPage />} />
      <Route path="/dashboard/submissions" element={<DashboardSubmissionsPage />} />
      <Route path="/dashboard/registrants" element={<DashboardRegistrantsPage />} />
      <Route path="/dashboard" element={<DashboardTransactionsPage />} />
      
      {/* Registration Routes */}
      <Route path="/event/:slug/order-form" element={<EventRegistrationPage />} />
      <Route path="/event/:slug/confirmation" element={<ConfirmationPage />} />
    </Routes>
  );
}

export default App;
