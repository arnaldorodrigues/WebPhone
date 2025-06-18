"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

import SearchInput from "@/components/ui/inputs/search-input";
import DropdownSelect from "@/components/ui/inputs/dropdown-select";
import UserTable from "@/components/feature/admin/users/user-table";
import { fetchWithAuth } from "@/utils/api";
import UsersPageSkeleton from "@/components/feature/admin/users/users-page-skeleton";
import { User } from "@/types/user";
import UserEditDialog from "@/components/feature/admin/users/user-edit-dialog";

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    stats: {
      totalUsers: number;
      activeUsers: number;
      adminUsers: number;
      extensionNumbers: number;
    };
  };
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isOpenCreateUser, setIsOpenCreateUser] = useState(false);
  const [error, setError] = useState<string>("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    extensionNumbers: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchWithAuth("/api/admin/users");
      const result: ApiResponse = await response.json();

      if (result.success) {
        setUsers(result.data.users);
        setFilteredUsers(result.data.users);
        setStats(result.data.stats);
      } else {
        setError("Failed to fetch users data");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Network error while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          user?.settings?.sipUsername
            ?.toLowerCase()
            ?.includes(searchTerm?.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleAddUser = () => {
    setIsOpenCreateUser(true);
  };

  if (loading) {
    return <UsersPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="text-red-800">
            <h3 className="text-lg font-medium mb-2">Error Loading Users</h3>
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, email, or extension number..."
          className="flex-1"
        />
        <button
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <UserTable users={filteredUsers} onRefresh={fetchUsers} />
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              No users found matching your criteria
            </div>
          </div>
        )}
      </div>

      <UserEditDialog
        isOpen={isOpenCreateUser}
        onClose={() => setIsOpenCreateUser(false)}
        user={null}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UsersPage;
