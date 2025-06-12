"use client";

import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import Pagination from "@/components/ui/pagination/pagination";
import ConfirmDialog from "@/components/ui/dialogs/confirm-dialog";
import { fetchWithAuth } from "@/utils/api";
import { ServerConfig } from "@/types/admin-server";
import ServerEditDialog from "@/components/feature/admin/servers/server-edit-dialog";

interface Props {
  servers: ServerConfig[];
  onRefresh?: () => void;
}

const ServerTable = ({ servers, onRefresh }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [currentServers, setCurrentServers] = useState<ServerConfig[]>([]);
  const [serverToEdit, setServerToEdit] = useState<ServerConfig | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<ServerConfig | null>(
    null
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Update pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentServers(servers.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, servers]);

  const totalPages = Math.ceil(servers.length / itemsPerPage);

  const openEdit = (srv: ServerConfig | null) => {
    setServerToEdit(srv);
    setIsEditDialogOpen(true);
  };

  const closeEdit = () => {
    setIsEditDialogOpen(false);
    setServerToEdit(null);
  };

  const handleDeleteServer = (srv: ServerConfig) => {
    setServerToDelete(srv);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteServer = async () => {
    if (!serverToDelete) return;

    try {
      const res = await fetchWithAuth(
        `/api/admin/servers?id=${serverToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete server");

      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to delete server. Please try again.");
    } finally {
      setServerToDelete(null);
    }
  };

  const closeConfirm = () => {
    setIsConfirmDialogOpen(false);
    setServerToDelete(null);
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Domain
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WS Server
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WS Port
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WS Path
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {currentServers.map((srv, idx) => (
            <tr
              key={srv.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {(currentPage - 1) * itemsPerPage + idx + 1}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {srv.domain}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {srv.wsServer}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {srv.wsPort}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {srv.wsPath}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEdit(srv)}
                    className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteServer(srv)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mx-4 my-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={servers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Edit dialog */}
      <ServerEditDialog
        isOpen={isEditDialogOpen}
        onClose={closeEdit}
        server={serverToEdit}
        onSuccess={onRefresh}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={closeConfirm}
        onConfirm={confirmDeleteServer}
        title="Delete Server"
        message={`Are you sure you want to delete ${serverToDelete?.domain}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ServerTable;
