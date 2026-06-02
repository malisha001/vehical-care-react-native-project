import React from "react";

interface BadgeProps {
  label: string;
  color?: "green" | "yellow" | "blue" | "red" | "gray" | "purple";
}

const colors = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-700",
};

const Badge: React.FC<BadgeProps> = ({ label, color = "gray" }) => (
  <span className={`badge ${colors[color]}`}>{label}</span>
);

export const statusBadge = (status: string): React.ReactNode => {
  const map: Record<string, { color: BadgeProps["color"] }> = {
    PENDING: { color: "yellow" },
    CONFIRMED: { color: "blue" },
    COMPLETED: { color: "green" },
    CANCELLED: { color: "red" },
    REQUESTED: { color: "yellow" },
    PROPOSED: { color: "blue" },
    ACCEPTED: { color: "green" },
    ASSIGNED: { color: "blue" },
  };
  const cfg = map[status] || { color: "gray" };
  return <Badge label={status} color={cfg.color} />;
};

export default Badge;
