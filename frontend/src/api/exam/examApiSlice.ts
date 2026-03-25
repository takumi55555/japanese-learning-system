import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "../auth/authService";
import { getApiUrl } from "../../utils/apiConfig";

const API_URL = getApiUrl();

export const examApiSlice = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/courses`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ExamEligibility"],
  endpoints: (builder) => ({
    getExamEligibility: builder.query({
      query: () => "/exam-eligibility",
      providesTags: ["ExamEligibility"],
    }),
    checkExamEligibility: builder.mutation({
      query: () => ({
        url: "/exam-eligibility/check",
        method: "POST",
      }),
      invalidatesTags: ["ExamEligibility"],
    }),
  }),
});

export const { useGetExamEligibilityQuery, useCheckExamEligibilityMutation } =
  examApiSlice;
