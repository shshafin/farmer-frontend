import config from "../../config";
import { getToken } from "@/utils/Auth";

export const baseApi = config.url;
// Generic request function
export const request = async (endpoint, options = {}) => {
  const baseUrl = config.backendUrl;
  const token = getToken();

  // FormData হলে Content-Type remove কর
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(baseUrl + endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) throw data;

  return data;
};
