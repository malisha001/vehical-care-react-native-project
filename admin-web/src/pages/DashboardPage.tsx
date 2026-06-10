import React, { useState } from "react";
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
  value: number | string;
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
  const [range, setRange] = useState<"today" | "all">("today");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-metrics", range],
    queryFn: () => dashboardApi.getMetrics({ range }).then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const m: DashboardMetrics = data || {
    users: { total: 0 },
    cleaning: { active: 0, bookings: 0, pending: 0 },
    modification: { total: 0, available: 0 },
    repairs: { total: 0, pending: 0, confirmed: 0, completed: 0 },
    carrier: { total: 0, active: 0 },
    revenue: { total: 0, vehicleService: 0, repair: 0, finalizedBills: 0 },
  };

  const formatMoney = (value: number) =>
    `LKR ${value.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {range === "today" ? "Today's details" : "All time details"}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setRange("today")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              range === "today"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setRange("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              range === "all"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatMoney(m.revenue.total)}
          icon="TR"
          color="border-emerald-500"
        />
        <MetricCard
          label="Vehicle Service Revenue"
          value={formatMoney(m.revenue.vehicleService)}
          icon="VS"
          color="border-cyan-500"
        />
        <MetricCard
          label="Repair Revenue"
          value={formatMoney(m.revenue.repair)}
          icon="RR"
          color="border-amber-500"
        />
        <MetricCard
          label="Finalized Bills"
          value={m.revenue.finalizedBills}
          icon="FB"
          color="border-green-500"
        />
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
          label="Cleaning Bookings"
          value={m.cleaning.bookings}
          icon="CB"
          color="border-cyan-500"
        />
        <MetricCard
          label="Pending Cleaning"
          value={m.cleaning.pending}
          icon="PC"
          color="border-orange-500"
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
          label="Repair Requests"
          value={m.repairs.total}
          icon="🔩"
          color="border-yellow-500"
        />
        <MetricCard
          label="Requested Repairs"
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
