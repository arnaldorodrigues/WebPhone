import Skeleton from "@/components/ui/skeleton/skeleton";

const ServersPageSkeleton = () => {
  return (
    <div className="p-6 w-full mx-auto">
      {/* Actions Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input Skeleton */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full" variant="button" />
        </div>

        {/* Add Server Button Skeleton */}
        <Skeleton className="h-10 w-28" variant="button" />
      </div>

      {/* Servers Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            {/* Table Header Skeleton */}
            <thead className="bg-gray-50">
              <tr>
                {[
                  "No",
                  "Domain",
                  "WS Server",
                  "WS Port",
                  "WS Path",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-6 py-3">
                    <Skeleton className="h-4 w-20" variant="text" />
                  </th>
                ))}
              </tr>
            </thead>
            {/* Table Body Skeleton */}
            <tbody className="bg-white divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {/* No */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-6" variant="text" />
                  </td>
                  {/* Domain */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-40" variant="text" />
                  </td>
                  {/* WS Server */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-48" variant="text" />
                  </td>
                  {/* WS Port */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-16" variant="text" />
                  </td>
                  {/* WS Path */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-12" variant="text" />
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6" variant="button" />
                      <Skeleton className="h-6 w-6" variant="button" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServersPageSkeleton;
