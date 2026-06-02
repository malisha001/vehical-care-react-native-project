import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import AdminLayout from "./components/layout/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CleaningServicesPage from "./pages/CleaningServicesPage";
import CleaningSlotsPage from "./pages/CleaningSlotsPage";
import CleaningBookingsPage from "./pages/CleaningBookingsPage";
import ModificationItemsPage from "./pages/ModificationItemsPage";
import RepairSlotsPage from "./pages/RepairSlotsPage";
import RepairBookingsPage from "./pages/RepairBookingsPage";
import CarrierRequestsPage from "./pages/CarrierRequestsPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated() || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cleaning-services" element={<CleaningServicesPage />} />
          <Route path="cleaning-slots" element={<CleaningSlotsPage />} />
          <Route path="cleaning-bookings" element={<CleaningBookingsPage />} />
          <Route
            path="modification-items"
            element={<ModificationItemsPage />}
          />
          <Route path="repair-slots" element={<RepairSlotsPage />} />
          <Route path="repair-bookings" element={<RepairBookingsPage />} />
          <Route path="carrier-requests" element={<CarrierRequestsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
