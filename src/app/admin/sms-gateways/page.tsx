'use client'

import { SmsGatewayEditDialog, SmsGatewaysTable } from "@/components/admin";
import { ConfirmDialog } from "@/components/ui/dialogs";
import { SearchInput } from "@/components/ui/inputs";
import { Pagination } from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/ui/skeleton";
import { ISmsGatewayItem } from "@/core/sms-gateways/model";
import { deleteSmsGateway, getSmsGateways } from "@/core/sms-gateways/request";
import { AppDispatch, RootState } from "@/store";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AdminSmsGateways = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { smsgateways, loading } = useSelector((state: RootState) => state.smsgateways);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isOpenEditDialog, setIsOpenEditDialog] = useState<boolean>(false);
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState<boolean>(false);
  const [selectedSmsGateway, setSelectedSmsGateway] = useState<ISmsGatewayItem>();

  const handleAddSmsGateway = () => {
    setSelectedSmsGateway(undefined);
    setIsOpenEditDialog(true);
  }

  const handleEditSmsGateway = (smsgateway: ISmsGatewayItem) => {
    setSelectedSmsGateway(smsgateway);
    setIsOpenEditDialog(true);
  }

  const handleDeleteSipServer = (smsgateway: ISmsGatewayItem) => {
    setSelectedSmsGateway(smsgateway);
    setIsOpenConfirmDialog(true);
  }

  const confirmDeleteSmsGateway = () => {
    if (!selectedSmsGateway) return;
    dispatch(deleteSmsGateway(selectedSmsGateway?._id));
  }

  useEffect(() => {
    dispatch(getSmsGateways());
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
              placeholder="Search by type or phone number..."
              className="flex-1"
            />
            <button
              onClick={handleAddSmsGateway}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add SMS Gateway
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <SmsGatewaysTable
                smsGateways={smsgateways}
                handleEdit={handleEditSmsGateway}
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
                totalItems={smsgateways.length}
                pageSize={pageSize}
              />
            </div>
          </div>

          <SmsGatewayEditDialog
            isOpen={isOpenEditDialog}
            gateway={selectedSmsGateway}
            onClose={() => setIsOpenEditDialog(false)}
          />

          <ConfirmDialog
            isOpen={isOpenConfirmDialog}
            onClose={() => setIsOpenConfirmDialog(false)}
            onConfirm={confirmDeleteSmsGateway}
            title="Delete Server"
            message={`Are you sure you want to delete ${selectedSmsGateway?.didNumber}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        </div>
      )}
    </>
  )
}

export default AdminSmsGateways;