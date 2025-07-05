"use client";

import { ISmsGateway, ISignalwireConfig, IViConfig } from "@/models/SmsGateway__";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import ConfirmDialog from "@/components/ui/dialogs/confirm-dialog";
import { SmsGatewayEditDialog } from "./sms-gateway-edit-dialog";
import { SmsGatewayDetailDialog } from "./sms-gateway-detail-dialog";
import Pagination from "@/components/ui/pagination/pagination";
import { fetchWithAuth } from "@/utils/api";

interface SmsGatewayTableProps {
  gateways: ISmsGateway[];
  onRefresh?: () => void;
}

export function SmsGatewayTable({ gateways, onRefresh }: SmsGatewayTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [currentGateways, setCurrentGateways] = useState<ISmsGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<ISmsGateway | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState<ISmsGateway | null>(
    null
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentGateways = gateways.slice(startIndex, endIndex);

    setCurrentGateways(currentGateways);
  }, [currentPage, itemsPerPage, gateways]);

  useEffect(() => {
    setCurrentPage(1);
  }, [gateways.length]);

  const handleViewGatewayDetail = (gateway: ISmsGateway) => {
    setSelectedGateway(gateway);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedGateway(null);
  };

  const handleEditGateway = (gateway: ISmsGateway) => {
    setSelectedGateway(gateway);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedGateway(null);
  };

  const handleDeleteGateway = (gateway: ISmsGateway) => {
    setGatewayToDelete(gateway);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteGateway = async () => {
    if (!gatewayToDelete || !gatewayToDelete._id) return;

    try {
      const response = await fetchWithAuth(
        `/api/admin/sms-gateways?id=${gatewayToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete SMS gateway");
      }

      if (onRefresh) {
        onRefresh();
      }

      if (isDetailDialogOpen) {
        setIsDetailDialogOpen(false);
        setSelectedGateway(null);
      }
    } catch (error) {
      console.error("Error deleting gateway:", error);
      alert("Failed to delete SMS gateway. Please try again.");
    } finally {
      setGatewayToDelete(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setGatewayToDelete(null);
  };

  const totalPages = Math.ceil(gateways.length / itemsPerPage);

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-100 overflow-x-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              projectId / apikey
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SpaceUrl
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AuthToken / apiSecret
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
          {currentGateways.map((gateway) => (
            <tr
              key={gateway._id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                {gateway.config.phoneNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 capitalize">
                {gateway.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                {(() => {
                  const value =
                    gateway.type === "signalwire"
                      ? (gateway.config as ISignalwireConfig).projectId
                      : (gateway.config as IViConfig).apiKey;
                  return value && value.length > 10
                    ? value.slice(0, 10) + "..."
                    : value;
                })()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                {gateway.type === "signalwire"
                  ? (() => {
                      const spaceUrl = (gateway.config as ISignalwireConfig)
                        .spaceUrl;
                      if (!spaceUrl) return "";
                      const firstWord = spaceUrl.split(".")[0];
                      return firstWord + "...";
                    })()
                  : ""}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                {new Date(gateway.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewGatewayDetail(gateway)}
                    className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="View Gateway"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditGateway(gateway)}
                    className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="Edit Gateway"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGateway(gateway)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Delete Gateway"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {gateways.length > 0 && (
        <div className="mx-4 my-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={gateways.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {gateways.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No SMS gateways found</p>
        </div>
      )}

      <SmsGatewayDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        gateway={selectedGateway}
        onEdit={() => {
          setIsDetailDialogOpen(false);
          setIsEditDialogOpen(true);
        }}
        onDelete={(gatewayId: string) => {
          const gateway = gateways.find((g) => g._id === gatewayId);
          if (gateway) handleDeleteGateway(gateway);
        }}
      />

      <SmsGatewayEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        gateway={selectedGateway || undefined}
        onRefresh={onRefresh}
      />

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={confirmDeleteGateway}
        title="Delete SMS Gateway"
        message={`Are you sure you want to delete the SMS gateway with number ${gatewayToDelete?.config.phoneNumber}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
