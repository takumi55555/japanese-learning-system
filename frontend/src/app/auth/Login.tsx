import React, { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "../../api/auth/authApiSlice";
import { useData } from "../../context/DataContext";
import { useToast } from "../../hooks/useToast";
import { getApiUrl } from "../../utils/apiConfig";
import { getAuthToken } from "../../api/auth/authService";

interface LoginProps {
  onLoginSuccess?: (userId: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshData } = useData();
  const { showToast } = useToast();

  // Load saved ID from localStorage if exists
  const savedId = localStorage.getItem("rememberedLoginId") || "";

  const [formData, setFormData] = useState({
    id: savedId,
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(!!savedId);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect info from location state (for payment flow)
  const course = location.state?.course;

  // RTK Query mutation
  const [loginMutation, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.id.trim()) {
      showToast({
        type: "error",
        title: "入力エラー",
        message: "メールアドレスまたはIDを入力してください",
        duration: 3000,
      });
      return;
    }

    if (!formData.password) {
      showToast({
        type: "error",
        title: "入力エラー",
        message: "パスワードを入力してください",
        duration: 3000,
      });
      return;
    }

    try {
      // Call login API using RTK Query
      const data = await loginMutation({
        id: formData.id,
        password: formData.password,
      }).unwrap();

      // Token and user are automatically stored in authApiSlice

      // Handle rememberMe functionality
      if (rememberMe) {
        // Save login ID to localStorage
        localStorage.setItem("rememberedLoginId", formData.id);
      } else {
        // Remove saved login ID if rememberMe is unchecked
        localStorage.removeItem("rememberedLoginId");
      }

      // If group admin, fetch and store profile info
      if (data.user?.role === "group_admin") {
        try {
          const API_URL = getApiUrl();
          const token = getAuthToken();

          const profileResponse = await fetch(`${API_URL}/api/profile`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.profile) {
              // Store group admin profile info in localStorage
              // Include all group admin fields: username, group_id, companyName, postalCode, prefecture, city, addressOther
              const groupAdminProfile = {
                ...profileData.profile,
                username: profileData.profile.username || "",
                group_id: profileData.profile.group_id || "",
                companyName: profileData.profile.companyName || "",
                postalCode: profileData.profile.postalCode || "",
                prefecture: profileData.profile.prefecture || "",
                city: profileData.profile.city || "",
                addressOther: profileData.profile.addressOther || "",
              };
              localStorage.setItem(
                "groupAdminProfile",
                JSON.stringify(groupAdminProfile)
              );
            }
          }
        } catch (error) {
          console.error("Error fetching group admin profile:", error);
          // Don't block login if profile fetch fails
        }
      }

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user?.id || formData.id);
      }

      // Refresh all data after successful login
      await refreshData();

      // Show success toast - use username for students
      const displayName = data.user?.username || data.user?.email || formData.id;
      showToast({
        type: "success",
        title: "ログインしました！",
        message: `ようこそ、${displayName}さん`,
        duration: 3000,
      });

      // Navigate based on redirect path or user role
      if (course) {
        // If coming from payment page, redirect back to payment with course data
        navigate("/payment", { state: { course: course }, replace: true });
      } else if (data.user?.role === "admin") {
        // Admin goes to admin dashboard
        navigate("/admin", { replace: true });
      } else {
        // Group administrators and students go to homepage
        navigate("/", { replace: true });
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "ログインに失敗しました。もう一度お試しください。";
      showToast({
        type: "error",
        title: "ログインエラー",
        message: message,
        duration: 5000,
      });
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient and decorative elements - matching the image */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600">
        {/* Decorative mountain shapes - more like the image */}
        <div className="absolute bottom-0 left-0 w-full h-1/2">
          <div className="absolute bottom-0 left-0 w-80 h-40 bg-primary-300/20 transform -skew-y-12"></div>
          <div className="absolute bottom-0 right-0 w-96 h-32 bg-primary-400/25 transform skew-y-6"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-24 bg-primary-200/15 transform -skew-y-8"></div>
          <div className="absolute bottom-0 right-1/3 w-72 h-28 bg-primary-300/18 transform skew-y-4"></div>
        </div>

        {/* Decorative dots - more scattered like the image */}
        <div className="absolute top-16 left-16 w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-24 right-24 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
        <div className="absolute top-40 left-1/4 w-1 h-1 bg-white/35 rounded-full"></div>
        <div className="absolute top-56 right-1/3 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
        <div className="absolute top-72 left-1/2 w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-88 right-1/4 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white/35 rounded-full"></div>
        <div className="absolute bottom-56 right-16 w-1 h-1 bg-white/25 rounded-full"></div>
        <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute bottom-48 right-1/2 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* Left Side - Welcome Content - Hidden on mobile, tablet (md), shown on lg+ */}
          <div className="hidden lg:block text-white space-y-6 lg:space-y-8 xl:space-y-10 order-2 lg:order-1">
            {/* Logo */}
            <div className="mb-4 lg:mb-6 xl:mb-8">
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white">
                学ぼう国際研修センター
              </h1>
            </div>

            {/* Welcome Text - matching image style */}
            <div className="space-y-4 lg:space-y-6 xl:space-y-8">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight">
                <span className="block font-serif italic text-white mb-2">
                  ようこそ
                </span>
                <span className="block font-bold text-white">
                  ウェブサイトへ
                </span>
              </h2>

              <p className="text-base lg:text-lg xl:text-xl text-primary-100 leading-relaxed max-w-xl">
                日本語学習の新しい体験へようこそ。私たちのオンラインプラットフォームで、効果的で楽しい日本語学習を始めましょう。初心者から上級者まで、あなたのレベルに合わせた最適なコースをご提供します。
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2 w-full">
            <div className="w-full max-w-md">
              {/* Login Form Panel - Clean Design */}
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                {/* Mobile-only header */}
                <div className="sm:hidden mb-6 text-center">
                  <h1 className="text-lg font-semibold text-gray-900">
                    学ぼう国際研修センター
                  </h1>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                  ユーザーログイン
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email/ID Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="id"
                      name="id"
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base bg-gray-50 focus:bg-white"
                      placeholder="メールアドレス、グループID または ID"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field with Eye Icon */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base bg-gray-50 focus:bg-white"
                      placeholder="パスワード"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Options Row */}
                  <div className="flex items-center justify-start">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer transition-colors"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        記憶する
                      </span>
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-500 text-white py-3.5 px-6 rounded-lg font-medium text-base hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? "ログイン中..." : "ログイン"}
                  </button>

                  {/* Go Back Button */}
                  <button
                    type="button"
                    onClick={handleGoBack}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>最初のページに戻る</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
