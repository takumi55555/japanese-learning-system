import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Youtube,
  ClipboardList,
  Cog,
  BookOpen,
  FilePlus,
  Bell,
  Sparkles,
} from "lucide-react";
import {
  getStoredUser,
  isAuthenticated,
  getAuthToken,
} from "../../api/auth/authService";
import type { User as AuthUser } from "../../api/auth/authService";
import { BossLayout } from "../../components/layout/AdminLayout";
import { getApiUrl } from "../../utils/apiConfig";

interface DashboardStats {
  totalStudents: number;
  totalMaterials: number;
  totalQuestions: number;
  totalExams: number;
  recentExams: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalMaterials: 0,
    totalQuestions: 0,
    totalExams: 0,
    recentExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Get user data
    const userData = getStoredUser();
    if (userData) {
      // Check if user is admin
      if (userData.role !== "admin") {
        navigate("/");
        return;
      }
      setUser(userData);
      fetchDashboardStats();
    } else {
      // If no user data, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const token = getAuthToken();

      // Fetch students count
      const studentsRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const studentsData = await studentsRes.json();
      interface ApiUser {
        role: string;
      }
      const studentCount =
        studentsData.data?.filter((u: ApiUser) => u.role === "student")
          .length || 0;

      // Fetch materials count
      const materialsRes = await fetch(`${API_URL}/api/materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const materialsData = await materialsRes.json();
      const materialCount = materialsData.materials?.length || 0;

      // Fetch questions count
      const questionsRes = await fetch(`${API_URL}/api/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const questionsData = await questionsRes.json();
      const questionCount = questionsData.questions?.length || 0;

      // Fetch exam histories count
      const examsRes = await fetch(`${API_URL}/api/exam/admin/histories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const examsData = await examsRes.json();
      const examCount = examsData.examHistories?.length || 0;

      // Calculate recent exams (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      interface ExamHistory {
        submittedAt: string | Date;
      }
      const recentExamCount =
        examsData.examHistories?.filter((exam: ExamHistory) => {
          const examDate = new Date(exam.submittedAt);
          return examDate >= sevenDaysAgo;
        }).length || 0;

      setStats({
        totalStudents: studentCount,
        totalMaterials: materialCount,
        totalQuestions: questionCount,
        totalExams: examCount,
        recentExams: recentExamCount,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <BossLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ようこそ、
              <span className="text-primary-600">
                {user.username || user.id}
              </span>
              さん！
            </h2>
            <div className="h-0.5 w-16 bg-primary-500 mb-3"></div>
            <p className="text-sm md:text-base text-gray-600">
              学ぼう国際研修センター オンライン講習システム 管理ダッシュボード
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-2">登録学生数</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {loading ? (
                "..."
              ) : (
                <span className="text-primary-600">{stats.totalStudents}</span>
              )}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Youtube className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-2">教材数</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {loading ? (
                "..."
              ) : (
                <span className="text-blue-600">{stats.totalMaterials}</span>
              )}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-2">試験問題数</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {loading ? (
                "..."
              ) : (
                <span className="text-green-600">{stats.totalQuestions}</span>
              )}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-2">試験実施数</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {loading ? (
                "..."
              ) : (
                <span className="text-purple-600">{stats.totalExams}</span>
              )}
            </p>
            {stats.recentExams > 0 && (
              <p className="text-xs text-gray-400">
                直近7日:{" "}
                <span className="text-primary-600 font-semibold">
                  {stats.recentExams}
                </span>
                件
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <div className="bg-primary-50 rounded-lg p-4 mb-5 border border-primary-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                管理メニュー
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1 ml-7">
              各種管理機能にアクセスできます
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => navigate("/admin/student-management")}
              className="bg-white border border-primary-200 rounded-lg hover:shadow-lg hover:border-primary-400 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary-500 p-3 rounded-lg mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  学生管理
                </h4>
                <p className="text-xs text-gray-600">
                  学生情報の登録・編集・削除
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/material-management")}
              className="bg-white border border-blue-200 rounded-lg hover:shadow-lg hover:border-blue-400 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-500 p-3 rounded-lg mb-3">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  教材管理
                </h4>
                <p className="text-xs text-gray-600">
                  動画教材のアップロード・管理
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/question-management")}
              className="bg-white border border-green-200 rounded-lg hover:shadow-lg hover:border-green-400 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-500 p-3 rounded-lg mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  試験問題管理
                </h4>
                <p className="text-xs text-gray-600">
                  既存問題の確認・編集・削除
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/question-management/create")}
              className="bg-white border border-purple-200 rounded-lg hover:shadow-lg hover:border-purple-400 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-500 p-3 rounded-lg mb-3">
                  <FilePlus className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  試験問題作成
                </h4>
                <p className="text-xs text-gray-600">新しい試験問題を作成</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/exam-management")}
              className="bg-white border border-indigo-200 rounded-lg hover:shadow-lg hover:border-indigo-400 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-indigo-500 p-3 rounded-lg mb-3">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  試験管理
                </h4>
                <p className="text-xs text-gray-600">試験履歴・結果の確認</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/exam-settings")}
              className="bg-white border border-gray-300 rounded-lg hover:shadow-lg hover:border-gray-500 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-600 p-3 rounded-lg mb-3">
                  <Cog className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  試験設定
                </h4>
                <p className="text-xs text-gray-600">
                  試験時間・合格基準の設定
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="bg-white border border-yellow-300 rounded-lg hover:shadow-lg hover:border-yellow-500 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-yellow-500 p-3 rounded-lg mb-3">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  通知管理
                </h4>
                <p className="text-xs text-gray-600">学生への通知送信</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/group-admin-management")}
              className="bg-white border border-teal-300 rounded-lg hover:shadow-lg hover:border-teal-500 transition-all p-4 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-teal-500 p-3 rounded-lg mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  グループ管理者管理
                </h4>
                <p className="text-xs text-gray-600">
                  グループ管理者とチケット情報
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            システムについて
          </h3>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            学ぼう国際研修センター
            オンライン講習システムの管理画面です。左側のメニューから各機能にアクセスできます。
          </p>
        </div>
      </div>
    </BossLayout>
  );
};

export default AdminDashboard;
