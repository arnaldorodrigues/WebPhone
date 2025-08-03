'use client'

import { useAuth } from "@/contexts/AuthContext";
import { IAdminDashboardData } from "@/core/admin/model";
import { getAdminDashboardData } from "@/core/admin/requests";
import { CheckCircleIcon, DevicePhoneMobileIcon, SignalIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState<IAdminDashboardData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getData = async () => {
    try {
      setIsLoading(true);
      const res: any = await getAdminDashboardData();
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [])

  return (
    <div className="p-10">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {user?.userName}
        </h3>
        <p className="text-gray-500">
          Here&apos;s what&apos;s happening with your admin panel today.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ?
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-xl bg-gray-200 shadow-lg">
                    <div className="w-7 h-7 bg-gray-300 rounded"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <UserGroupIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-gray-900 tracking-tight">
                        {dashboardData?.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <CheckCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Active Users
                      </p>
                      <p className="text-3xl font-bold text-gray-900 tracking-tight">
                        {dashboardData?.activeUsers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <DevicePhoneMobileIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Total Extensions
                      </p>
                      <p className="text-3xl font-bold text-gray-900 tracking-tight">
                        {dashboardData?.extensionNumbers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <SignalIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Active Extensions
                      </p>
                      <p className="text-3xl font-bold text-gray-900 tracking-tight">
                        {dashboardData?.extensionNumbers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        }
      </div>
    </div>
  )
}

export default AdminDashboard;