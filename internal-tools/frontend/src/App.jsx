import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import CCIPage from "./pages/CCIPage.jsx";
import CCITestingPage from "./pages/CCITestingPage.jsx";
import CCIDetailPage from "./pages/CCIDetailPage.jsx";
import TechSprintPage from "./pages/TechSprintPage.jsx";
import MouPage from "./pages/MouPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import CalendarTestingPage from "./pages/CalendarTestingPage.jsx";
import OpenClawChat from "./components/OpenClawChat.jsx";
import "./styles/variables.css";
import "./styles/sidebar.css";

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/cci" replace />} />
          <Route path="/cci" element={<CCIPage />} />
          <Route path="/cci/testing" element={<CCITestingPage />} />
          <Route path="/cci/:id" element={<CCIDetailPage />} />
          <Route path="/techsprint" element={<TechSprintPage />} />
          <Route path="/mou" element={<MouPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar/testing" element={<CalendarTestingPage />} />
        </Routes>
      </main>
      <OpenClawChat />
    </BrowserRouter>
  );
}
