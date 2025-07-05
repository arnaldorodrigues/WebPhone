"use client";

import { Dialog } from "@/components/ui/dialogs/dialog";
import {
  PhoneIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { ISmsGateway, ISignalwireConfig, IViConfig } from "@/models/SmsGateway__";

interface SmsGatewayDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: ISmsGateway | null;
  onEdit?: () => void;
  onDelete?: (gatewayId: string) => void;
}

export function SmsGatewayDetailDialog({
  isOpen,
  onClose,
  gateway,
  onEdit,
  onDelete,
}: SmsGatewayDetailDialogProps) {
  if (!gateway) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      onClose();
    }
  };

  const handleDelete = () => {
    if (
      onDelete &&
      confirm("Are you sure you want to delete this SMS gateway?")
    ) {
      onDelete(gateway._id as string);
      onClose();
    }
  };

  const getGatewayTypeBadge = (type: string) => {
    const typeClasses = {
      signalwire: "bg-purple-100 text-purple-700",
      vi: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          typeClasses[type as keyof typeof typeClasses]
        }`}
      >
        {type === "signalwire" ? "SignalWire" : "VI"}
      </span>
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="SMS Gateway Details"
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <PhoneIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {gateway.config.phoneNumber}
              </h2>
              {getGatewayTypeBadge(gateway.type)}
            </div>
            <p className="text-sm text-gray-500">
              Created on{" "}
              {new Date(gateway.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CogIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Gateway Configuration
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <PhoneIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Phone Number
                </p>
                <p className="text-gray-900 font-mono">
                  {gateway.config.phoneNumber}
                </p>
              </div>
            </div>

            {gateway.type === "signalwire" ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Project ID
                    </p>
                    <p className="text-gray-900 font-mono">
                      {(gateway.config as ISignalwireConfig).projectId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Space URL
                    </p>
                    <p className="text-gray-900 font-mono">
                      {(gateway.config as ISignalwireConfig).spaceUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Auth Token
                    </p>
                    <p className="text-gray-900 font-mono">••••••••</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">API Key</p>
                    <p className="text-gray-900 font-mono">
                      {(gateway.config as IViConfig).apiKey}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      API Secret
                    </p>
                    <p className="text-gray-900 font-mono">••••••••</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Close
          </button>

          {/* {onEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Gateway
            </button>
          )} */}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Gateway
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
