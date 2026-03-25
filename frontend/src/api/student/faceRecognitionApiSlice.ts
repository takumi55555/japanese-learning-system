import { apiSlice } from "../apiSlice";

export interface FaceDataResponse {
  success: boolean;
  data?: {
    faceId: string;
    descriptor: number[];
    imageData?: string;
    registeredAt: string;
    lastVerifiedAt?: string;
    verificationCount: number;
    failedVerificationCount: number;
  };
  message?: string;
}

export interface RegisterFaceRequest {
  descriptor: number[];
  imageData?: string;
}

export interface VerifyFaceRequest {
  descriptor: number[];
  similarity: number;
}

export interface VerifyFaceResponse {
  success: boolean;
  verified: boolean;
  similarity: number;
  message: string;
}

export const faceRecognitionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerFace: builder.mutation<FaceDataResponse, RegisterFaceRequest>({
      query: (data) => ({
        url: "/api/face-recognition/register",
        method: "POST",
        body: data,
      }),
    }),
    getFaceData: builder.query<FaceDataResponse, void>({
      query: () => "/api/face-recognition/data",
    }),
    verifyFace: builder.mutation<VerifyFaceResponse, VerifyFaceRequest>({
      query: (data) => ({
        url: "/api/face-recognition/verify",
        method: "POST",
        body: data,
      }),
    }),
    deleteFaceData: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/api/face-recognition/data",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useRegisterFaceMutation,
  useGetFaceDataQuery,
  useLazyGetFaceDataQuery,
  useVerifyFaceMutation,
  useDeleteFaceDataMutation,
} = faceRecognitionApiSlice;


