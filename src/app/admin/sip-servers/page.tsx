'use client'

import { SipServerEditDialog, SipServersTable } from "@/components/admin";
import { ConfirmDialog } from "@/components/ui/dialogs";
import { SearchInput } from "@/components/ui/inputs";
import { Pagination } from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/ui/skeleton";
import { ISipServer } from "@/core/sip-servers/model";
import { deleteSipServer, getSipServers } from "@/core/sip-servers/request";
import { AppDispatch, RootState } from "@/store";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const AdminSipServers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sipservers, loading } = useSelector((state: RootState) => state.sipservers);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isOpenEditDialog, setIsOpenEditDialog] = useState<boolean>(false);
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState<boolean>(false);
  const [selectedSipServer, setSelectedSipServer] = useState<ISipServer>();

  const handleAddSipServer = () => {
    setSelectedSipServer(undefined);
    setIsOpenEditDialog(true);
  }

  const handleEditSipServer = (sipserver: ISipServer) => {
    setSelectedSipServer(sipserver);
    setIsOpenEditDialog(true);
  }

  const handleDeleteSipServer = (sipserver: ISipServer) => {
    setSelectedSipServer(sipserver);
    setIsOpenConfirmDialog(true);
  }

  const confirmDeleteSipServer = () => {
    if (!selectedSipServer) return;
    dispatch(deleteSipServer(selectedSipServer?._id));
  }

  useEffect(() => {
    dispatch(getSipServers());
  }, [dispatch]);

  return (
    <>
      {loading ? (
        <ListSkeleton />
      ) : (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by domain or server..."
              className="flex-1"
            />
            <button
              onClick={handleAddSipServer}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add SipServer
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <SipServersTable
                sipServers={sipservers}
                handleEdit={handleEditSipServer}
                handleDelete={handleDeleteSipServer}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            </div>

            <div className="px-6 py-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sipservers.length}
                pageSize={pageSize}
              />
            </div>
          </div>

          <SipServerEditDialog
            sipServer={selectedSipServer}
            onClose={() => setIsOpenEditDialog(false)}
            isOpen={isOpenEditDialog}
          />

          <ConfirmDialog
            isOpen={isOpenConfirmDialog}
            onClose={() => setIsOpenConfirmDialog(false)}
            onConfirm={confirmDeleteSipServer}
            title="Delete Server"
            message={`Are you sure you want to delete ${selectedSipServer?.domain}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        </div>
      )}
    </>
  )
}

export default AdminSipServers;