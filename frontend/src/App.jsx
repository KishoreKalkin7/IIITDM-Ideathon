import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerLogin from "./pages/CustomerLogin";
import RetailerDashboard from "./pages/RetailerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Aligned Routes to use unified Auth */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/retailer/login" element={<Navigate to="/auth" />} />
        <Route path="/admin/login" element={<Navigate to="/auth" />} />

        {/* Dashboards */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
