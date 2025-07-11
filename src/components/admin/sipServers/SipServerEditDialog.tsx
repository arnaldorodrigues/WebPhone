'use client'

import { Dialog } from "@/components/ui/dialogs"
import { Input } from "@/components/ui/inputs";
import { ISipServer } from "@/core/sip-servers/model";
import { createSipServer, updateSipServer } from "@/core/sip-servers/request";
import { AppDispatch } from "@/store";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sipServer: ISipServer | undefined;
}

interface IFormData {
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
}

export const SipServerEditDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  sipServer
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const isCreateMode = !sipServer;
  const dialogTitle = isCreateMode ? "Create SIP Server" : "Edit SIP Server";

  const initialValue: IFormData = {
    domain: "",
    wsServer: "",
    wsPort: "",
    wsPath: "/"
  };

  const [formData, setFormData] = useState<IFormData>(initialValue);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: keyof IFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    if (isCreateMode) {
      dispatch(createSipServer({ ...formData }));
    } else {
      const payload = {
        id: sipServer._id,
        ...formData
      }
      dispatch(updateSipServer(payload));
    }

    setIsSubmitting(false);
    onClose();
  }

  useEffect(() => {
    setIsSubmitting(false);
    
    if (sipServer) {
      setFormData({
        domain: sipServer.domain,
        wsServer: sipServer.wsServer,
        wsPort: sipServer.wsPort,
        wsPath: sipServer.wsPath
      });
    } else {
      setFormData(initialValue);
    }
  }, [isOpen])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={dialogTitle}
      maxWidth="2xl"
      closeOnOutsideClick={false}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domain *
          </label>
          <Input
            id="domain"
            name="domain"
            type="text"
            required
            placeholder="example.com"
            value={formData.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WebSocket Server *
          </label>
          <Input
            id="wsServer"
            name="wsServer"
            type="text"
            required
            placeholder="wss://example.com"
            value={formData.wsServer}
            onChange={(e) => handleChange("wsServer", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WebSocket Port *
          </label>
          <Input
            id="wsPort"
            name="wsPort"
            type="text"
            required
            placeholder="8080"
            value={formData.wsPort}
            onChange={(e) => handleChange("wsPort", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WebSocket Path
          </label>
          <Input
            id="wsPath"
            name="wsPath"
            type="text"
            required={false}
            placeholder="/"
            value={formData.wsPath}
            onChange={(e) => handleChange("wsPath", e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <span className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-1" />
                {isCreateMode ? "Create" : "Save"}
              </span>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  )
}