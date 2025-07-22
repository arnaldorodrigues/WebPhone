export const checkExtensionNumberIsRegister = async (extensionNumber: string) => {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_PBX_BACKEND_URL;

    if (!apiBaseUrl) return false;

    const response = await fetch(`${apiBaseUrl}/en/registered/${extensionNumber}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to check online status of extension number');
    }

    const data = await response.json();
    return data.data === '1';
  } catch (error) {
    console.error('Error checking online status of extension number:', error);
    return false;
  }
}