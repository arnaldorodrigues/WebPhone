'use client'

import { Dialog } from "@/components/ui/dialogs";
import { DropdownSelect, Input } from "@/components/ui/inputs";
import { ICreateSmsGatewayRequest, ISmsGatewayItem, IUpdateSmsGatewayRequest } from "@/core/sms-gateways/model";
import { createSmsGateway, updateSmsGateway } from "@/core/sms-gateways/request";
import { ISignalWireConfig, IViConfig } from "@/models/SmsGateway";
import { AppDispatch } from "@/store";
import { SmsGatewayType, TDropdownOption } from "@/types/common";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  gateway: ISmsGatewayItem | undefined;
}
export const SmsGatewayEditDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  gateway
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const typeOptions: TDropdownOption[] = [
    { value: 'signalwire', label: 'SiganlWire' },
    { value: 'vi', label: 'VI' },
  ]

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedType, setSelectedType] = useState<TDropdownOption>(typeOptions[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [projectId, setProjectId] = useState<string>("");
  const [spaceUrl, setSpaceUrl] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");

  useEffect(() => {
    setIsSubmitting(false);

    setSelectedType({
      value: gateway?.type ?? SmsGatewayType.SIGNALWIRE,
      label: gateway?.type ?? SmsGatewayType.SIGNALWIRE
    });
    setPhoneNumber(gateway?.didNumber ?? "");
    setProjectId((gateway?.config as ISignalWireConfig)?.projectId ?? "");
    setSpaceUrl((gateway?.config as ISignalWireConfig)?.spaceUrl ?? "");
    setAuthToken((gateway?.config as ISignalWireConfig)?.authToken ?? "");
    setApiKey((gateway?.config as IViConfig)?.apiKey ?? "");
    setApiSecret((gateway?.config as IViConfig)?.apiSecret ?? "");
  }, [isOpen])

  const handleCreate = () => {
    const config = selectedType.value === SmsGatewayType.SIGNALWIRE
      ? {
        projectId: projectId,
        spaceUrl: spaceUrl,
        authToken: authToken
      } as ISignalWireConfig
      : {
        apiKey: apiKey,
        apiSecret: apiSecret
      } as IViConfig;

    const payload: ICreateSmsGatewayRequest = {
      type: selectedType.value,
      didNumber: phoneNumber,
      config: config
    }

    dispatch(createSmsGateway(payload))
  }

  const handleUpdate = () => {
    const config = selectedType.value === SmsGatewayType.SIGNALWIRE
      ? {
        projectId: projectId,
        spaceUrl: spaceUrl,
        authToken: authToken
      } as ISignalWireConfig
      : {
        apiKey: apiKey,
        apiSecret: apiSecret
      } as IViConfig;

    const payload: IUpdateSmsGatewayRequest = {
      id: gateway?._id || '',
      type: selectedType.value,
      didNumber: phoneNumber,
      config: config
    }

    dispatch(updateSmsGateway(payload));
  }

  const handleSubmit = () => {
    setIsSubmitting(true);

    if (gateway) {
      handleUpdate();
    } else {
      handleCreate();
    }

    setIsSubmitting(false);
    onClose();
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={gateway ? "Edit SMS Gateway" : "Add SMS Gateway"}
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type *
          </label>
          <DropdownSelect
            value={selectedType}
            onChange={(value: TDropdownOption) => setSelectedType(value)}
            options={typeOptions}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <Input
            id="phoneNumber"
            type="text"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required={true}
            placeholder="2134567890"
          />
        </div>

        {selectedType.value === SmsGatewayType.SIGNALWIRE ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project ID *
              </label>
              <Input
                id="projectId"
                type="text"
                name="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space URL *
              </label>
              <Input
                id="spaceUrl"
                type="text"
                name="spaceUrl"
                value={spaceUrl}
                onChange={(e) => setSpaceUrl(e.target.value)}
                required={true}
                placeholder="example.signalwire.com"
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
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                required={true}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Key *
              </label>
              <Input
                id="apiKey"
                type="text"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required={true}
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
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                required={true}
              />
            </div>
          </>
        )}

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
            type="button"
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {!gateway ? "Saving..." : "Create"}
              </>
            ) : gateway ? (
              "Save Changes"
            ) : (
              "Create Gateway"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  )
}