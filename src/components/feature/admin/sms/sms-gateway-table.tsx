import { ISmsGateway, ISignalwireConfig, IViConfig } from "@/models/SmsGateway";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/ui/dialogs/dialog";
import { useState } from "react";

interface SmsGatewayCardsProps {
  gateways: ISmsGateway[];
  onEdit: (gateway: ISmsGateway) => void;
  onDelete: (id: string) => void;
}

export function SmsGatewayCards({
  gateways,
  onEdit,
  onDelete,
}: SmsGatewayCardsProps) {
  const signalwireGateway = gateways.find((g) => g.type === "signalwire");
  const viGateway = gateways.find((g) => g.type === "vi");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState<ISmsGateway | null>(
    null
  );

  const handleDeleteClick = (gateway: ISmsGateway) => {
    setGatewayToDelete(gateway);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (gatewayToDelete?._id) {
      onDelete(gatewayToDelete._id);
      setDeleteConfirmOpen(false);
      setGatewayToDelete(null);
    }
  };

  const GatewayCard = ({
    type,
    gateway,
  }: {
    type: "signalwire" | "vi";
    gateway?: ISmsGateway;
  }) => {
    const isSignalwire = type === "signalwire";
    const title = isSignalwire ? "Signalwire" : "VI/Sangoma";
    const bgColor = isSignalwire ? "bg-purple-50" : "bg-blue-50";
    const borderColor = isSignalwire ? "border-purple-200" : "border-blue-200";
    const textColor = isSignalwire ? "text-purple-700" : "text-blue-700";
    const bgHoverColor = isSignalwire
      ? "hover:bg-purple-100"
      : "hover:bg-blue-100";

    const maskValue = (value: string) => {
      return value ? "••••••••••" : "Not configured";
    };

    const renderGatewayFields = () => {
      if (!gateway?.config) return null;

      if (isSignalwire) {
        const config = gateway.config as ISignalwireConfig;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Phone Number
              </div>
              <div className="mt-1 text-sm">{config.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                Project ID
              </div>
              <div className="mt-1 text-sm">{config.projectId}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Space URL</div>
              <div className="mt-1 text-sm">{config.spaceUrl}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                Auth Token
              </div>
              <div className="mt-1 text-sm font-mono">
                {maskValue(config.authToken)}
              </div>
            </div>
          </div>
        );
      } else {
        const config = gateway.config as IViConfig;
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Phone Number
              </div>
              <div className="mt-1 text-sm">{config.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">API Key</div>
              <div className="mt-1 text-sm">{config.apiKey}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                API Secret
              </div>
              <div className="mt-1 text-sm font-mono">
                {maskValue(config.apiSecret)}
              </div>
            </div>
          </div>
        );
      }
    };

    return (
      <div className={`rounded-lg border ${borderColor} ${bgColor} p-6 w-full`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
          <div className="flex space-x-2">
            {gateway ? (
              <>
                <button
                  onClick={() => onEdit(gateway)}
                  className={`${textColor} ${bgHoverColor} p-1 rounded transition-colors duration-200`}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(gateway)}
                  className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors duration-200"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onEdit({ type } as ISmsGateway)}
                className={`${textColor} ${bgHoverColor} px-3 py-1 rounded transition-colors duration-200 text-sm`}
              >
                Configure
              </button>
            )}
          </div>
        </div>

        {gateway ? (
          renderGatewayFields()
        ) : (
          <div className="text-sm text-gray-500">No configuration found</div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 w-full">
        <GatewayCard type="signalwire" gateway={signalwireGateway} />
        <GatewayCard type="vi" gateway={viGateway} />
      </div>

      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this{" "}
            {gatewayToDelete?.type === "signalwire"
              ? "Signalwire"
              : "VI/Sangoma"}{" "}
            gateway? This action cannot be undone and may affect SMS
            functionality.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Gateway
          </button>
        </div>
      </Dialog>
    </>
  );
}
