"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

import SearchInput from "@/components/ui/inputs/search-input";
import ServerTable from "@/components/feature/admin/servers/server-table";
import ServerEditDialog from "@/components/feature/admin/servers/server-edit-dialog";
import { fetchWithAuth } from "@/utils/api";
import { ServerConfig } from "@/types/server-type";
import ServersPageSkeleton from "@/components/feature/admin/servers/servers-page-skeleton";

const ServersPage = () => {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [filteredServers, setFilteredServers] = useState<ServerConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchServers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchWithAuth("/api/admin/servers");
      const result = await response.json();

      if (result.success) {
        setFilteredServers(result.data);
      } else {
        setError("Failed to fetch servers");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServers(servers);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredServers(
        servers.filter(
          (srv) =>
            srv.domain.toLowerCase().includes(term) ||
            srv.wsServer.toLowerCase().includes(term) ||
            srv.wsPort.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, servers]);

  if (loading) {
    return <ServersPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="text-red-800">
            <h3 className="text-lg font-medium mb-2">Error Loading Servers</h3>
            <p>{error}</p>
            <button
              onClick={fetchServers}
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by domain or server..."
          className="flex-1"
        />

        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Add Server
        </button>
      </div>

      <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <ServerTable servers={filteredServers} onRefresh={fetchServers} />
        </div>
        {filteredServers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No servers found</div>
          </div>
        )}
      </div>

      <ServerEditDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        server={null}
        onSuccess={fetchServers}
      />
    </div>
  );
};

export default ServersPage;
