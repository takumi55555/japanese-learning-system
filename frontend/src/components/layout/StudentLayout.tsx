import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  ChevronDown,
  UserCircle,
  Settings,
  Lock,
  Home,
  FileText,
  Edit,
  HelpCircle,
  Menu,
  X,
  GraduationCap,
  LogIn,
  Users,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  logout,
  getAuthToken,
  isAuthenticated,
  getStoredUser,
} from "../../api/auth/authService";
import { getApiUrl } from "../../utils/apiConfig";
import { NotificationIcon } from "../atom/NotificationIcon";
import { useToast } from "../../hooks/useToast";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("/img/default_avatar.png");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { showToast } = useToast();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  const userIsAuthenticated = isAuthenticated();
  // Get user data to check role
  const user = getStoredUser();
  // Check if user is a student (only students should see exam link)
  const isStudent = userIsAuthenticated && user?.role === "student";
  // Check if user is a group admin (group admins should see dashboard link)
  const isGroupAdmin = userIsAuthenticated && user?.role === "group_admin";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user profile avatar and studentId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Set avatar
          if (data.profile?.avatar) {
            // Check if avatar is a data URL or server path
            const avatar = data.profile.avatar.startsWith("data:")
              ? data.profile.avatar
              : `${API_URL}${data.profile.avatar}`;
            setAvatarUrl(avatar);
          }
        }
      } catch {
        // Error fetching profile
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleExamClick = () => {
    // If not authenticated, redirect to login
    if (!userIsAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Always navigate to exam room
    // Eligibility check will be done when user clicks "Start Exam" button
    navigate("/exam-room");
  };

  const userMenuItems = [
    {
      id: "profile",
      label: "プロフィール",
      icon: UserCircle,
      action: () =>
        navigate(isGroupAdmin ? "/group-admin/profile" : "/profile"),
      danger: false,
    },
    {
      id: "privacy",
      label: "プライバシー",
      icon: Lock,
      // action: () => navigate("/privacy"),
      danger: false,
    },
    {
      id: "settings",
      label: "設定",
      icon: Settings,
      // action: () => navigate("/settings"),
      danger: false,
    },
    {
      id: "logout",
      label: "ログアウト",
      icon: LogOut,
      action: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Utility Bar */}
      <div className="bg-white border-b border-gray-200"></div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 min-w-0">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label="メニュー"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              {/* Logo - Hidden on mobile */}
              <button
                onClick={() => navigate("/")}
                className="hidden lg:flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <GraduationCap className="w-7 h-7 text-primary-600" />
                <span className="text-lg font-semibold text-slate-800">
                  学ぼう国際研修センター
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 whitespace-nowrap">
              <button
                className={`flex items-center space-x-2 font-medium transition-colors cursor-pointer text-base ${
                  location.pathname === "/"
                    ? "text-primary-500"
                    : "text-gray-800 hover:text-primary-500"
                }`}
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 text-gray-400" />
                <span>HOME</span>
              </button>
              {/* Show dashboard link only for authenticated group admins */}
              {isGroupAdmin && (
                <button
                  className={`flex items-center space-x-2 font-medium transition-colors cursor-pointer text-base ${
                    location.pathname === "/group-admin/ticket-sale"
                      ? "text-primary-500"
                      : "text-gray-800 hover:text-primary-500"
                  }`}
                  onClick={() => navigate("/group-admin/ticket-sale")}
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>受講者登録</span>
                </button>
              )}
              <button
                className={`flex items-center space-x-2 font-medium transition-colors cursor-pointer text-base ${
                  location.pathname === "/courses"
                    ? "text-primary-500"
                    : "text-gray-800 hover:text-primary-500"
                }`}
                onClick={() => navigate("/courses")}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                <span>講習内容と費用</span>
              </button>
              {/* Show exam room link only for authenticated students */}
              {isStudent && (
                <button
                  className={`flex items-center space-x-2 font-medium transition-colors cursor-pointer text-base ${
                    location.pathname === "/exam-room"
                      ? "text-primary-500"
                      : "text-gray-800 hover:text-primary-500"
                  }`}
                  onClick={handleExamClick}
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                  <span>試験ルーム</span>
                </button>
              )}
              <button
                className={`flex items-center space-x-2 font-medium transition-colors cursor-pointer text-base ${
                  location.pathname === "/help"
                    ? "text-primary-500"
                    : "text-gray-800 hover:text-primary-500"
                }`}
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                <span>ヘルプ</span>
              </button>
            </nav>

            {/* User Profile Dropdown or Login/Register Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {userIsAuthenticated ? (
                <>
                  {/* Notification Icon */}
                  <NotificationIcon />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-400">
                        <img
                          src={avatarUrl}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="py-1">
                          {userMenuItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.action) {
                                  item.action();
                                }
                                setShowUserDropdown(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors cursor-pointer ${
                                item.danger
                                  ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              } ${
                                !item.action
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label && <span>{item.label}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center space-x-2 px-5 py-2.5 text-base font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-full transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>ログイン</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-left ${
                  location.pathname === "/"
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  navigate("/");
                  setShowMobileMenu(false);
                }}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">HOME</span>
              </button>
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-left ${
                  location.pathname === "/courses"
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  navigate("/courses");
                  setShowMobileMenu(false);
                }}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">講習内容と費用</span>
              </button>
              {/* Show exam room link only for authenticated students */}
              {isStudent && (
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-left ${
                    location.pathname === "/exam-room"
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    handleExamClick();
                    setShowMobileMenu(false);
                  }}
                >
                  <Edit className="w-5 h-5" />
                  <span className="font-medium">試験ルーム</span>
                </button>
              )}
              {/* Show dashboard link only for authenticated group admins */}
              {isGroupAdmin && (
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-left ${
                    location.pathname === "/group-admin/ticket-sale"
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    navigate("/group-admin/ticket-sale");
                    setShowMobileMenu(false);
                  }}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">受講者登録</span>
                </button>
              )}
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-left ${
                  location.pathname === "/help"
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  navigate("/help");
                  setShowMobileMenu(false);
                }}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">ヘルプ</span>
              </button>

              {/* Login for non-authenticated users */}
              {!userIsAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors cursor-pointer font-medium"
                    onClick={() => {
                      navigate("/login");
                      setShowMobileMenu(false);
                    }}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>ログイン</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen">{children}</main>

      {/* Footer Section with Contact Form */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-300 mb-8 uppercase">
                お問い合わせ
              </h2>
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isSubmitting) return;

                  // Validate form
                  if (
                    !contactForm.name ||
                    !contactForm.email ||
                    !contactForm.subject ||
                    !contactForm.message
                  ) {
                    showToast({
                      type: "error",
                      title: "入力エラー",
                      message: "すべての項目を入力してください",
                      duration: 3000,
                    });
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    const API_URL = getApiUrl();
                    const response = await fetch(`${API_URL}/api/contact`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(contactForm),
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                      showToast({
                        type: "success",
                        title: "送信完了",
                        message:
                          data.message ||
                          "お問い合わせを受け付けました。確認メールを送信しました。",
                        duration: 5000,
                      });
                      // Reset form
                      setContactForm({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                      });
                    } else {
                      throw new Error(
                        data.message || "メールの送信に失敗しました"
                      );
                    }
                  } catch (error) {
                    showToast({
                      type: "error",
                      title: "送信エラー",
                      message:
                        error instanceof Error
                          ? error.message
                          : "メールの送信に失敗しました。しばらくしてから再度お試しください。",
                      duration: 5000,
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div>
                  <input
                    type="text"
                    placeholder="お名前"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-400 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-600"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-400 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-600"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="件名"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-400 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-600"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="お問い合わせ内容"
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-400 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-gray-800 placeholder-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 text-gray-800 py-4 px-8 border border-gray-400 hover:bg-gray-200 transition-colors font-semibold text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "送信中..." : "送信"}
                </button>
              </form>
            </div>

            {/* Right Column - Contact Information & Social Media */}
            <div className="space-y-12">
              {/* Phone Contact */}
              <div>
                <h3 className="text-lg font-bold text-gray-300 mb-3 uppercase">
                  CALL US ON
                </h3>
                <p className="text-2xl font-bold text-gray-300">
                  +81 (0)3 1234 5678
                </p>
              </div>

              {/* Email Contact */}
              <div>
                <h3 className="text-lg font-bold text-gray-300 mb-3 uppercase">
                  OR EMAIL
                </h3>
                <p className="text-2xl font-bold text-gray-300">
                  nakano@manabou.co.jp
                </p>
              </div>

              {/* Address */}
              <div className="text-right">
                <p className="text-gray-300">
                  学ぼう国際研修センター
                  <br />
                  〒150-0001 東京都渋谷区神宮前
                  <br />
                  1-1-1 学ぼうビル 3階
                  <br />
                  Tokyo, Japan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-center items-center">
              {/* Left Side - Copyright */}
              <div className="mb-4 md:mb-0 text-center">
                <p className="text-gray-300 mb-2">
                  © 2025 学ぼう国際研修センター
                </p>
                <p className="text-gray-400 text-sm">
                  一般社団法人 学ぼう国際研修センター | 〒150-0001
                  東京都渋谷区神宮前1-1-1 学ぼうビル 3階
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentLayout;
