'use client'

import { UserEditDialog, UsersTable } from "@/components/admin";
import { SearchInput } from "@/components/ui/inputs";
import { Pagination } from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/ui/skeleton";
import { getUsersList } from "@/core/users/request";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const AdminUsers = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>();

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditDialogOpen(true);    
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }

  const handleDeleteUser = () => {

  }

  const getData = async () => {
    try {
      setIsLoading(true);
      const res: any = await getUsersList();

      setUsers(res.data);
      setCurrentPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages);
      setPageSize(res.pagination.limit);

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [])

  return (
    <>
      {isLoading ? (
        <ListSkeleton />
      ) : (
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

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <UsersTable
                users={users}
                handleEdit={handleEditUser}
              />
            </div>
            <div className="px-6 py-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={users.length}
                pageSize={pageSize}
              />
            </div>
          </div>

          <UserEditDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            user={selectedUser}
          />
        </div>
      )}
    </>
  )
}

export default AdminUsers;