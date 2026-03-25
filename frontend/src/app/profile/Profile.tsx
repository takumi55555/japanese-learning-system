import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Camera,
  User,
  BookOpen,
  Key,
  IdCard,
  Hash,
  MapPin,
  Eye,
  EyeOff,
  FileDown,
  Loader2,
} from "lucide-react";
import {
  getStoredUser,
  isAuthenticated,
  getAuthToken,
} from "../../api/auth/authService";
import { ConfirmModal } from "../../components/atom";
import { useToast } from "../../hooks/useToast";
import { useGetCertificateQuery } from "../../api/certificates/certificateApiSlice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getApiUrl, getFileUrl } from "../../utils/apiConfig";

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

// Profile data interface
interface LectureProgress {
  materialName: string;
  progress: number;
}

interface CourseData {
  courseId: string;
  courseName: string;
  studentId: string;
  password: string;
  status: string;
  lectureProgress: LectureProgress[];
}

interface ProfileData {
  id: string;
  username?: string;
  email?: string;
  role: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  birthday?: string;
  joinedDate?: string;
  lastLogin?: string;
  courses?: CourseData[];
  // Group admin specific fields
  name?: string;
  group_id?: string;
  companyName?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressOther?: string;
  ticketCount?: number;
  ticketGroups?: Array<{
    courseId: string;
    courseName: string;
    ticketCount: number;
    usedCount: number;
    inUseCount: number;
    unusedCount: number;
  }>;
  // Student info from GroupTicket (set by group admin when assigning ticket)
  studentInfo?: {
    name?: string;
    birthday?: string;
    email?: string;
  };
}

