const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3002/api";
const HOST_BASE_URL =
  import.meta.env.VITE_HOST_BASE_URL ||
  API_BASE_URL.replace(/\/api\/?$/, "");

export const resolveStoreImageUrl = (url) => {
  if (typeof url !== "string" || !url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).pathname.startsWith("/uploads/")
        ? url
        : null;
    } catch {
      return null;
    }
  }

  return url.startsWith("/uploads/")
    ? `${HOST_BASE_URL}${url}`
    : null;
};

const fetchStoreData = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load store data.");
  }

  return result.data || [];
};

export const fetchStoreCategories = () =>
  fetchStoreData("/categories");

export const fetchStoreBrands = () =>
  fetchStoreData("/brands");

export const fetchStoreProducts = () =>
  fetchStoreData("/shop");
