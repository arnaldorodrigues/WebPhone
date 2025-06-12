"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import Input from "@/components/ui/inputs/input";
import { ServerConfig } from "@/types/server-type";
import { fetchWithAuth } from "@/utils/api";
import { CheckIcon } from "@heroicons/react/24/outline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  server: ServerConfig | null;
  onSuccess?: () => void;
}

interface FormData {
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
}

const ServerEditDialog = ({ isOpen, onClose, server, onSuccess }: Props) => {
  const [formData, setFormData] = useState<FormData>({
    domain: "",
    wsServer: "",
    wsPort: "",
    wsPath: "/",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreateMode = !server;
  const title = isCreateMode ? "Add Server" : "Edit Server";
  const buttonText = isCreateMode ? "Create" : "Save";

  useEffect(() => {
    if (server) {
      setFormData({
        domain: server.domain,
        wsServer: server.wsServer,
        wsPort: server.wsPort,
        wsPath: server.wsPath,
      });
    } else {
      setFormData({ domain: "", wsServer: "", wsPort: "", wsPath: "/" });
    }
    setErrors({});
  }, [server]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.domain.trim()) errs.domain = "Domain is required";
    if (!formData.wsServer.trim()) errs.wsServer = "WS Server is required";
    if (!formData.wsPort.trim()) {
      errs.wsPort = "WS Port is required";
    } else if (!/^\d+$/.test(formData.wsPort)) {
      errs.wsPort = "WS Port must be numeric";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        id: server?.id,
        ...formData,
      };

      const res = await fetchWithAuth("/api/admin/servers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes("Domain already exists")) {
          setErrors({ domain: data.error });
        } else {
          alert(data.error || "Failed to save server");
        }
        return;
      }

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} title={title} maxWidth="sm">
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
          {errors.domain && (
            <p className="text-red-500 text-xs mt-1">{errors.domain}</p>
          )}
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
          {errors.wsServer && (
            <p className="text-red-500 text-xs mt-1">{errors.wsServer}</p>
          )}
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
          {errors.wsPort && (
            <p className="text-red-500 text-xs mt-1">{errors.wsPort}</p>
          )}
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
            onClick={handleCancel}
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
                <CheckIcon className="h-4 w-4 mr-1" /> {buttonText}
              </span>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default ServerEditDialog;
