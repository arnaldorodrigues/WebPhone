import { ISmsGateway, ISignalwireConfig, IViConfig } from "@/models/SmsGateway";
import { Dialog } from "@/components/ui/dialogs/dialog";
import Input from "@/components/ui/inputs/input";
import { useState, useEffect } from "react";
import DropdownSelect from "@/components/ui/inputs/dropdown-select";
import { useNotification } from "@/contexts/notification-context";

interface SmsGatewayEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gateway?: ISmsGateway;
  onRefresh?: () => void;
}

export function SmsGatewayEditDialog({
  isOpen,
  onClose,
  gateway,
  onRefresh,
}: SmsGatewayEditDialogProps) {
  const { showNotification } = useNotification();
  const [apiError, setApiError] = useState<string>("");

  const [formData, setFormData] = useState<Partial<ISmsGateway>>({
    type: "signalwire",
    config: {
      phoneNumber: "",
      projectId: "",
      authToken: "",
      spaceUrl: "",
    } as ISignalwireConfig | IViConfig,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (gateway) {
      setFormData(gateway);
    }
  }, [gateway]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const config = formData.config as ISignalwireConfig | IViConfig;
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    if (!config.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (formData.type === "signalwire") {
      const swConfig = config as ISignalwireConfig;
      if (!swConfig.projectId?.trim()) {
        newErrors.projectId = "Project ID is required";
      }
      if (!swConfig.authToken?.trim()) {
        newErrors.authToken = "Auth Token is required";
      }
      if (!swConfig.spaceUrl?.trim()) {
        newErrors.spaceUrl = "Space URL is required";
      }
    } else if (formData.type === "vi") {
      const viConfig = config as IViConfig;
      if (!viConfig.apiKey?.trim()) {
        newErrors.apiKey = "API Key is required";
      }
      if (!viConfig.apiSecret?.trim()) {
        newErrors.apiSecret = "API Secret is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      config: {
        ...(prev.config as ISignalwireConfig | IViConfig),
        [name]: value,
      } as ISignalwireConfig | IViConfig,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSave = async (gatewayData: Partial<ISmsGateway>) => {
    try {
      const url = "/api/admin/sms-gateways";
      const method = gateway ? "PUT" : "POST";
      const body = gateway
        ? JSON.stringify({ ...gatewayData, id: gateway._id })
        : JSON.stringify(gatewayData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || "Failed to save gateway", "error");
        setApiError(data.error || "Failed to save gateway");
        return false;
      }

      showNotification(
        `SMS gateway ${gateway ? "updated" : "created"} successfully`,
        "success"
      );
      return true;
    } catch (error) {
      console.error("Error saving gateway:", error);
      showNotification("Failed to save SMS gateway", "error");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await handleSave(formData);
      if (success) {
        onRefresh?.();
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error("Error saving gateway:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFields = () => {
    if (formData.type === "signalwire") {
      const config = formData.config as ISignalwireConfig;
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <Input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              value={config.phoneNumber || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              placeholder="2134567890"
              error={errors.phoneNumber}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project ID *
            </label>
            <Input
              id="projectId"
              type="text"
              name="projectId"
              value={config?.projectId || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              error={errors.projectId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Space URL *
            </label>
            <Input
              id="spaceUrl"
              type="text"
              name="spaceUrl"
              value={config?.spaceUrl || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              placeholder="example.signalwire.com"
              error={errors.spaceUrl}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Auth Token *
            </label>
            <Input
              id="authToken"
              type="password"
              name="authToken"
              value={config?.authToken || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              error={errors.authToken}
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
              Phone Number *
            </label>
            <Input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              value={config.phoneNumber || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              placeholder="2134567890"
              error={errors.phoneNumber}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              API Key *
            </label>
            <Input
              id="apiKey"
              type="text"
              name="apiKey"
              value={config?.apiKey || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              error={errors.apiKey}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              API Secret *
            </label>
            <Input
              id="apiSecret"
              type="password"
              name="apiSecret"
              value={config?.apiSecret || ""}
              onChange={handleChange}
              required={false}
              className="mt-1"
              error={errors.apiSecret}
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
      title={!gateway ? "Edit SMS Gateway" : "Add SMS Gateway"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type *
          </label>
          <DropdownSelect
            value={formData.type || ""}
            onChange={(value: string) =>
              setFormData({
                ...formData,
                type: value as "signalwire" | "vi",
                config:
                  value === "signalwire"
                    ? ({
                        phoneNumber: "",
                        projectId: "",
                        authToken: "",
                        spaceUrl: "",
                      } as ISignalwireConfig)
                    : ({
                        phoneNumber: "",
                        apiKey: "",
                        apiSecret: "",
                      } as IViConfig),
              })
            }
            options={[
              { value: "signalwire", label: "SignalWire" },
              { value: "vi", label: "VI" },
            ]}
            className={`mt-1`}
            disabled={!!gateway}
            placeholder="Select Type"
          />
        </div>

        {renderFields()}

        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {!gateway ? "Saving..." : "Create"}
              </>
            ) : !gateway ? (
              "Save Changes"
            ) : (
              "Create Gateway"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
