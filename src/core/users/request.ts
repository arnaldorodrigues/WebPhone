import { apiGet } from "@/lib/apiClient";

const USERS_GET_LIST = "/users";

export const getUsersList = async () => {
  try {
    const response = await apiGet(USERS_GET_LIST);

    if (response.success) {
      return response;
    }
  } catch (error) {
    console.error(error);
  }
}