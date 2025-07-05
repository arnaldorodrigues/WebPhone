'use client'

import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-10">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {user?.userName}
        </h3>
        <p className="text-gray-500">
          Here's what's happening with your admin panel today.
        </p>
      </div>
      
    </div>
  )
}

export default AdminDashboard;