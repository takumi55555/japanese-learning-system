/**
 * Get API URL
 * Priority: VITE_API_URL env var > development localhost > production domain
 */
export const getApiUrl = (): string => {
  // Check if we have an explicit API URL from environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development: use localhost backend
  if (import.meta.env.DEV) {
    return "http://localhost:4000";
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

