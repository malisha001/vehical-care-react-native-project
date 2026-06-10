import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/endpoints";
import { User } from "../types";
import Table from "../components/ui/Table";

const roleBadge = (role: string) => (
  <span
    className={`badge ${
      role === "ADMIN"
        ? "bg-purple-100 text-purple-700"
        : "bg-blue-100 text-blue-700"
    }`}
  >
    {role}
  </span>
);

const activeBadge = (isActive: boolean) => (
  <span
    className={`badge ${
      isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["users", page, search, roleFilter],
    queryFn: () =>
      userApi
        .getAll({
          page,
          limit: 20,
          search: search || undefined,
          role: roleFilter || undefined,
        })
        .then((r) => r.data),
  });

  const users = (res?.data as User[]) || [];
  const meta = res?.meta;
  const hasFilters = search || roleFilter;

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const columns = [
    {
      key: "createdAt",
      label: "Joined",
      render: (v: unknown) => format(new Date(v as string), "MMM dd, yyyy"),
    },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (v: unknown) => roleBadge(v as string),
    },
    {
      key: "isActive",
      label: "Status",
      render: (v: unknown) => activeBadge(Boolean(v)),
    },
    {
      key: "_id",
      label: "Actions",
      render: (v: unknown) => (
        <button
          onClick={() => navigate(`/users/${v as string}`)}
          className="btn-secondary px-3 py-1 text-xs"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-[280px] flex-1 gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            className="input"
            placeholder="Search by name or email"
          />
          <button onClick={applySearch} className="btn-primary">
            Search
          </button>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="input max-w-xs"
        >
          <option value="">All Roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setRoleFilter("");
              setPage(1);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
        <span className="ml-auto self-end text-sm text-gray-500">
          {meta?.total ?? 0} total
        </span>
      </div>

      <div className="card overflow-hidden p-0">
        <Table
          columns={columns as Parameters<typeof Table>[0]["columns"]}
          data={users}
          loading={isLoading}
        />
      </div>

      {meta && meta.total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary px-3 py-1"
          >
            Prev
          </button>
          <span className="self-center text-sm text-gray-600">
            Page {page} of {Math.ceil(meta.total / 20)}
          </span>
          <button
            disabled={page >= Math.ceil(meta.total / 20)}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary px-3 py-1"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
