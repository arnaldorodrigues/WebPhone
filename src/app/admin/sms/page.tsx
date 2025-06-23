"use client";

import { useState, useEffect } from "react";
import { ISmsGateway } from "@/models/SmsGateway";
import { SmsGatewayCards } from "@/components/feature/admin/sms/sms-gateway-table";
import { SmsGatewayEditDialog } from "@/components/feature/admin/sms/sms-gateway-edit-dialog";
// import { Button } from "@/components/ui/buttons/button";
import { useNotification } from "@/contexts/notification-context";
import SearchInput from "@/components/ui/inputs/search-input";
import { PlusIcon } from "@heroicons/react/24/outline";

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

  const handleSave = async (gatewayData: Partial<ISmsGateway>) => {
    try {
      const existingGateway = gateways.find((g) => g.type === gatewayData.type);
      const url = "/api/admin/sms-gateways";
      const method = existingGateway ? "PUT" : "POST";
      const body = existingGateway
        ? JSON.stringify({ ...gatewayData, id: existingGateway._id })
        : JSON.stringify(gatewayData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) throw new Error("Failed to save gateway");

      showNotification(
        `SMS gateway ${existingGateway ? "updated" : "created"} successfully`,
        "success"
      );
      setIsEditDialogOpen(false);
      fetchGateways();
    } catch (error) {
      console.error("Error saving gateway:", error);
      showNotification("Failed to save SMS gateway", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sms-gateways?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete gateway");

      showNotification("SMS gateway deleted successfully", "success");
      fetchGateways();
    } catch (error) {
      console.error("Error deleting gateway:", error);
      showNotification("Failed to delete SMS gateway", "error");
    }
  };

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
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <SmsGatewayCards
            gateways={gateways}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <SmsGatewayEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
        gateway={selectedGateway || undefined}
        selectedGateway={selectedGateway || undefined}
      />
    </div>
  );
}
