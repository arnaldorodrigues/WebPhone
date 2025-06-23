import { ISmsGateway, ISignalwireConfig, IViConfig } from "@/models/SmsGateway";
import { Dialog } from "@/components/ui/dialogs/dialog";
import Input from "@/components/ui/inputs/input";
import { useState, useEffect } from "react";

interface SmsGatewayEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gateway: Partial<ISmsGateway>) => void;
  gateway?: ISmsGateway;
  selectedGateway?: ISmsGateway;
}

export function SmsGatewayEditDialog({
  isOpen,
  onClose,
  onSave,
  gateway,
  selectedGateway,
}: SmsGatewayEditDialogProps) {
  const [formData, setFormData] = useState<Partial<ISmsGateway>>({
    type: "signalwire",
    config: {
      projectId: "",
      authToken: "",
      spaceUrl: "",
      phoneNumber: "",
    } as ISignalwireConfig | IViConfig,
  });

  useEffect(() => {
    if (gateway) {
      setFormData(gateway);
    } else if (selectedGateway?.type) {
      const defaultConfig =
        selectedGateway.type === "signalwire"
          ? ({
              projectId: "",
              authToken: "",
              spaceUrl: "",
              phoneNumber: "",
            } as ISignalwireConfig)
          : ({
              apiKey: "",
              apiSecret: "",
              phoneNumber: "",
            } as IViConfig);

      setFormData({
        type: selectedGateway.type,
        config: defaultConfig,
      });
    }
  }, [gateway, selectedGateway]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      config: {
        ...(prev.config as ISignalwireConfig | IViConfig),
        [name]: value,
      } as ISignalwireConfig | IViConfig,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getTypeLabel = (type: string) => {
    return type === "signalwire" ? "Signalwire" : "VI/Sangoma";
  };

  const renderFields = () => {
    if (formData.type === "signalwire") {
      const config = formData.config as ISignalwireConfig;
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              value={config?.phoneNumber || ""}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project ID
            </label>
            <Input
              id="projectId"
              type="text"
              name="projectId"
              value={config?.projectId || ""}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Space URL
            </label>
            <Input
              id="spaceUrl"
              type="text"
              name="spaceUrl"
              value={config?.spaceUrl || ""}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="example.signalwire.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Auth Token
            </label>
            <Input
              id="authToken"
              type="password"
              name="authToken"
              value={config?.authToken || ""}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </>
      );
    } else {
      const config = formData.config as IViConfig;
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              value={config?.phoneNumber || ""}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <Input
              id="apiKey"
              type="text"
              name="apiKey"
              value={config?.apiKey || ""}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              API Secret
            </label>
            <Input
              id="apiSecret"
              type="password"
              name="apiSecret"
              value={config?.apiSecret || ""}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </>
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={gateway ? "Edit SMS Gateway" : "Add SMS Gateway"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <div className="mt-1 block w-full px-3 py-2 text-base border border-gray-300 rounded-md bg-gray-50 text-gray-500">
            {getTypeLabel(formData.type || "")}
          </div>
        </div>

        {renderFields()}

        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </Dialog>
  );
}
