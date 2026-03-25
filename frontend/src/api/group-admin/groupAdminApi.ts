import { apiSlice } from "../apiSlice";

export const groupAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create ticket payment session
    createTicketPaymentSession: builder.mutation<
      {
        success: boolean;
        sessionUrl: string;
        sessionId: string;
      },
      { courseId: string; ticketCount: number }
    >({
      query: (data) => ({
        url: "/api/group-admin/create-ticket-session",
        method: "POST",
        body: data,
      }),
    }),

    // Handle ticket purchase success
    handleTicketPurchaseSuccess: builder.mutation<
      {
        success: boolean;
        message: string;
        tickets: Array<{
          ticketId: string;
          loginId: string;
          password: string;
          status: string;
        }>;
        ticketGroupId: string;
        courseId: string;
        courseName: string;
      },
      { sessionId: string }
    >({
      query: (data) => ({
        url: "/api/group-admin/ticket-purchase-success",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GroupAdmin"],
    }),

    // Get all ticket groups
    getTicketGroups: builder.query<
      {
        success: boolean;
        ticketGroups: Array<{
          id: string;
          courseId: string;
          courseName: string;
          ticketCount: number;
          usedCount: number;
          unusedCount: number;
          purchaseDate: string;
          status: string;
          tickets: Array<{
            ticketId: string;
            loginId: string;
            password: string;
            status: string;
            usedBy?: string;
            usedAt?: string;
            studentInfo?: {
              name?: string;
              birthday?: string;
              email?: string;
            };
          }>;
        }>;
      },
      void
    >({
      query: () => "/api/group-admin/ticket-groups",
      providesTags: ["GroupAdmin"],
    }),

    // Get ticket group details
    getTicketGroupDetails: builder.query<
      {
        success: boolean;
        ticketGroup: {
          id: string;
          courseId: string;
          courseName: string;
          ticketCount: number;
          tickets: Array<{
            ticketId: string;
            loginId: string;
            password: string;
            status: string;
            usedBy?: string;
            usedAt?: string;
            studentInfo?: {
              name?: string;
              birthday?: string;
              email?: string;
            };
          }>;
          purchaseDate: string;
          status: string;
        };
      },
      string
    >({
      query: (groupId) => `/api/group-admin/ticket-groups/${groupId}`,
      providesTags: ["GroupAdmin"],
    }),

    // Get dashboard statistics
    getDashboardStats: builder.query<
      {
        success: boolean;
        stats: {
          totalTickets: number;
          usedTickets: number;
          unusedTickets: number;
          totalSpent: number;
          totalPurchases: number;
        };
      },
      void
    >({
      query: () => "/api/group-admin/ticket-sale-stats",
      providesTags: ["GroupAdmin"],
    }),

    // Assign student information to tickets
    assignStudentInfo: builder.mutation<
      {
        success: boolean;
        message: string;
        updatedCount: number;
        errors?: string[];
      },
      {
        ticketIds: string[];
        studentInfo: {
          name: string;
          birthday?: string;
          email: string;
          faceDescriptor?: number[];
        };
      }
    >({
      query: (data) => ({
        url: "/api/group-admin/assign-student-info",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GroupAdmin"],
    }),

    // Get students who used tickets purchased by group admin
    getGroupAdminStudents: builder.query<
      {
        success: boolean;
        students: Array<{
          ticketId: string;
          loginId: string;
          password: string;
          status: string;
          usedAt?: string;
          usedBy?: string;
          studentInfo: {
            name?: string;
            birthday?: string;
            email?: string;
          };
          courseId: string;
          courseName: string;
          purchaseDate: string;
        }>;
        total: number;
      },
      void
    >({
      query: () => "/api/group-admin/students",
      providesTags: ["GroupAdmin"],
    }),
  }),
});

export const {
  useCreateTicketPaymentSessionMutation,
  useHandleTicketPurchaseSuccessMutation,
  useGetTicketGroupsQuery,
  useGetTicketGroupDetailsQuery,
  useGetDashboardStatsQuery,
  useAssignStudentInfoMutation,
  useGetGroupAdminStudentsQuery,
} = groupAdminApi;
