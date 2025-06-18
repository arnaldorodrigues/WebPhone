"use client";

import { useEffect, useState } from "react";

import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import Pagination from "@/components/ui/pagination/pagination";
import ConfirmDialog from "@/components/ui/dialogs/confirm-dialog";
import UserDetailDialog from "./user-detail-dialog";
import UserEditDialog from "./user-edit-dialog";
import { User } from "@/types/user";
import { fetchWithAuth } from "@/utils/api";

interface UserTableProps {
  users: User[];
  onRefresh?: () => void;
}

const UserTable = ({ users, onRefresh }: UserTableProps) => {
  const [showPagination, setShowPagination] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = users.slice(startIndex, endIndex);

    setCurrentUsers(currentUsers);
  }, [currentPage, itemsPerPage, users]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      admin: "bg-purple-100 text-purple-700",
      user: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          roleClasses[role as keyof typeof roleClasses]
        }`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handleViewUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEditUserDialog = (user: User) => {
    setSelectedEditUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedEditUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetchWithAuth(
        `/api/admin/users?id=${userToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      if (onRefresh) {
        onRefresh();
      }

      if (isDetailDialogOpen) {
        setIsDetailDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setUserToDelete(null);
    }
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Extension Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {currentUsers.length > 0 &&
            currentUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.settings?.sipUsername}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewUserDetail(user)}
                      className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                      title="View User"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditUserDialog(user)}
                      className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                      title="Edit User"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                      title="Delete User"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {showPagination && users.length > 0 && (
        <div className="mx-4 my-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      <UserDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
        onEdit={() => {
          setSelectedEditUser(selectedUser as User);
          setIsDetailDialogOpen(false);
          setIsEditDialogOpen(true);
        }}
        onDelete={(userId: string) => {
          const user = users.find((u) => u.id === userId);
          if (user) handleDeleteUser(user);
        }}
      />

      <UserEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        user={selectedEditUser}
        onSuccess={onRefresh}
      />

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UserTable;
