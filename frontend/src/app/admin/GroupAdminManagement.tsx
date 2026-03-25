import React, { useEffect, useState } from "react";
import {
  Users,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { BossLayout } from "../../components/layout/AdminLayout";
import { getAuthToken } from "../../api/auth/authService";
import { getApiUrl } from "../../utils/apiConfig";

interface TicketDetail {
  ticketId: string;
  loginId: string;
  password: string;
  status: string;
  usedAt?: string;
  usedBy?: string;
  courseName?: string;
}

interface Student {
  ticketId: string;
  loginId: string;
  password: string;
  courseName: string;
  usedAt: string;
  studentId: string;
}

interface TicketGroup {
  _id: string;
  courseId: string;
  courseName: string;
  ticketCount: number;
  purchaseDate: string;
  usedCount: number;
  unusedCount: number;
  tickets: TicketDetail[];
}

interface GroupAdminStats {
  totalTickets: number;
  usedTickets: number;
  unusedTickets: number;
  totalSpent: number;
  totalPurchases: number;
}

interface GroupAdmin {
  groupAdminId: string;
  username: string;
  email: string;
  groupId?: string;
  createdAt: string;
  stats: GroupAdminStats;
  ticketGroups: TicketGroup[];
  allTickets: TicketDetail[];
  students: Student[];
}

export const GroupAdminManagement: React.FC = () => {
  const [groupAdmins, setGroupAdmins] = useState<GroupAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<{
    [key: string]: "tickets" | "students" | "all" | null;
  }>({});
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchGroupAdmins();
  }, []);

  const fetchGroupAdmins = async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/group-admin/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setGroupAdmins(data.groupAdmins || []);
      } else {
        console.error("Failed to fetch group admins:", data.message);
      }
    } catch (error) {
      console.error("Error fetching group admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminExpand = (adminId: string) => {
    setExpandedAdmin(expandedAdmin === adminId ? null : adminId);
  };

  const toggleSection = (
    adminId: string,
    section: "tickets" | "students" | "all"
  ) => {
    setExpandedSection((prev) => ({
      ...prev,
      [adminId]: prev[adminId] === section ? null : section,
    }));
  };

  const togglePasswordVisibility = (ticketId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  };

  const handleDeleteClick = (adminId: string) => {
    setShowDeleteConfirm((prev) => ({
      ...prev,
      [adminId]: true,
    }));
  };

  const handleDeleteCancel = (adminId: string) => {
    setShowDeleteConfirm((prev) => {
      const newState = { ...prev };
      delete newState[adminId];
      return newState;
    });
  };

  const handleDeleteConfirm = async (adminId: string) => {
    try {
      setDeletingAdminId(adminId);
      const API_URL = getApiUrl();
      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/api/group-admin/admin/${adminId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setGroupAdmins((prev) =>
          prev.filter((admin) => admin.groupAdminId !== adminId)
        );
        setShowDeleteConfirm((prev) => {
          const newState = { ...prev };
          delete newState[adminId];
          return newState;
        });
        if (expandedAdmin === adminId) {
          setExpandedAdmin(null);
        }
      } else {
        alert(data.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("Error deleting group admin:", error);
      alert("削除中にエラーが発生しました");
    } finally {
      setDeletingAdminId(null);
    }
  };

  // Calculate overall statistics

  if (loading) {
    return (
      <BossLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-700 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">読み込み中...</p>
          </div>
        </div>
      </BossLayout>
    );
  }

  return (
    <BossLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2 tracking-wide">
              グループ管理者管理
            </h1>
            <p className="text-gray-600">
              グループ管理者とその購入チケット、学生情報を確認できます
            </p>
          </div>
        </div>

        {/* Group Admins List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            グループ管理者一覧
          </h2>

          {groupAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                グループ管理者が登録されていません
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupAdmins.map((admin) => (
                <div
                  key={admin.groupAdminId}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Admin Header */}
                  <div
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleAdminExpand(admin.groupAdminId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {admin.username}
                          </h3>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          {admin.groupId && (
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              グループID: {admin.groupId}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            登録日:{" "}
                            {new Date(admin.createdAt).toLocaleDateString(
                              "ja-JP"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="flex gap-4">
                            <div>
                              <p className="text-xs text-gray-500">チケット</p>
                              <p className="text-lg font-bold text-gray-900">
                                {admin.stats.totalTickets}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">使用済み</p>
                              <p className="text-lg font-bold text-green-600">
                                {admin.stats.usedTickets}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">売上</p>
                              <p className="text-lg font-bold text-primary-600">
                                ¥{admin.stats.totalSpent.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {showDeleteConfirm[admin.groupAdminId] ? (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1">
                              <span className="text-xs text-red-700 font-medium">
                                削除しますか？
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConfirm(admin.groupAdminId);
                                }}
                                disabled={
                                  deletingAdminId === admin.groupAdminId
                                }
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingAdminId === admin.groupAdminId
                                  ? "削除中..."
                                  : "削除"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCancel(admin.groupAdminId);
                                }}
                                disabled={
                                  deletingAdminId === admin.groupAdminId
                                }
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(admin.groupAdminId);
                              }}
                              disabled={deletingAdminId === admin.groupAdminId}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="グループ管理者を削除"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                          {expandedAdmin === admin.groupAdminId ? (
                            <ChevronUp size={24} className="text-gray-600" />
                          ) : (
                            <ChevronDown size={24} className="text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedAdmin === admin.groupAdminId && (
                    <div className="p-6 bg-white">
                      {/* Statistics */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">
                            総チケット
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {admin.stats.totalTickets}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">使用済み</p>
                          <p className="text-xl font-bold text-green-600">
                            {admin.stats.usedTickets}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">未使用</p>
                          <p className="text-xl font-bold text-blue-600">
                            {admin.stats.unusedTickets}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">購入回数</p>
                          <p className="text-xl font-bold text-purple-600">
                            {admin.stats.totalPurchases}
                          </p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">総支払額</p>
                          <p className="text-xl font-bold text-primary-600">
                            ¥{admin.stats.totalSpent.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Group Admin Login Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Users size={18} className="text-blue-600" />
                          グループ管理者ログイン情報
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium min-w-[100px]">
                              メール:
                            </span>
                            <code className="text-sm bg-white px-3 py-1 rounded border border-gray-300">
                              {admin.email}
                            </code>
                          </div>
                          {admin.groupId && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 font-medium min-w-[100px]">
                                グループID:
                              </span>
                              <code className="text-sm bg-white px-3 py-1 rounded border border-gray-300 text-blue-600 font-semibold">
                                {admin.groupId}
                              </code>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            ※
                            パスワードは購入時に生成され、グループ管理者に提供されています
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <button
                          onClick={() =>
                            toggleSection(admin.groupAdminId, "all")
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            expandedSection[admin.groupAdminId] === "all"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          全チケット ({admin.allTickets.length})
                        </button>
                        <button
                          onClick={() =>
                            toggleSection(admin.groupAdminId, "tickets")
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            expandedSection[admin.groupAdminId] === "tickets"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          購入履歴 ({admin.ticketGroups.length})
                        </button>
                        <button
                          onClick={() =>
                            toggleSection(admin.groupAdminId, "students")
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            expandedSection[admin.groupAdminId] === "students"
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          学生一覧 ({admin.students.length})
                        </button>
                      </div>

                      {/* All Tickets Section */}
                      {expandedSection[admin.groupAdminId] === "all" && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-4">
                            全チケットログイン情報
                          </h4>
                          {admin.allTickets.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              チケットがありません
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-300">
                                  <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      コース
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      ログインID
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      パスワード
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      ステータス
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      使用日
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {admin.allTickets.map((ticket) => (
                                    <tr
                                      key={ticket.ticketId}
                                      className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        {ticket.courseName || "不明"}
                                      </td>
                                      <td className="py-3 px-4">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {ticket.loginId}
                                        </code>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {showPasswords[ticket.ticketId]
                                              ? ticket.password
                                              : "●".repeat(
                                                  ticket.password.length
                                                )}
                                          </code>
                                          <button
                                            onClick={() =>
                                              togglePasswordVisibility(
                                                ticket.ticketId
                                              )
                                            }
                                            className="p-1 hover:bg-gray-100 rounded transition-all"
                                            title={
                                              showPasswords[ticket.ticketId]
                                                ? "パスワードを隠す"
                                                : "パスワードを表示"
                                            }
                                          >
                                            {showPasswords[ticket.ticketId] ? (
                                              <EyeOff
                                                size={16}
                                                className="text-gray-600"
                                              />
                                            ) : (
                                              <Eye
                                                size={16}
                                                className="text-gray-600"
                                              />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            ticket.status === "unused"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-green-100 text-green-700"
                                          }`}
                                        >
                                          {ticket.status === "unused"
                                            ? "未使用"
                                            : "使用済み"}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-600">
                                        {ticket.usedAt
                                          ? new Date(
                                              ticket.usedAt
                                            ).toLocaleDateString("ja-JP")
                                          : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ticket Groups Section */}
                      {expandedSection[admin.groupAdminId] === "tickets" && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-4">
                            購入チケット履歴
                          </h4>
                          {admin.ticketGroups.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              チケット購入履歴がありません
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {admin.ticketGroups.map((group) => (
                                <div
                                  key={group._id}
                                  className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {group.courseName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      購入日:{" "}
                                      {new Date(
                                        group.purchaseDate
                                      ).toLocaleDateString("ja-JP")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                      総数:{" "}
                                      <span className="font-semibold">
                                        {group.ticketCount}
                                      </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      使用:{" "}
                                      <span className="font-semibold text-green-600">
                                        {group.usedCount}
                                      </span>{" "}
                                      / 未使用:{" "}
                                      <span className="font-semibold text-blue-600">
                                        {group.unusedCount}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Students Section */}
                      {expandedSection[admin.groupAdminId] === "students" && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-4">
                            登録学生一覧（使用済みチケット）
                          </h4>
                          {admin.students.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              まだ学生が登録されていません
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-300">
                                  <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      ログインID
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      パスワード
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      コース名
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      使用日
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                      学生ID
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {admin.students.map((student) => (
                                    <tr
                                      key={student.ticketId}
                                      className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                      <td className="py-3 px-4">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {student.loginId}
                                        </code>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {showPasswords[student.ticketId]
                                              ? student.password
                                              : "●".repeat(
                                                  student.password.length
                                                )}
                                          </code>
                                          <button
                                            onClick={() =>
                                              togglePasswordVisibility(
                                                student.ticketId
                                              )
                                            }
                                            className="p-1 hover:bg-gray-100 rounded transition-all"
                                            title={
                                              showPasswords[student.ticketId]
                                                ? "パスワードを隠す"
                                                : "パスワードを表示"
                                            }
                                          >
                                            {showPasswords[student.ticketId] ? (
                                              <EyeOff
                                                size={16}
                                                className="text-gray-600"
                                              />
                                            ) : (
                                              <Eye
                                                size={16}
                                                className="text-gray-600"
                                              />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        {student.courseName}
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-600">
                                        {new Date(
                                          student.usedAt
                                        ).toLocaleDateString("ja-JP")}
                                      </td>
                                      <td className="py-3 px-4">
                                        <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                                          {student.studentId}
                                        </code>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BossLayout>
  );
};

export default GroupAdminManagement;
