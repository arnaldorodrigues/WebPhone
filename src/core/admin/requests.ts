import { apiGet } from "@/lib/apiClient"

const ADMIN_DASHBOARD_GET_DATA = "/admin/dashboard";

export const getAdminDashboardData = async () => {
  try {
    const response = await apiGet(ADMIN_DASHBOARD_GET_DATA);
    if (response.success)
      return response;
    else
      throw new Error('Failed to fetch Dashboard Data');
  } catch (error) {
    console.error(error);
  }
}