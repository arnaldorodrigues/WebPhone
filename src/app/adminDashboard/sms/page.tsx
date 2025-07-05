"use client";

import { useState, useEffect } from "react";
import { ISmsGateway, IViConfig, ISignalwireConfig } from "@/models/SmsGateway__";
import { SmsGatewayTable } from "@/components/feature/admin/sms/sms-gateway-table";
import { SmsGatewayEditDialog } from "@/components/feature/admin/sms/sms-gateway-edit-dialog";
import { useNotification } from "@/contexts/notification-context";
import SearchInput from "@/components/ui/inputs/search-input";
import { PlusIcon } from "@heroicons/react/24/outline";
import SmsGatewayPageSkeleton from "@/components/feature/admin/sms/sms-gateway-page-skeleton";

export default function SmsGatewaysPage() {
  const [gateways, setGateways] = useState<ISmsGateway[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<ISmsGateway | null>(
    null
  );
  const { showNotification } = useNotification();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchGateways = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/sms-gateways");
      if (!response.ok) throw new Error("Failed to fetch gateways");
      const data = await response.json();
      setGateways(data);
    } catch (error) {
      setError("Failed to fetch gateways data");
      console.error("Error fetching gateways:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleAdd = () => {
    setSelectedGateway(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (gateway: ISmsGateway) => {
    setSelectedGateway(gateway);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sms-gateways?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        showNotification(data.error || "Failed to delete SMS gateway", "error");
        return;
      }

      showNotification("SMS gateway deleted successfully", "success");
      fetchGateways();
    } catch (error) {
      console.error("Error deleting gateway:", error);
      showNotification("Failed to delete SMS gateway", "error");
    }
  };

  const filteredGateways = gateways.filter((gateway) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      gateway.type.toLowerCase().includes(searchLower) ||
      gateway.config.phoneNumber.toLowerCase().includes(searchLower) ||
      (gateway.config as ISignalwireConfig)?.projectId
        ?.toLowerCase()
        ?.includes(searchLower) ||
      (gateway.config as ISignalwireConfig)?.spaceUrl
        ?.toLowerCase()
        ?.includes(searchLower) ||
      (gateway.config as IViConfig)?.apiKey
        ?.toLowerCase()
        ?.includes(searchLower)
    );
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="text-red-800">
            <h3 className="text-lg font-medium mb-2">
              Error Loading SMS Gateways
            </h3>
            <p>{error}</p>
            <button
              onClick={fetchGateways}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <SmsGatewayPageSkeleton />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by type or phone number..."
          className="flex-1"
        />
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Gateway
        </button>
      </div>

      <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <SmsGatewayTable
            gateways={filteredGateways}
            onRefresh={fetchGateways}
          />
        </div>
      </div>

      <SmsGatewayEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
        }}
        gateway={selectedGateway || undefined}
        onRefresh={fetchGateways}
      />
    </div>
  );
}
