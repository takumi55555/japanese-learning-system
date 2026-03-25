import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../utils/apiConfig";

const API_URL = getApiUrl();

// Base API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Profile",
    "Auth",
    "Payment",
    "Students",
    "Notifications",
    "Certificate",
    "GroupAdmin",
  ],
  endpoints: () => ({}),
});
