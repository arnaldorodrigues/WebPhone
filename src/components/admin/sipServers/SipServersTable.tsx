'use client'

import { ISipServer } from "@/core/sip-servers/model"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  sipServers: ISipServer[];
  currentPage: number;
  pageSize: number;
  handleEdit: (sipServer: ISipServer) => void;
  handleDelete: (sipServer: ISipServer) => void;
}

export const SipServersTable: React.FC<Props> = ({
  sipServers,
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
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Domain
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            WS Server
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            WS Port
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            WS Path
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {sipServers.length > 0 && sipServers.map((srv, idx) => (
          <tr
            key={srv._id}
            className="hover:bg-gray-50 transition-colors duration-200"
          >
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {(currentPage - 1) * pageSize + idx + 1}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {srv.domain}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {srv.wsServer}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {srv.wsPort}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
              {srv.wsPath}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(srv)}
                  className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(srv)}
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