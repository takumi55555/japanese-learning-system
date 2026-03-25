import { apiSlice } from "../apiSlice";
import { getApiUrl } from "../../utils/apiConfig";

export interface Certificate {
  _id: string;
  userId: string;
  certificateNumber: string;
  name: string;
  gender: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  issuedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificateResponse {
  success: boolean;
  data: Certificate;
  message?: string;
}

export const certificateApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCertificate: builder.query<Certificate | null, string>({
      // Handle 404 as a valid response (certificate doesn't exist)
      // 修了証は管理者が試験合格者にのみ発行するため、404は正常な動作
      async queryFn(arg) {
        try {
          const API_URL = getApiUrl();
          const token = localStorage.getItem("authToken");

          const response = await fetch(`${API_URL}/api/certificates/${arg}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });

          // 404は正常な動作（証明書が存在しない = 管理者が発行していない）
          if (response.status === 404) {
            return { data: null };
          }

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: "Unknown error" }));
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }

          const data: CertificateResponse = await response.json();
          return { data: data.data };
        } catch (error) {
          // Network errors or other exceptions
          console.error("Certificate fetch error:", error);
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Certificate"],
    }),
  }),
});

export const { useGetCertificateQuery } = certificateApiSlice;
