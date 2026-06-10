import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/endpoints";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "DB" },
  { label: "Users", path: "/users", icon: "US" },
  { label: "Cleaning Services", path: "/cleaning-services", icon: "CS" },
  { label: "Cleaning Slots", path: "/cleaning-slots", icon: "CL" },
  { label: "Cleaning Bookings", path: "/cleaning-bookings", icon: "CB" },
  { label: "Modification Items", path: "/modification-items", icon: "MI" },
  { label: "Repair Requests", path: "/repair-bookings", icon: "RR" },
  { label: "Carrier Requests", path: "/carrier-requests", icon: "CR" },
];

const AdminLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-700">
          <h1 className="text-lg font-bold leading-tight">Vehicle Service</h1>
          <p className="text-xs text-primary-300 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-primary-700 text-white font-semibold border-r-4 border-accent-500"
                    : "text-primary-200 hover:bg-primary-800 hover:text-white"
                }`
              }
            >
              <span className="w-6 text-xs font-bold">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-700">
          <p className="text-xs text-primary-300 truncate mb-2">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-red-300 hover:text-red-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600">
            Welcome back, {user?.name}
          </h2>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
