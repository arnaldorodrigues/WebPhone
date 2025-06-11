import Skeleton from "@/components/ui/skeleton/skeleton";

const UsersPageSkeleton = () => {
  return (
    <div className="p-6 w-full mx-auto">
      {/* Actions Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input Skeleton */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full" variant="button" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" variant="button" />
          <Skeleton className="h-10 w-32" variant="button" />
        </div>

        {/* Add User Button Skeleton */}
        <Skeleton className="h-10 w-24" variant="button" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
          >
            <Skeleton className="h-4 w-20 mb-2" variant="text" />
            <Skeleton className="h-8 w-16" variant="text" />
          </div>
        ))}
      </div>

      {/* Users Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            {/* Table Header Skeleton */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-12" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-10" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-12" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-24" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-16" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-16" variant="text" />
                </th>
              </tr>
            </thead>

            {/* Table Body Skeleton */}
            <tbody className="bg-white divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {/* User Info Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton
                        className="h-10 w-10 flex-shrink-0"
                        variant="circle"
                      />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-32 mb-1" variant="text" />
                        <Skeleton className="h-3 w-40" variant="text" />
                      </div>
                    </div>
                  </td>

                  {/* Role Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>

                  {/* Status Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </td>

                  {/* Extension Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" variant="text" />
                  </td>

                  {/* Created Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" variant="text" />
                  </td>

                  {/* Actions Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6" variant="button" />
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

      {/* Results Summary Skeleton */}
      <div className="mt-4">
        <Skeleton className="h-4 w-48" variant="text" />
      </div>
    </div>
  );
};

export default UsersPageSkeleton;
