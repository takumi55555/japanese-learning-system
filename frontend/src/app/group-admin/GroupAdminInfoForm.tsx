import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import {
  isAuthenticated,
  getStoredUser,
  getAuthToken,
} from "../../api/auth/authService";
import { getApiUrl } from "../../utils/apiConfig";

interface Course {
  id: string;
  name: string;
  price: number;
}

interface GroupAdminInfo {
  name: string;
  companyName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressOther: string;
  phoneNumber: string;
  numberOfTickets: string;
  email: string;
}

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

interface CourseTicketCount {
  courseId: string;
  courseName: string;
  price: number;
  ticketCount: string;
}

export const GroupAdminInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const course = location.state?.course as Course | undefined;
  const courses = location.state?.courses as Course[] | undefined;

  const user = getStoredUser();
  const isAuthGroupAdmin = isAuthenticated() && user?.role === "group_admin";

  // Determine if this is a multi-course purchase
  const isMultiCourse = React.useMemo(
    () => courses && courses.length > 0,
    [courses]
  );
  const displayCourses = React.useMemo(() => {
    return isMultiCourse ? courses || [] : course ? [course] : [];
  }, [isMultiCourse, courses, course]);

  const [formData, setFormData] = useState<GroupAdminInfo>({
    name: "",
    companyName: "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressOther: "",
    phoneNumber: "",
    numberOfTickets: "",
    email: "",
  });

  // For multi-course: store ticket count for each course
  const [courseTicketCounts, setCourseTicketCounts] = useState<
    Record<string, string>
  >({});

  const [errors, setErrors] = useState<Partial<GroupAdminInfo>>({});
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});

  // Redirect if no course data
  React.useEffect(() => {
    if (!course && !courses) {
      navigate("/courses");
    }
  }, [course, courses, navigate]);

  // Initialize course ticket counts
  React.useEffect(() => {
    if (isMultiCourse && displayCourses.length > 0) {
      const initialCounts: Record<string, string> = {};
      displayCourses.forEach((c) => {
        initialCounts[c.id] = "";
      });
      setCourseTicketCounts(initialCounts);
    }
  }, [isMultiCourse, displayCourses]);

  // Load profile data from localStorage for authenticated group admin
  useEffect(() => {
    if (isAuthGroupAdmin && (course || (courses && courses.length > 0))) {
      const loadProfile = async () => {
        try {
          const storedProfile = localStorage.getItem("groupAdminProfile");

          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            // Populate form with existing profile data from localStorage
            // Import profile fields: username (used as name in form), group_id, companyName, postalCode, prefecture, city, addressOther
            setFormData({
              name: profile.username || profile.group_id || "",
              companyName: profile.companyName || "",
              postalCode: profile.postalCode || "",
              prefecture: profile.prefecture || "",
              city: profile.city || "",
              addressOther: profile.addressOther || "",
              phoneNumber: profile.phone || "",
              numberOfTickets: "",
              email: profile.email || user?.email || "",
            });
          } else {
            // If not in localStorage, fetch from API and store it
            try {
              const API_URL = getApiUrl();
              const token = getAuthToken();

              const response = await fetch(`${API_URL}/api/profile`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const data = await response.json();
                const profile = data.profile;
                // Store in localStorage with all group admin fields
                // Import profile fields: username, group_id, companyName, postalCode, prefecture, city, addressOther
                const groupAdminProfile = {
                  ...profile,
                  username: profile.username || "",
                  group_id: profile.group_id || "",
                  companyName: profile.companyName || "",
                  postalCode: profile.postalCode || "",
                  prefecture: profile.prefecture || "",
                  city: profile.city || "",
                  addressOther: profile.addressOther || "",
                };
                localStorage.setItem(
                  "groupAdminProfile",
                  JSON.stringify(groupAdminProfile)
                );
                // Populate form with existing profile data from Profile model
                setFormData({
                  name: profile.username || profile.group_id || "",
                  companyName: profile.companyName || "",
                  postalCode: profile.postalCode || "",
                  prefecture: profile.prefecture || "",
                  city: profile.city || "",
                  addressOther: profile.addressOther || "",
                  phoneNumber: profile.phone || "",
                  numberOfTickets: "",
                  email: profile.email || user?.email || "",
                });
              }
            } catch (error) {
              console.error("Error fetching profile:", error);
            }
          }
        } catch (error) {
          console.error("Error loading profile from localStorage:", error);
        }
      };

      loadProfile();
    }
  }, [isAuthGroupAdmin, course, courses, user?.email]);

  const validateForm = (): boolean => {
    const newErrors: Partial<GroupAdminInfo> = {};

    if (!formData.name.trim()) {
      newErrors.name = "名前を入力してください";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "申請会社名を入力してください";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "郵便番号を入力してください";
    } else if (!/^\d{3}-?\d{4}$/.test(formData.postalCode.replace(/-/g, ""))) {
      newErrors.postalCode = "有効な郵便番号を入力してください（例: 123-4567）";
    }

    if (!formData.prefecture) {
      newErrors.prefecture = "都道府県を選択してください";
    }

    if (!formData.city.trim()) {
      newErrors.city = "市区町村を入力してください";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "電話番号を入力してください";
    } else if (!/^[\d-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "有効な電話番号を入力してください";
    }

    // Validate ticket counts
    if (isMultiCourse) {
      // For multi-course: validate each course's ticket count
      const newCourseErrors: Record<string, string> = {};
      let hasError = false;
      displayCourses.forEach((c) => {
        const ticketCount = courseTicketCounts[c.id] || "";
        if (!ticketCount.trim()) {
          newCourseErrors[c.id] = "チケット数を入力してください";
          hasError = true;
        } else if (!/^\d+$/.test(ticketCount) || parseInt(ticketCount) <= 0) {
          newCourseErrors[c.id] = "有効なチケット数を入力してください（1以上）";
          hasError = true;
        }
      });
      setCourseErrors(newCourseErrors);
      if (hasError) {
        return false;
      }
    } else {
      // For single course: validate numberOfTickets
      if (!formData.numberOfTickets.trim()) {
        newErrors.numberOfTickets = "チケット数を入力してください";
      } else if (
        !/^\d+$/.test(formData.numberOfTickets) ||
        parseInt(formData.numberOfTickets) <= 0
      ) {
        newErrors.numberOfTickets =
          "有効なチケット数を入力してください（1以上）";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof GroupAdminInfo]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const formatPostalCode = (value: string) => {
    const numbers = value.replace(/-/g, "").replace(/\D/g, "");
    if (numbers.length <= 3) {
      return numbers;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`;
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value);
    setFormData((prev) => ({
      ...prev,
      postalCode: formatted,
    }));
    if (errors.postalCode) {
      setErrors((prev) => ({
        ...prev,
        postalCode: undefined,
      }));
    }
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({
      ...prev,
      phoneNumber: formatted,
    }));
    if (errors.phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: undefined,
      }));
    }
  };

  const handleCourseTicketCountChange = (courseId: string, value: string) => {
    setCourseTicketCounts((prev) => ({
      ...prev,
      [courseId]: value,
    }));
    // Clear error when user starts typing
    if (courseErrors[courseId]) {
      setCourseErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[courseId];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        type: "error",
        title: "入力エラー",
        message: "すべての必須項目を正しく入力してください",
        duration: 3000,
      });
      return;
    }

    // Prepare course ticket counts for multi-course purchase
    const courseTicketData: CourseTicketCount[] = [];
    if (isMultiCourse) {
      displayCourses.forEach((c) => {
        courseTicketData.push({
          courseId: c.id,
          courseName: c.name,
          price: c.price,
          ticketCount: courseTicketCounts[c.id] || "1",
        });
      });
    }

    // Navigate to payment page with group admin info
    // If authenticated group admin, pass flag to use authenticated endpoint
    // Don't pass groupAdminInfo for authenticated users (they don't need to see/edit it)
    navigate("/payment", {
      state: {
        course: isMultiCourse ? undefined : course,
        courses: isMultiCourse ? courseTicketData : undefined,
        groupAdminInfo: isAuthGroupAdmin ? undefined : formData, // Only pass groupAdminInfo for unauthenticated users
        isAuthenticatedGroupAdmin: isAuthGroupAdmin, // Pass flag for authenticated group admin
        ticketCount:
          isAuthGroupAdmin && !isMultiCourse
            ? formData.numberOfTickets
            : undefined, // Pass ticket count for authenticated users (single course only)
      },
    });
  };

  if (!course && !courses) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-4 sm:py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8"
        >
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors cursor-pointer text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            コース選択に戻る
          </button>
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              購入者情報
            </h1>
            {isMultiCourse ? (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
                  選択された講座 ({displayCourses.length}件)
                </p>
                {displayCourses.map((c) => (
                  <div
                    key={c.id}
                    className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                          {c.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          料金: ¥{c.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor={`ticketCount-${c.id}`}
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                      >
                        チケット数 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`ticketCount-${c.id}`}
                        value={courseTicketCounts[c.id] || ""}
                        onChange={(e) =>
                          handleCourseTicketCountChange(c.id, e.target.value)
                        }
                        className={`w-full px-2 sm:px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                          courseErrors[c.id]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="例: 5"
                      />
                      {courseErrors[c.id] && (
                        <p className="mt-1 text-xs text-red-500">
                          {courseErrors[c.id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-700">
                <p>
                  コース:{" "}
                  <span className="font-semibold text-gray-900">
                    {course?.name}
                  </span>
                </p>
                <p>
                  料金:{" "}
                  <span className="font-semibold text-gray-900">
                    ¥{course?.price.toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>
          {/* Responsive Form Fields */}
          <div className="pt-2">
            {/* Desktop: Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                {/* Name */}
                <tr className="bg-amber-50">
                  <td className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 align-middle w-1/3">
                    <label
                      htmlFor="name"
                      className="text-xs lg:text-sm font-medium text-gray-700"
                    >
                      名前 <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 bg-white align-middle">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isAuthGroupAdmin}
                      className={`w-full px-2 lg:px-3 py-1.5 lg:py-2 text-sm lg:text-base border rounded outline-none ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } ${
                        isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="山田 太郎"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </td>
                </tr>

                {/* Company Name */}
                <tr className="bg-white">
                  <td className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="companyName"
                      className="text-xs lg:text-sm font-medium text-gray-700"
                    >
                      申請会社名 <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 bg-white align-middle">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        disabled={isAuthGroupAdmin}
                        className={`flex-1 px-2 lg:px-3 py-1.5 lg:py-2 text-sm lg:text-base border rounded outline-none ${
                          errors.companyName
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${
                          isAuthGroupAdmin
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="株式会社サンプル"
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        ※個人の方は屋号
                      </span>
                    </div>
                    {errors.companyName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.companyName}
                      </p>
                    )}
                  </td>
                </tr>

                {/* Postal Code */}
                <tr className="bg-amber-50">
                  <td className="px-4 py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="postalCode"
                      className="text-sm font-medium text-gray-700"
                    >
                      郵便番号 <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handlePostalCodeChange}
                        maxLength={8}
                        disabled={isAuthGroupAdmin}
                        className={`px-3 py-2 border rounded outline-none ${
                          errors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${
                          isAuthGroupAdmin
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="123-4567"
                      />
                    </div>
                    {errors.postalCode && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.postalCode}
                      </p>
                    )}
                  </td>
                </tr>

                {/* Prefecture */}
                <tr className="bg-white">
                  <td className="px-4 py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="prefecture"
                      className="text-sm font-medium text-gray-700"
                    >
                      都道府県 <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                    <select
                      id="prefecture"
                      name="prefecture"
                      value={formData.prefecture}
                      onChange={handleInputChange}
                      disabled={isAuthGroupAdmin}
                      className={`w-full px-3 py-2 border rounded outline-none ${
                        errors.prefecture ? "border-red-500" : "border-gray-300"
                      } ${
                        isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">選択してください</option>
                      {prefectures.map((pref) => (
                        <option key={pref} value={pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                    {errors.prefecture && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.prefecture}
                      </p>
                    )}
                  </td>
                </tr>

                {/* City */}
                <tr className="bg-amber-50">
                  <td className="px-4 py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700"
                    >
                      市区町村 <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={isAuthGroupAdmin}
                      className={`w-full px-3 py-2 border rounded outline-none ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      } ${
                        isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="渋谷区神宮前"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                    )}
                  </td>
                </tr>

                {/* Address Other */}
                <tr className="bg-white">
                  <td className="px-4 py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="addressOther"
                      className="text-sm font-medium text-gray-700"
                    >
                      住所その他
                    </label>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                    <input
                      type="text"
                      id="addressOther"
                      name="addressOther"
                      value={formData.addressOther}
                      onChange={handleInputChange}
                      disabled={isAuthGroupAdmin}
                      className={`w-full px-3 py-2 border border-gray-300 rounded outline-none ${
                        isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="1-1-1 学ぼうビル 3階"
                    />
                  </td>
                </tr>

                {/* Phone Number */}
                <tr className="bg-amber-50">
                  <td className="px-4 py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      disabled={isAuthGroupAdmin}
                      className={`w-full px-3 py-2 border rounded outline-none ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="03-1234-5678"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </td>
                </tr>

                {/* Number of Tickets - Only show for single course */}
                {!isMultiCourse && (
                  <tr className="bg-white">
                    <td className="px-4 py-3 border border-gray-300 align-middle">
                      <label
                        htmlFor="numberOfTickets"
                        className="text-sm font-medium text-gray-700"
                      >
                        チケット数 <span className="text-red-500">*</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                      <input
                        type="number"
                        id="numberOfTickets"
                        name="numberOfTickets"
                        value={formData.numberOfTickets}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 border rounded outline-none ${
                          errors.numberOfTickets
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="1"
                      />
                      {errors.numberOfTickets && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.numberOfTickets}
                        </p>
                      )}
                    </td>
                  </tr>
                )}

                {/* Email Address */}
                <tr className="bg-amber-50">
                  <td className="px-4 py-3 border border-gray-300 align-middle">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isAuthGroupAdmin}
                      className={`w-full px-3 py-2 border rounded outline-none ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } ${
                        isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet: Card Layout */}
            <div className="md:hidden space-y-4">
              {/* Name */}
              <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="name-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name-mobile"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="山田 太郎"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Company Name */}
              <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="companyName-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  申請会社名 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="companyName-mobile"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    disabled={isAuthGroupAdmin}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                      errors.companyName
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${
                      isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="株式会社サンプル"
                  />
                  <span className="text-xs text-gray-500 block">
                    ※個人の方は屋号
                  </span>
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="postalCode-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode-mobile"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handlePostalCodeChange}
                  maxLength={8}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                    errors.postalCode ? "border-red-500" : "border-gray-300"
                  } ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="123-4567"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Prefecture */}
              <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="prefecture-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  id="prefecture-mobile"
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleInputChange}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                    errors.prefecture ? "border-red-500" : "border-gray-300"
                  } ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">選択してください</option>
                  {prefectures.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
                {errors.prefecture && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.prefecture}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="city-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  市区町村 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city-mobile"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="渋谷区神宮前"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              {/* Address Other */}
              <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="addressOther-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  住所その他
                </label>
                <input
                  type="text"
                  id="addressOther-mobile"
                  name="addressOther"
                  value={formData.addressOther}
                  onChange={handleInputChange}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded outline-none ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="1-1-1 学ぼうビル 3階"
                />
              </div>

              {/* Phone Number */}
              <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="phoneNumber-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber-mobile"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                    errors.phoneNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="03-1234-5678"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Number of Tickets - Only show for single course */}
              {!isMultiCourse && (
                <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                  <label
                    htmlFor="numberOfTickets-mobile"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                  >
                    チケット数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="numberOfTickets-mobile"
                    name="numberOfTickets"
                    value={formData.numberOfTickets}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                      errors.numberOfTickets
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="1"
                  />
                  {errors.numberOfTickets && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.numberOfTickets}
                    </p>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                <label
                  htmlFor="email-mobile"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email-mobile"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isAuthGroupAdmin}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } ${
                    isAuthGroupAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm sm:text-base font-medium rounded transition-colors cursor-pointer flex items-center justify-center"
            >
              次へ
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupAdminInfoForm;