export const ProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const { showToast } = useToast();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set()
  );
  const [visibleStudentIds, setVisibleStudentIds] = useState<Set<string>>(
    new Set()
  );
  const [showCourses, setShowCourses] = useState(true);

  // Get user data
  const userData = getStoredUser();
  const userId = userData?.id || "";

  // Mock profile data - replace with static data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [expandPassword, setExpandPassword] = useState(true);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Get certificate data from database
  const { data: certificate, isLoading: isLoadingCertificate } =
    useGetCertificateQuery(userId, {
      skip: !userId,
    });

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 5);
  };
  const strength = getPasswordStrength(newPassword);
  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const API_URL = getApiUrl();
        const token = getAuthToken();

        if (!token) {
          throw new Error("認証トークンが見つかりません");
        }

        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        const profileData = data.profile;

        // Debug: Log profile data to console
        console.log("Profile data received:", {
          studentInfo: profileData.studentInfo,
          courses: profileData.courses,
          coursesLength: profileData.courses?.length,
          username: profileData.username,
          role: profileData.role,
        });

        // If user is a group admin, fetch ticket groups (not needed anymore since we removed ticket display)
        // This section is kept for potential future use but currently does nothing
        // Ticket information is no longer displayed on the profile page

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!userData) {
      navigate("/login");
      return;
    }
  }, [navigate, userData]);

  // Update editedProfile when profile changes
  useEffect(() => {
    if (profile && !editing) {
      setEditedProfile({
        ...profile,
        studentInfo: profile.studentInfo || undefined,
      });
    }
  }, [profile, editing]);

  // Mock error handling - no real API errors

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile({
      ...profile,
      studentInfo: profile?.studentInfo || {
        name: undefined,
        birthday: undefined,
        email: undefined,
      },
    } as ProfileData);
  };

  const handleCancel = () => {
    setEditedProfile(profile || null);
    setEditing(false);
  };

  // Format phone number with hyphens
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");

    // Format based on length
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      // Format: XXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      // Format: XXX-XXXX-XXXX (for landlines like 03-1234-5678)
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7
      )}`;
    } else {
      // Format: XXX-XXXX-XXXX (for mobile like 090-1234-5678)
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setEditedProfile((prev) => (prev ? { ...prev, phone: formatted } : null));
  };

  const handleSave = async () => {
    if (!editedProfile) {
      console.error("No profile data to save");
      return;
    }

    const API_URL = getApiUrl();
    const token = getAuthToken();

    if (!token) {
      console.error("No auth token found, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      setIsUpdating(true);

      // Step 1: Upload avatar if there's a new one
      let avatarUrl = editedProfile.avatar;
      let hasNewAvatar = false;

      if (
        editedProfile.avatar &&
        editedProfile.avatar.startsWith("data:image/")
      ) {
        setIsUploadingAvatar(true);
        hasNewAvatar = true;

        try {
          // Convert base64 to blob directly
          const base64Data = editedProfile.avatar.split(",")[1];
          const mimeType =
            editedProfile.avatar.match(/data:([^;]+);/)?.[1] || "image/jpeg";
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });

          // Determine file extension from mime type
          let extension = "jpg";
          if (mimeType.includes("png")) extension = "png";
          else if (mimeType.includes("gif")) extension = "gif";
          else if (mimeType.includes("webp")) extension = "webp";

          // Create FormData
          const formData = new FormData();
          formData.append("avatar", blob, `avatar.${extension}`);

          // Upload avatar
          const uploadResponse = await fetch(`${API_URL}/api/profile/avatar`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type - let browser set it with boundary for multipart/form-data
            },
            body: formData,
          });

          let uploadData;
          try {
            uploadData = await uploadResponse.json();
          } catch {
            const text = await uploadResponse.text();
            throw new Error(
              `サーバーエラー: ${uploadResponse.status} - ${
                text || "不明なエラー"
              }`
            );
          }

          if (!uploadResponse.ok) {
            throw new Error(
              uploadData.message || uploadData.error || "Avatar upload failed"
            );
          }

          avatarUrl = uploadData.avatarUrl;
        } catch (uploadError) {
          console.error("Avatar upload error:", uploadError);
          throw new Error(
            uploadError instanceof Error
              ? uploadError.message
              : "アバターのアップロードに失敗しました"
          );
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Optional: Change password first if provided
      if (newPassword || confirmNewPassword || currentPassword) {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          throw new Error(
            "現在のパスワード、新しいパスワード、確認を全て入力してください"
          );
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error("新しいパスワードと確認が一致しません");
        }
        if (newPassword.length < 8) {
          throw new Error("新しいパスワードは8文字以上にしてください");
        }

        const pwResponse = await fetch(`${API_URL}/api/profile/password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword,
          }),
        });

        const pwData = await pwResponse.json();
        if (!pwResponse.ok) {
          throw new Error(pwData.message || "パスワード変更に失敗しました");
        }
      }

      // Step 2: Update profile data
      const profileUpdateData: {
        username?: string;
        email?: string;
        phone?: string;
        gender?: string;
        birthday?: string;
        avatar?: string;
        name?: string;
        group_id?: string;
        companyName?: string;
        postalCode?: string;
        prefecture?: string;
        city?: string;
        addressOther?: string;
        studentInfo?: {
          name?: string;
          birthday?: string;
          email?: string;
        };
      } = {};

      // Only include fields that have values
      // For group admin, include username (saved to users collection) and group_id (saved to profile collection)
      if (userData?.role === "group_admin") {
        // Username is saved to users collection
        if (editedProfile.username !== undefined)
          profileUpdateData.username = editedProfile.username.trim();
        // Email is saved to users collection
        if (editedProfile.email !== undefined)
          profileUpdateData.email = editedProfile.email.trim();
        // Group ID is saved to profile collection (e.g., groupadmin_1763997272407_93c8adaded0272bf)
        if (editedProfile.group_id !== undefined)
          profileUpdateData.group_id = editedProfile.group_id.trim();
      } else {
        // For non-group-admin users
        if (editedProfile.username)
          profileUpdateData.username = editedProfile.username;
        // displayName removed
        if (editedProfile.email) profileUpdateData.email = editedProfile.email;
        if (editedProfile.phone) profileUpdateData.phone = editedProfile.phone;
        if (editedProfile.gender)
          profileUpdateData.gender = editedProfile.gender;
        if (editedProfile.birthday)
          profileUpdateData.birthday = editedProfile.birthday;

        // Include studentInfo for students
        if (userData?.role === "student" && editedProfile.studentInfo) {
          // Only include studentInfo if at least one field has a value
          const hasStudentInfo =
            (editedProfile.studentInfo.name &&
              editedProfile.studentInfo.name.trim() !== "") ||
            (editedProfile.studentInfo.birthday &&
              editedProfile.studentInfo.birthday.trim() !== "") ||
            (editedProfile.studentInfo.email &&
              editedProfile.studentInfo.email.trim() !== "");

          if (hasStudentInfo) {
            profileUpdateData.studentInfo = {
              name:
                editedProfile.studentInfo.name &&
                editedProfile.studentInfo.name.trim() !== ""
                  ? editedProfile.studentInfo.name.trim()
                  : undefined,
              birthday:
                editedProfile.studentInfo.birthday &&
                editedProfile.studentInfo.birthday.trim() !== ""
                  ? editedProfile.studentInfo.birthday.trim()
                  : undefined,
              email:
                editedProfile.studentInfo.email &&
                editedProfile.studentInfo.email.trim() !== ""
                  ? editedProfile.studentInfo.email.trim()
                  : undefined,
            };
          }
        }
      }

      // Only include avatar if it was newly uploaded
      if (hasNewAvatar && avatarUrl) {
        profileUpdateData.avatar = avatarUrl;
      }

      // Group admin specific fields
      // name field removed - use username from users collection instead
      // For group admins, group_id is stored separately in profile collection
      if (editedProfile.companyName !== undefined)
        profileUpdateData.companyName = editedProfile.companyName;
      if (editedProfile.postalCode !== undefined)
        profileUpdateData.postalCode = editedProfile.postalCode;
      if (editedProfile.prefecture !== undefined)
        profileUpdateData.prefecture = editedProfile.prefecture;
      if (editedProfile.city !== undefined)
        profileUpdateData.city = editedProfile.city;
      if (editedProfile.addressOther !== undefined)
        profileUpdateData.addressOther = editedProfile.addressOther;

      const profileResponse = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileUpdateData),
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileData.message || "Profile update failed");
      }

      // Update local state with server response
      setProfile(profileData.profile);

      // Update localStorage for group admin profile
      if (userData?.role === "group_admin" && profileData.profile) {
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

      setEditing(false);
      setIsUpdating(false);

      showToast({
        type: "success",
        title: "プロフィールが更新されました",
        message: newPassword
          ? "プロフィールとパスワードが正常に保存されました。"
          : "プロフィール情報が正常に保存されました。",
        duration: 4000,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsUpdating(false);
      setIsUploadingAvatar(false);
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラー";
      console.error("Failed to update profile:", errorMessage);

      showToast({
        type: "error",
        title: "プロフィール更新エラー",
        message: errorMessage,
        duration: 6000,
      });
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await handleSave();
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatDateForTable = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleDownloadCertificate = async () => {
    if (!certificate || !certificateRef.current) {
      showToast({
        type: "error",
        title: "エラー",
        message: "修了証データが見つかりません。",
        duration: 4000,
      });
      return;
    }

    setIsGeneratingCertificate(true);

    try {
      // B5 dimensions in mm: 182mm x 257mm
      const B5_WIDTH_MM = 182;
      const B5_HEIGHT_MM = 257;

      // Wait for background image to load
      const certificateElement = certificateRef.current;
      if (certificateElement) {
        // Ensure the element is visible for html2canvas (temporarily)
        const originalStyle = certificateElement.style.cssText;
        certificateElement.style.position = "absolute";
        certificateElement.style.left = "0";
        certificateElement.style.top = "0";
        certificateElement.style.visibility = "visible";
        certificateElement.style.zIndex = "9999";

        // Wait for background image to load
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(undefined);
          img.onerror = () => resolve(undefined);
          img.src = "/img/certificate.png";
          // Timeout after 2 seconds
          setTimeout(() => resolve(undefined), 2000);
        });

        // Wait a bit more to ensure rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Capture the certificate element using html2canvas
        const canvas = await html2canvas(certificateElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: certificateElement.offsetWidth || B5_WIDTH_MM * 3.7795,
          height: certificateElement.offsetHeight || B5_HEIGHT_MM * 3.7795,
        });

        // Restore original style
        certificateElement.style.cssText = originalStyle;

        // Create PDF with B5 format
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [B5_WIDTH_MM, B5_HEIGHT_MM],
        });

        // Convert canvas to image
        const imgData = canvas.toDataURL("image/png", 1.0);

        // Calculate dimensions to fit B5 page
        const imgWidth = B5_WIDTH_MM;
        const imgHeight = (canvas.height * B5_WIDTH_MM) / canvas.width;

        // Add image to PDF
        pdf.addImage(
          imgData,
          "PNG",
          0,
          0,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        // Generate filename with timestamp
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-");
        const filename = `certificate-${timestamp}.pdf`;

        // Save the PDF
        pdf.save(filename);
      }

      showToast({
        type: "success",
        title: "ダウンロード完了",
        message: "修了証が正常にダウンロードされました。",
        duration: 4000,
      });

      setIsGeneratingCertificate(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast({
        type: "error",
        title: "エラー",
        message: "PDFの生成中にエラーが発生しました。",
        duration: 4000,
      });
      setIsGeneratingCertificate(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast({
        type: "error",
        title: "ファイル形式エラー",
        message: "JPEG、PNG、GIF、WebP形式の画像のみアップロードできます",
        duration: 4000,
      });
      e.target.value = ""; // Reset input
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast({
        type: "error",
        title: "ファイルサイズエラー",
        message: "ファイルサイズは5MB以下にしてください",
        duration: 4000,
      });
      e.target.value = ""; // Reset input
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      // Store avatar in local state - will be uploaded when Save is clicked
      setEditedProfile((prev) =>
        prev ? { ...prev, avatar: base64String } : null
      );

      showToast({
        type: "success",
        title: "画像が選択されました",
        message: "保存ボタンをクリックしてアップロードしてください",
        duration: 3000,
      });
    };
    reader.onerror = () => {
      console.error("Failed to read avatar file");
      showToast({
        type: "error",
        title: "読み込みエラー",
        message: "ファイルの読み込みに失敗しました",
        duration: 4000,
      });
      e.target.value = ""; // Reset input
    };
    reader.readAsDataURL(file);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "学生";
      case "admin":
        return "管理者";
      default:
        return role;
    }
  };

  const togglePasswordVisibility = (courseId: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleStudentIdVisibility = (courseId: string) => {
    setVisibleStudentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!profile || !editedProfile) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Two Column Layout */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 sticky top-6">
              {/* Page Header */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  プロフィール管理
                </h2>
                <p className="text-slate-600 text-xs">
                  アカウント情報を管理できます
                </p>
              </div>
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-200">
                <div className="relative inline-block mb-4 w-24 h-24">
                  {(editing ? editedProfile?.avatar : profile?.avatar) ? (
                    <img
                      src={
                        (
                          (editing ? editedProfile?.avatar : profile?.avatar) ||
                          ""
                        ).startsWith("data:")
                          ? editing
                            ? editedProfile?.avatar
                            : profile?.avatar
                          : getFileUrl(
                              editing
                                ? editedProfile?.avatar || ""
                                : profile?.avatar || ""
                            )
                      }
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <img
                      src="/img/default_avatar.png"
                      alt="デフォルトアバター"
                      className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                    />
                  )}
                  {editing && (
                    <label
                      className={`absolute bottom-0 right-0 ${
                        isUploadingAvatar
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-slate-500 hover:bg-slate-600 cursor-pointer"
                      } text-white p-2 rounded-full shadow-lg transition-colors`}
                    >
                      {isUploadingAvatar ? (
                        <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {editedProfile?.username || profile?.username || "未設定"}
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                  {profile?.role &&
                    getRoleLabel(profile.role) == "group_admin" &&
                    "グループ管理者"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!editing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>編集</span>
                    </button>
                    {!isLoadingCertificate && certificate && (
                      <button
                        onClick={handleDownloadCertificate}
                        disabled={isGeneratingCertificate}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingCertificate ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>生成中...</span>
                          </>
                        ) : (
                          <>
                            <FileDown className="w-4 h-4" />
                            <span>修了証ダウンロード</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed"
                      disabled={isUpdating || isUploadingAvatar}
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {isUploadingAvatar
                          ? "アップロード中..."
                          : isUpdating
                          ? "保存中..."
                          : "保存"}
                      </span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed"
                      disabled={isUpdating || isUploadingAvatar}
                    >
                      <X className="w-4 h-4" />
                      <span>キャンセル</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              {/* Basic Information Section - Only for non-group-admin users */}
              {userData?.role !== "group_admin" && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                    基本情報
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name - Always show for students */}
                    {userData?.role === "student" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          名前
                        </label>
                        {editing ? (
                          <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                            <User className="w-4 h-4 text-slate-500 ml-3" />
                            <input
                              type="text"
                              value={editedProfile?.username || ""}
                              onChange={(e) =>
                                setEditedProfile((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        username: e.target.value,
                                      }
                                    : null
                                )
                              }
                              className="w-full px-4 py-2 outline-none"
                              placeholder="名前"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                            <span className="text-slate-800">
                              {profile?.username || "未設定"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        メールアドレス
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <Mail className="w-4 h-4 text-slate-500 ml-3" />
                          <input
                            type="email"
                            value={
                              userData?.role === "student" &&
                              editedProfile?.studentInfo?.email
                                ? editedProfile.studentInfo.email
                                : editedProfile?.email || ""
                            }
                            onChange={(e) => {
                              if (userData?.role === "student") {
                                setEditedProfile((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        studentInfo: {
                                          ...prev.studentInfo,
                                          email: e.target.value,
                                        },
                                      }
                                    : null
                                );
                              } else {
                                setEditedProfile((prev) =>
                                  prev
                                    ? { ...prev, email: e.target.value }
                                    : null
                                );
                              }
                            }}
                            className="w-full px-4 py-2 outline-none"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {userData?.role === "student" &&
                            profile?.studentInfo?.email
                              ? profile.studentInfo.email
                              : profile.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        電話番号
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <Phone className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="tel"
                            value={editedProfile?.phone || ""}
                            onChange={handlePhoneChange}
                            className="w-full px-4 py-2 outline-none"
                            placeholder="03-1234-5678"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.phone || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        性別
                      </label>
                      {editing ? (
                        <select
                          value={editedProfile?.gender || "男性"}
                          onChange={(e) =>
                            setEditedProfile((prev) =>
                              prev ? { ...prev, gender: e.target.value } : null
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        >
                          <option value="男性">男性</option>
                          <option value="女性">女性</option>
                        </select>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.gender || "男性"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Birthday */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        生年月日
                      </label>
                      {editing ? (
                        <input
                          type="date"
                          value={
                            userData?.role === "student" &&
                            editedProfile?.studentInfo?.birthday
                              ? new Date(editedProfile.studentInfo.birthday)
                                  .toISOString()
                                  .split("T")[0]
                              : editedProfile?.birthday
                              ? new Date(editedProfile.birthday)
                                  .toISOString()
                                  .split("T")[0]
                              : new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) => {
                            if (userData?.role === "student") {
                              setEditedProfile((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      studentInfo: {
                                        ...prev.studentInfo,
                                        birthday: e.target.value,
                                      },
                                    }
                                  : null
                              );
                            } else {
                              setEditedProfile((prev) =>
                                prev
                                  ? { ...prev, birthday: e.target.value }
                                  : null
                              );
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {userData?.role === "student" &&
                            profile?.studentInfo?.birthday
                              ? new Date(
                                  profile.studentInfo.birthday
                                ).toLocaleDateString("ja-JP", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : profile.birthday
                              ? new Date(profile.birthday).toLocaleDateString(
                                  "ja-JP",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "未設定"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Group Admin Purchaser Information Section - Grid format */}
              {userData?.role === "group_admin" && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                    購入者情報
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        名前 <span className="text-red-500">*</span>
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <User className="w-4 h-4 text-slate-500 ml-3" />
                          <input
                            type="text"
                            value={editedProfile?.username || ""}
                            onChange={(e) =>
                              setEditedProfile((prev) =>
                                prev
                                  ? { ...prev, username: e.target.value }
                                  : null
                              )
                            }
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="山田 太郎"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.username || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        申請会社名 <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                          ※個人の方は屋号
                        </span>
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <User className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={editedProfile?.companyName || ""}
                            onChange={(e) =>
                              setEditedProfile((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      companyName: e.target.value,
                                    }
                                  : null
                              )
                            }
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="株式会社サンプル"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.companyName || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Group ID */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        グループID
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <Hash className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={editedProfile?.group_id || ""}
                            onChange={(e) =>
                              setEditedProfile((prev) =>
                                prev
                                  ? { ...prev, group_id: e.target.value }
                                  : null
                              )
                            }
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="groupadmin_..."
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <Hash className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                          <span className="text-slate-800 font-mono text-sm break-all">
                            {profile.group_id || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Prefecture */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        都道府県 <span className="text-red-500">*</span>
                      </label>
                      {editing ? (
                        <select
                          value={editedProfile?.prefecture || ""}
                          onChange={(e) =>
                            setEditedProfile((prev) =>
                              prev
                                ? { ...prev, prefecture: e.target.value }
                                : null
                            )
                          }
                          className="w-full px-4 py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
                        >
                          <option value="">選択してください</option>
                          {prefectures.map((pref) => (
                            <option key={pref} value={pref}>
                              {pref}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.prefecture || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        郵便番号 <span className="text-red-500">*</span>
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <MapPin className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={editedProfile?.postalCode || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numbers = value
                                .replace(/-/g, "")
                                .replace(/\D/g, "");
                              let formatted = numbers;
                              if (numbers.length > 3) {
                                formatted = `${numbers.slice(
                                  0,
                                  3
                                )}-${numbers.slice(3, 7)}`;
                              }
                              setEditedProfile((prev) =>
                                prev ? { ...prev, postalCode: formatted } : null
                              );
                            }}
                            maxLength={8}
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="123-4567"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.postalCode || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        市区町村 <span className="text-red-500">*</span>
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <MapPin className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={editedProfile?.city || ""}
                            onChange={(e) =>
                              setEditedProfile((prev) =>
                                prev ? { ...prev, city: e.target.value } : null
                              )
                            }
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="渋谷区神宮前"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.city || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address Other */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        住所その他
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <MapPin className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={editedProfile?.addressOther || ""}
                            onChange={(e) =>
                              setEditedProfile((prev) =>
                                prev
                                  ? { ...prev, addressOther: e.target.value }
                                  : null
                              )
                            }
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="1-1-1 学ぼうビル 3階"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.addressOther || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        電話番号 <span className="text-red-500">*</span>
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <Phone className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
                          <input
                            type="tel"
                            value={editedProfile?.phone || ""}
                            onChange={handlePhoneChange}
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="03-1234-5678"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.phone || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      {editing ? (
                        <div className="flex items-center border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus-within:border-slate-500">
                          <Mail className="w-4 h-4 text-slate-500 ml-3" />
                          <input
                            type="email"
                            value={editedProfile?.email || ""}
                            onChange={(e) =>
                              setEditedProfile((prev) =>
                                prev ? { ...prev, email: e.target.value } : null
                              )
                            }
                            className="w-full px-4 py-2.5 outline-none"
                            placeholder="example@email.com"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5">
                          <span className="text-slate-800">
                            {profile.email || "未設定"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Change Section */}
              <div className="mb-8 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      パスワード変更
                    </h3>
                    <p className="text-xs text-slate-500">
                      大文字・小文字・数字・記号の組み合わせを推奨します
                    </p>
                  </div>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => setExpandPassword((v: boolean) => !v)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {expandPassword ? "閉じる" : "開く"}
                    </button>
                  )}
                </div>
                {editing ? (
                  <div
                    className={`transition-all duration-200 ${
                      expandPassword
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none h-0"
                    }`}
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            現在のパスワード
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPw ? "text" : "password"}
                              placeholder="現在のパスワード"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw((v) => !v)}
                              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                              aria-label="現在のパスワードを表示/非表示"
                            >
                              {showCurrentPw ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            新しいパスワード
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPw ? "text" : "password"}
                              placeholder="新しいパスワード (8文字以上)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw((v) => !v)}
                              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                              aria-label="新しいパスワードを表示/非表示"
                            >
                              {showNewPw ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className="mt-2">
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`${
                                  strength <= 2
                                    ? "bg-rose-500"
                                    : strength === 3
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                } h-1.5 transition-all`}
                                style={{ width: `${(strength / 5) * 100}%` }}
                              />
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>強度</span>
                              <span>
                                {strength <= 2
                                  ? "弱い"
                                  : strength === 3
                                  ? "普通"
                                  : "強い"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            新しいパスワード（確認）
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPw ? "text" : "password"}
                              placeholder="新しいパスワード（確認）"
                              value={confirmNewPassword}
                              onChange={(e) =>
                                setConfirmNewPassword(e.target.value)
                              }
                              className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPw((v) => !v)}
                              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                              aria-label="確認用パスワードを表示/非表示"
                            >
                              {showConfirmPw ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {confirmNewPassword &&
                            newPassword !== confirmNewPassword && (
                              <p className="mt-1.5 text-[11px] text-rose-600">
                                新しいパスワードと確認が一致しません
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600">
                    セキュリティのため、ここでは表示しません
                  </div>
                )}
              </div>

              {/* Enrolled Courses Section - Only show for non-group-admin users */}
              {userData?.role !== "group_admin" &&
                profile.courses &&
                profile.courses.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        登録コース情報
                      </h4>
                      <button
                        onClick={() => setShowCourses(!showCourses)}
                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                        title={
                          showCourses ? "コース情報を隠す" : "コース情報を表示"
                        }
                      >
                        {showCourses ? (
                          <EyeOff className="w-4 h-4 text-slate-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </div>
                    {showCourses && (
                      <div className="space-y-4">
                        {profile.courses.map((course) => (
                          <div
                            key={course.courseId}
                            className="bg-slate-50 border border-slate-300 rounded-lg p-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  コース名
                                </label>
                                <div className="flex items-center">
                                  <BookOpen className="w-4 h-4 text-slate-500 mr-2" />
                                  <span className="text-slate-800 font-medium">
                                    {course.courseName}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  学生ID
                                </label>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <IdCard className="w-4 h-4 text-slate-500 mr-2" />
                                    <span className="text-slate-800 font-mono">
                                      {visibleStudentIds.has(course.courseId)
                                        ? course.studentId
                                        : "••••••••••••••"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      toggleStudentIdVisibility(course.courseId)
                                    }
                                    className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors"
                                    title={
                                      visibleStudentIds.has(course.courseId)
                                        ? "学生IDを隠す"
                                        : "学生IDを表示"
                                    }
                                  >
                                    {visibleStudentIds.has(course.courseId) ? (
                                      <EyeOff className="w-4 h-4 text-slate-600" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-slate-600" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  パスワード
                                </label>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Key className="w-4 h-4 text-slate-500 mr-2" />
                                    <span className="text-slate-800 font-mono">
                                      {visiblePasswords.has(course.courseId)
                                        ? course.password
                                        : "••••••••"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      togglePasswordVisibility(course.courseId)
                                    }
                                    className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors"
                                    title={
                                      visiblePasswords.has(course.courseId)
                                        ? "パスワードを隠す"
                                        : "パスワードを表示"
                                    }
                                  >
                                    {visiblePasswords.has(course.courseId) ? (
                                      <EyeOff className="w-4 h-4 text-slate-600" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-slate-600" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  ステータス
                                </label>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    course.status === "active"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : course.status === "completed"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {course.status === "active"
                                    ? "受講中"
                                    : course.status === "completed"
                                    ? "完了"
                                    : course.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSave}
          title="プロフィール更新の確認"
          message={
            <div className="space-y-2">
              <p>以下の変更を保存してもよろしいですか？</p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                {userData?.role !== "group_admin" &&
                  editedProfile?.username !== profile?.username && (
                    <li>
                      • ユーザー名: {profile?.username} →{" "}
                      {editedProfile?.username}
                    </li>
                  )}
                {/* displayName removed */}
                {userData?.role !== "group_admin" &&
                  editedProfile?.email !== profile?.email && (
                    <li>
                      • メール: {profile?.email} → {editedProfile?.email}
                    </li>
                  )}
                {userData?.role !== "group_admin" &&
                  editedProfile?.phone !== profile?.phone && (
                    <li>
                      • 電話番号: {profile?.phone || "未設定"} →{" "}
                      {editedProfile?.phone}
                    </li>
                  )}
                {userData?.role !== "group_admin" &&
                  editedProfile?.gender !== profile?.gender && (
                    <li>
                      • 性別: {profile?.gender || "男性"} →{" "}
                      {editedProfile?.gender}
                    </li>
                  )}
                {userData?.role !== "group_admin" &&
                  editedProfile?.birthday !== profile?.birthday && (
                    <li>
                      • 生年月日: {profile?.birthday || "未設定"} →{" "}
                      {editedProfile?.birthday}
                    </li>
                  )}
                {userData?.role !== "group_admin" &&
                  (newPassword || confirmNewPassword || currentPassword) && (
                    <li>• パスワードの変更</li>
                  )}
              </ul>
            </div>
          }
          confirmText="保存"
          cancelText="キャンセル"
          confirmButtonClass="bg-emerald-600 hover:bg-emerald-700"
          isLoading={isUpdating || isUploadingAvatar}
        />

        {/* Hidden Certificate Element for PDF Generation */}
        {certificate && (
          <div
            style={{
              position: "absolute",
              left: "-9999px",
              top: "-9999px",
              visibility: "hidden",
            }}
          >
            <div
              ref={certificateRef}
              className="certificate-container"
              style={{
                width: "182mm",
                minHeight: "257mm",
                position: "relative",
                backgroundColor: "#ffffff",
                backgroundImage: "url('/img/certificate.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "top left",
                backgroundRepeat: "no-repeat",
                fontFamily: "'Noto Sans JP', sans-serif",
                wordBreak: "keep-all",
                lineBreak: "strict",
              }}
            >
              {/* Content Area */}
              <div
                style={{
                  padding: "40mm 30mm 30mm 30mm",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Certificate Number - Top Right */}
                {certificate.certificateNumber && (
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "16px",
                      fontWeight: "normal",
                      marginBottom: "10px",
                      color: "#000000",
                      fontFamily:
                        "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif",
                    }}
                  >
                    第{certificate.certificateNumber}号
                  </div>
                )}

                {/* Title - Centered at top */}
                <div
                  style={{
                    textAlign: "center",
                    paddingRight: "10px",
                    fontSize: "48px",
                    fontWeight: "bold",
                    marginBottom: "40px",
                    letterSpacing: "4px",
                    color: "#000000",
                    fontFamily:
                      "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif",
                  }}
                >
                  修了証書
                </div>

                {/* Information Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                    tableLayout: "fixed",
                    fontSize: "18px",
                    fontFamily:
                      "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif",
                  }}
                >
                  {/* Header Row 1 */}
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          backgroundColor: "#f5f5f5",
                          fontSize: "18px",
                          fontWeight: "normal",
                          width: "25%",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        受講者名
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          backgroundColor: "#f5f5f5",
                          fontSize: "18px",
                          fontWeight: "normal",
                          width: "15%",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        性別
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          backgroundColor: "#f5f5f5",
                          fontSize: "18px",
                          fontWeight: "normal",
                          width: "25%",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {formatDateForTable(
                          certificate.issueDate || certificate.startDate
                        )}
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          backgroundColor: "#f5f5f5",
                          fontSize: "18px",
                          fontWeight: "normal",
                          width: "35%",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        受講時間数
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Data Row 1 */}
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          fontSize: "18px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontWeight: "500",
                        }}
                      >
                        {profile?.username || certificate.name}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          fontSize: "18px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontWeight: "500",
                        }}
                      >
                        {certificate.gender}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          fontSize: "18px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontWeight: "500",
                        }}
                      >
                        ミャンマー
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          fontSize: "18px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontWeight: "500",
                        }}
                      >
                        174時間
                      </td>
                    </tr>
                    {/* Header Row 2 - Study Period */}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          backgroundColor: "#f5f5f5",
                          fontSize: "18px",
                          fontWeight: "normal",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        受講期間
                      </td>
                    </tr>
                    {/* Data Row 2 - Study Period Dates */}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          border: "1px solid #000",
                          padding: "15px 10px",
                          fontSize: "18px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontWeight: "500",
                        }}
                      >
                        {formatDateForDisplay(certificate.startDate)} ～{" "}
                        {formatDateForDisplay(certificate.endDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Certificate Statement */}
                <div
                  style={{
                    fontSize: "20px",
                    lineHeight: "1.5",
                    textAlign: "left",
                    marginBottom: "50px",
                    fontWeight: "normal",
                    color: "#000000",
                    fontFamily:
                      "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif",
                  }}
                >
                  <div>上記の者は本校で規定の講習を</div>
                  <div>修了したことを証する</div>
                </div>

                {/* Issuance Details - Bottom Right */}
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "18px",
                    lineHeight: "2",
                    color: "#000000",
                    position: "relative",
                    paddingRight: "5px",
                    fontFamily:
                      "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif",
                  }}
                >
                  {/* Issuance Date */}
                  <div>
                    {formatDateForDisplay(
                      certificate.issueDate || certificate.endDate
                    )}
                  </div>

                  {/* Institution Name */}
                  <div style={{ paddingTop: "5px" }}>
                    学ぼう国際研修センター
                  </div>

                  {/* Director Name with Seal Space */}
                  <div
                    style={{
                      display: "inline-block",
                      position: "relative",
                      paddingRight: "50px", // Space for seal
                    }}
                  >
                    学院長&nbsp;&nbsp;&nbsp;&nbsp;中野&nbsp;&nbsp;&nbsp;&nbsp;学
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement;
