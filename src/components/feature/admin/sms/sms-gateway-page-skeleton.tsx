import Skeleton from "@/components/ui/skeleton/skeleton";

const SmsGatewayPageSkeleton = () => {
  return (
    <div className="p-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Skeleton className="h-10 w-full" variant="button" />
        </div>

        <Skeleton className="h-10 w-24" variant="button" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
          >
            <Skeleton className="h-4 w-20 mb-2" variant="text" />
            <Skeleton className="h-8 w-16" variant="text" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-24" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-16" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-32" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-20" variant="text" />
                </th>
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-16" variant="text" />
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton
                        className="h-10 w-10 flex-shrink-0"
                        variant="circle"
                      />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-32 mb-1" variant="text" />
                        <Skeleton className="h-3 w-24" variant="text" />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-40" variant="text" />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" variant="text" />
                  </td>

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

      <div className="mt-4">
        <Skeleton className="h-4 w-48" variant="text" />
      </div>
    </div>
  );
};

export default SmsGatewayPageSkeleton;
