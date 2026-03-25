import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Trash2,
  Eye,
  Search,
  XCircle,
  CheckCircle,
  UserCheck,
  UserX,
  Award,
  Loader2,
} from "lucide-react";
import { BossLayout } from "../../components/layout/AdminLayout";
import { getApiUrl, getFileUrl } from "../../utils/apiConfig";
import { Breadcrumb } from "../../components/atom/Breadcrumb";
import { Pagination } from "../../components/atom/Pagination";
import {
  getAuthToken,
  isAuthenticated,
  getStoredUser,
} from "../../api/auth/authService";
import { useToast } from "../../hooks/useToast";

interface UserProfile {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  gender: string;
  birthday: string;
  joinedDate: string;
  lastLogin: string;
  courses: Array<{
    courseId: string;
    courseName: string;
    studentId: string;
    status: string;
    enrollmentAt: string;
    completedAt?: string;
  }>;
  isBlocked: boolean;
  // Group admin specific fields
  group_id?: string;
  companyName?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressOther?: string;
  ticketCount?: number; // Total number of tickets for group admin
}

interface UserWithExamStatus extends UserProfile {
  hasPassedExam?: boolean;
}

export const StudentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserWithExamStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithExamStatus | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isIssuingCertificate, setIsIssuingCertificate] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "block";
    user: UserWithExamStatus;
    message: string;
  } | null>(null);
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "group_admin"
  >("all");
  const [sortField, setSortField] = useState<keyof UserWithExamStatus | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const checkExamStatus = async (userId: string): Promise<boolean> => {
    // Only check exam status for students
    try {
      const API_URL = getApiUrl();
      const token = getAuthToken();

      // Check if student has passed any exam by querying admin exam histories endpoint
      // Only check for passed exams (passed=true)
      const response = await fetch(
        `${API_URL}/api/exam/admin/histories?examineeId=${userId}&passed=true&limit=1`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Only return true if there is at least one passed exam
        return (
          data.examHistories &&
          Array.isArray(data.examHistories) &&
          data.examHistories.length > 0 &&
          data.examHistories.some(
            (exam: { passed?: boolean }) => exam.passed === true
          )
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking exam status:", error);
      return false;
    }
  };

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter students and group admins (exclude admin users)
        const userProfiles =
          data.data?.filter(
            (user: Record<string, unknown>) =>
              user.role === "student" || user.role === "group_admin"
          ) || [];

        // Fetch ticket counts for group admins
        const groupAdminIds = userProfiles
          .filter((u: UserProfile) => u.role === "group_admin")
          .map((u: UserProfile) => u.userId);

        const ticketCountsMap: { [key: string]: number } = {};
        if (groupAdminIds.length > 0) {
          try {
            const groupAdminsResponse = await fetch(
              `${API_URL}/api/group-admin/admin/all`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (groupAdminsResponse.ok) {
              const groupAdminsData = await groupAdminsResponse.json();
              if (groupAdminsData.success && groupAdminsData.groupAdmins) {
                groupAdminsData.groupAdmins.forEach(
                  (admin: {
                    groupAdminId: string;
                    stats?: { totalTickets?: number };
                  }) => {
                    const totalTickets = admin.stats?.totalTickets || 0;
                    ticketCountsMap[admin.groupAdminId] = totalTickets;
                  }
                );
              }
            }
          } catch (error) {
            console.error("Error fetching ticket counts:", error);
          }
        }

        // Check exam status for each student (only for students) and add ticket counts for group admins
        const usersWithExamStatus = await Promise.all(
          userProfiles.map(async (user: UserProfile) => {
            if (user.role === "student") {
              const hasPassedExam = await checkExamStatus(user.userId);
              return { ...user, hasPassedExam };
            } else if (user.role === "group_admin") {
              return {
                ...user,
                ticketCount: ticketCountsMap[user.userId] || 0,
              };
            }
            return { ...user };
          })
        );

        setUsers(usersWithExamStatus);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication and admin role
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [navigate, fetchUsers]);

  // Handle URL parameter for userId
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && users.length > 0) {
      const user = users.find((u) => u.userId === userId);
      if (user) {
        setSelectedUser(user);
        setShowDetailModal(true);
        // Remove userId from URL
        navigate("/student-management", { replace: true });
      }
    }
  }, [searchParams, users, navigate]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // name field removed - use username instead
      (user.companyName &&
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (!sortField) return 0;

      const aValue = a[sortField as keyof UserWithExamStatus];
      const bValue = b[sortField as keyof UserWithExamStatus];

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue
          .toLowerCase()
          .localeCompare(bValue.toLowerCase());
        return sortDirection === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        const comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Handle dates
      if (aValue && bValue) {
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        const comparison = dateA.getTime() - dateB.getTime();
        return sortDirection === "asc" ? comparison : -comparison;
      }

      return 0;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedUsers.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pagedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  // Adjust page if it exceeds total pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleSort = (field: keyof UserProfile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = (user: UserProfile) => {
    setConfirmAction({
      type: "delete",
      user,
      message: `${user.username}を削除しますか？この操作は取り消せません。`,
    });
    setShowConfirmModal(true);
  };

  const handleBlock = (user: UserProfile) => {
    const action = user.isBlocked ? "ブロック解除" : "ブロック";
    setConfirmAction({
      type: "block",
      user,
      message: `${user.username}を${action}しますか？`,
    });
    setShowConfirmModal(true);
  };

  const handleDetail = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleIssueCertificate = async () => {
    if (!selectedUser || selectedUser.role !== "student") return;

    setIsIssuingCertificate(true);

    try {
      const API_URL = getApiUrl();
      const token = getAuthToken();

      // Get course dates
      const firstPurchaseDate =
        selectedUser.courses && selectedUser.courses.length > 0
          ? (() => {
              const sorted = [...selectedUser.courses].sort(
                (a, b) =>
                  new Date(a.enrollmentAt).getTime() -
                  new Date(b.enrollmentAt).getTime()
              );
              return sorted[0].enrollmentAt;
            })()
          : null;

      const lastCompletionDate =
        selectedUser.courses && selectedUser.courses.length > 0
          ? (() => {
              const completedCourses = selectedUser.courses.filter(
                (c) => c.status === "completed" && c.completedAt
              );
              if (completedCourses.length > 0) {
                const sorted = [...completedCourses].sort(
                  (a, b) =>
                    new Date(b.completedAt || 0).getTime() -
                    new Date(a.completedAt || 0).getTime()
                );
                return sorted[0].completedAt!;
              }
              return null;
            })()
          : null;

      const response = await fetch(`${API_URL}/api/admin/certificate/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.userId,
          firstCoursePurchaseDate: firstPurchaseDate,
          lastCourseCompletionDate: lastCompletionDate,
        }),
      });

      if (response.ok) {
        showToast({
          type: "success",
          title: "成功",
          message: "修了証を発行しました。受講生に通知が送信されました。",
          duration: 3000,
        });
        setShowDetailModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to issue certificate");
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      showToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error
            ? error.message
            : "修了証発行リクエストの送信に失敗しました",
        duration: 3000,
      });
    } finally {
      setIsIssuingCertificate(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    const { type, user } = confirmAction;

    try {
      const API_URL = getApiUrl();
      const token = getAuthToken();

      if (type === "delete") {
        // Check if deleting a group admin
        if (user.role === "group_admin") {
          const response = await fetch(
            `${API_URL}/api/group-admin/admin/${user.userId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            showToast({
              type: "success",
              title: "削除完了",
              message: `${user.username}を削除しました`,
              duration: 2000,
            });
            fetchUsers();
          } else {
            throw new Error("Failed to delete group admin");
          }
        } else {
          const response = await fetch(
            `${API_URL}/api/admin/users/${user.userId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            showToast({
              type: "success",
              title: "削除完了",
              message: `${user.username}を削除しました`,
              duration: 2000,
            });
            fetchUsers();
          } else {
            throw new Error("Failed to delete user");
          }
        }
      } else if (type === "block") {
        const response = await fetch(
          `${API_URL}/api/admin/users/${user.userId}/block`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isBlocked: !user.isBlocked }),
          }
        );

        if (response.ok) {
          const action = user.isBlocked ? "ブロック解除" : "ブロック";
          showToast({
            type: "success",
            title: "更新完了",
            message: `${user.username}を${action}しました`,
            duration: 2000,
          });
          fetchUsers();
        } else {
          throw new Error(
            `Failed to ${user.isBlocked ? "unblock" : "block"} user`
          );
        }
      }
    } catch {
      const action =
        confirmAction.type === "delete"
          ? "削除"
          : confirmAction.user.isBlocked
          ? "ブロック解除"
          : "ブロック";
      showToast({
        type: "error",
        title: "エラー",
        message: `ユーザーの${action}に失敗しました`,
        duration: 3000,
      });
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  if (loading) {
    return (
      <BossLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">ユーザーデータを読み込み中...</p>
          </div>
        </div>
      </BossLayout>
    );
  }

  return (
    <BossLayout>
      <div className="p-3 md:p-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "ユーザー管理" }]} />

        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-2">
            ユーザー管理
          </h2>
          <p className="text-xs md:text-base text-slate-600">
            登録されているユーザー（学生・グループ管理者）の情報を管理できます (
            {users.length} 名)
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="ユーザー名、メールアドレスで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              フィルター:
            </label>
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value as "all" | "student" | "group_admin"
                )
              }
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="all">すべて</option>
              <option value="student">学生</option>
              <option value="group_admin">グループ管理者</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto -mx-3 md:-mx-6 px-3 md:px-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-[1000px] w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "username"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("username")}
                    >
                      ユーザー情報
                    </th>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "role"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("role")}
                    >
                      ロール
                    </th>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "email"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("email")}
                    >
                      連絡先
                    </th>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "companyName"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("companyName")}
                    >
                      申請会社名
                    </th>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "joinedDate"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("joinedDate")}
                    >
                      登録日
                    </th>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "lastLogin"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("lastLogin")}
                    >
                      最終ログイン
                    </th>
                    <th
                      className={`px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        sortField === "isBlocked"
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700 hover:text-primary-600"
                      }`}
                      onClick={() => handleSort("isBlocked")}
                    >
                      ステータス
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-gray-700 whitespace-nowrap">
                      アクション
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center justify-start space-x-2 md:space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src={
                              user.avatar
                                ? `${
                                    import.meta.env.VITE_API_URL || getApiUrl()
                                  }${user.avatar}`
                                : "/img/default_avatar.png"
                            }
                            alt={user.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/img/default_avatar.png";
                            }}
                          />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-medium text-slate-800 text-xs md:text-sm truncate">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          user.role === "group_admin"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "group_admin"
                          ? "グループ管理者"
                          : "学生"}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <div className="text-xs md:text-sm text-slate-800 whitespace-nowrap">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-xs md:text-sm text-slate-500 whitespace-nowrap">
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-slate-600 whitespace-nowrap">
                      {user.role === "group_admin"
                        ? user.companyName || "未設定"
                        : "-"}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(user.joinedDate)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-slate-600 whitespace-nowrap">
                      {user.lastLogin
                        ? formatDate(user.lastLogin)
                        : "未ログイン"}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          user.isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.isBlocked ? (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            ブロック済み
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            アクティブ
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <div className="flex items-center justify-center space-x-1 md:space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleDetail(user)}
                          className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="詳細表示"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        {user.role === "student" && user.hasPassedExam && (
                          <button
                            onClick={() => handleDetail(user)}
                            className="p-1.5 md:p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                            title="修了証発行"
                          >
                            <Award className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleBlock(user)}
                          className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                            user.isBlocked
                              ? "text-green-600 hover:bg-green-100"
                              : "text-red-600 hover:bg-red-100"
                          }`}
                          title={user.isBlocked ? "ブロック解除" : "ブロック"}
                        >
                          {user.isBlocked ? (
                            <UserCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          ) : (
                            <UserX className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 md:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pagedUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      データを取得できませんでした
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </div>

        {/* User Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">詳細情報</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                    <img
                      src={
                        selectedUser.avatar
                          ? getFileUrl(selectedUser.avatar)
                          : "/img/default_avatar.png"
                      }
                      alt={selectedUser.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/img/default_avatar.png";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800">
                      {selectedUser.role === "group_admin"
                        ? selectedUser.username
                        : selectedUser.username}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        selectedUser.role === "group_admin"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedUser.role === "group_admin"
                        ? "グループ管理者"
                        : "学生"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      メールアドレス
                    </label>
                    <p className="text-slate-800">{selectedUser.email}</p>
                  </div>
                  {selectedUser.role === "group_admin" ? (
                    <>
                      {selectedUser.group_id && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            グループID
                          </label>
                          <p className="text-slate-800 font-semibold text-blue-600">
                            {selectedUser.group_id}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          申請会社名
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.companyName || "未設定"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          郵便番号
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.postalCode || "未設定"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          都道府県
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.prefecture || "未設定"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          市区町村
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.city || "未設定"}
                        </p>
                      </div>
                      {selectedUser.addressOther && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            住所その他
                          </label>
                          <p className="text-slate-800">
                            {selectedUser.addressOther}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          チケット数
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.ticketCount !== undefined
                            ? `${selectedUser.ticketCount}枚`
                            : "0枚"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          性別
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.gender || "男性"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          最初のコース購入日
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.courses &&
                          selectedUser.courses.length > 0
                            ? (() => {
                                const sortedByEnrollment = [
                                  ...selectedUser.courses,
                                ].sort(
                                  (a, b) =>
                                    new Date(a.enrollmentAt).getTime() -
                                    new Date(b.enrollmentAt).getTime()
                                );
                                return formatDate(
                                  sortedByEnrollment[0].enrollmentAt
                                );
                              })()
                            : "コース未購入"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          最後のコース完了日
                        </label>
                        <p className="text-slate-800">
                          {selectedUser.courses &&
                          selectedUser.courses.length > 0
                            ? (() => {
                                const completedCourses =
                                  selectedUser.courses.filter(
                                    (c: {
                                      status: string;
                                      completedAt?: string;
                                    }) =>
                                      c.status === "completed" && c.completedAt
                                  );
                                if (completedCourses.length > 0) {
                                  const sortedByCompletion = [
                                    ...completedCourses,
                                  ].sort(
                                    (a, b) =>
                                      new Date(b.completedAt || 0).getTime() -
                                      new Date(a.completedAt || 0).getTime()
                                  );
                                  return formatDate(
                                    sortedByCompletion[0].completedAt!
                                  );
                                }
                                return "コース未完了";
                              })()
                            : "コース未購入"}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      登録日
                    </label>
                    <p className="text-slate-800">
                      {formatDate(selectedUser.joinedDate)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  {selectedUser.role === "student" &&
                    selectedUser.hasPassedExam && (
                      <button
                        onClick={handleIssueCertificate}
                        disabled={isIssuingCertificate}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isIssuingCertificate ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>送信中...</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            <span>修了証発行</span>
                          </>
                        )}
                      </button>
                    )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && confirmAction && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div
                  className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                    confirmAction.type === "delete"
                      ? "bg-red-100"
                      : confirmAction.user.isBlocked
                      ? "bg-green-100"
                      : "bg-primary-100"
                  }`}
                >
                  {confirmAction.type === "delete" ? (
                    <Trash2 className="h-6 w-6 text-red-600" />
                  ) : confirmAction.user.isBlocked ? (
                    <UserCheck className="h-6 w-6 text-green-600" />
                  ) : (
                    <UserX className="h-6 w-6 text-primary-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {confirmAction.type === "delete"
                    ? "学生を削除"
                    : "学生をブロック"}
                </h3>
                <p className="text-slate-600 mb-6">{confirmAction.message}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={cancelAction}
                    className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={executeAction}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      confirmAction.type === "delete"
                        ? "bg-red-600 hover:bg-red-700"
                        : confirmAction.user.isBlocked
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {confirmAction.type === "delete"
                      ? "削除"
                      : confirmAction.user.isBlocked
                      ? "ブロック解除"
                      : "ブロック"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BossLayout>
  );
};

export default StudentManagement;
