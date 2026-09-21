const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const HOST_BASE_URL = import.meta.env.VITE_HOST_BASE_URL;

export const resolveStoreImageUrl = (url) => {
  if (!url) return "";

  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  return `${HOST_BASE_URL}${url}`;
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
