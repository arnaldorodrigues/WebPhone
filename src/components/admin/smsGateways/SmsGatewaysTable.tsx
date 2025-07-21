import { ISmsGatewayItem } from "@/core/sms-gateways/model";
import { ISignalWireConfig, IViConfig } from "@/models/SmsGateway";
import { SmsGatewayType, SmsGatewayTypeValues } from "@/types/common";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  smsGateways: ISmsGatewayItem[];
  currentPage: number;
  pageSize: number;
  handleEdit: (smsGateway: ISmsGatewayItem) => void;
  handleDelete: (smsGateway: ISmsGatewayItem) => void;
}

export const SmsGatewaysTable: React.FC<Props> = ({
  smsGateways,
  currentPage,
  pageSize,
  handleEdit,
  handleDelete
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            No
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Phone Number
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            projectId / apikey
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            SpaceUrl
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            AuthToken / apiSecret
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {smsGateways.length > 0 && smsGateways.map((gateway, idx) => (
          <tr
            key={gateway._id}
            className="hover:bg-gray-50 transition-colors duration-200"
          >
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {(currentPage - 1) * pageSize + idx + 1}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
              {gateway.didNumber}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 capitalize">
              {gateway.type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
              {gateway.type === SmsGatewayType.SIGNALWIRE
                ? (gateway.config as ISignalWireConfig).projectId.slice(0, 8) + "..."
                : (gateway.config as IViConfig).apiKey
              }
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
              {gateway.type === SmsGatewayType.SIGNALWIRE
                ? (gateway.config as ISignalWireConfig).spaceUrl
                : ""
              }
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
              &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(gateway)}
                  className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(gateway)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}