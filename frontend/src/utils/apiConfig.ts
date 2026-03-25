/**
 * Get API URL - Production only
 * Returns: https://manabou.co.jp
 */
export const getApiUrl = (): string => {
  // Check if we have an explicit API URL from environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Production: use HTTPS domain
  return "https://manabou.co.jp";
};

/**
 * Get file URL for static assets
 */
export const getFileUrl = (relativePath: string): string => {
  const apiUrl = getApiUrl();
  // Remove trailing slash from apiUrl if present
  const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  // Ensure relativePath starts with /
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${baseUrl}${path}`;
};

