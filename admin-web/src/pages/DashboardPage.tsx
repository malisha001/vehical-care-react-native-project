import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/endpoints";
import { DashboardMetrics } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className={`card border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => dashboardApi.getMetrics().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const m: DashboardMetrics = data || {
    users: { total: 0 },
    cleaning: { active: 0 },
    modification: { total: 0, available: 0 },
    repairs: { total: 0, pending: 0, confirmed: 0, completed: 0 },
    carrier: { total: 0, active: 0 },
  };

  const repairChartData = [
    { name: "Pending", value: m.repairs.pending, fill: "#f59e0b" },
    { name: "Confirmed", value: m.repairs.confirmed, fill: "#3b82f6" },
    { name: "Completed", value: m.repairs.completed, fill: "#22c55e" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={m.users.total}
          icon="👥"
          color="border-blue-500"
        />
        <MetricCard
          label="Active Cleaning Services"
          value={m.cleaning.active}
          icon="🧹"
          color="border-cyan-500"
        />
        <MetricCard
          label="Modification Items"
          value={m.modification.total}
          icon="🔧"
          color="border-purple-500"
        />
        <MetricCard
          label="Available Mod Items"
          value={m.modification.available}
          icon="✅"
          color="border-green-500"
        />
        <MetricCard
          label="Total Repair Bookings"
          value={m.repairs.total}
          icon="🔩"
          color="border-yellow-500"
        />
        <MetricCard
          label="Pending Bookings"
          value={m.repairs.pending}
          icon="⏳"
          color="border-orange-500"
        />
        <MetricCard
          label="Total Carrier Requests"
          value={m.carrier.total}
          icon="🚛"
          color="border-red-500"
        />
        <MetricCard
          label="Active Carrier Requests"
          value={m.carrier.active}
          icon="📍"
          color="border-pink-500"
        />
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Repair Bookings by Status
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={repairChartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {repairChartData.map((entry, index) => (
                <rect key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
