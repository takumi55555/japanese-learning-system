import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, CheckCircle, ArrowLeft } from "lucide-react";
import {
  isAuthenticated,
  getStoredUser,
  getAuthToken,
} from "../../api/auth/authService";
import { useToast } from "../../hooks/useToast";
import { getApiUrl } from "../../utils/apiConfig";

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  features: string[];
}

interface CourseTicketCount {
  courseId: string;
  courseName: string;
  price: number;
  ticketCount: string;
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

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const course = location.state?.course as Course | undefined;
  const courses = location.state?.courses as CourseTicketCount[] | undefined;
  const groupAdminInfo = location.state?.groupAdminInfo as
    | GroupAdminInfo
    | undefined;
  const isAuthenticatedGroupAdmin = location.state
    ?.isAuthenticatedGroupAdmin as boolean | undefined;
  const initialTicketCount = location.state?.ticketCount as string | undefined;

  const user = getStoredUser();
  const isGroupAdmin = user?.role === "group_admin";

  // Determine if this is a multi-course purchase
  const isMultiCourse = courses && courses.length > 0;

  // State for authenticated group admin ticket count (single course only)
  const [ticketCount, setTicketCount] = useState<string>(
    initialTicketCount || "1"
  );

  useEffect(() => {
    // Check if course data exists (single or multi)
    if (!course && !courses) {
      navigate("/courses");
      return;
    }

    // If group admin info exists, skip authentication check (public purchase)
    // If authenticated group admin, no need to fetch profile for payment page
    // Otherwise, check if user is authenticated - redirect to login if not
    if (!groupAdminInfo && !isAuthenticatedGroupAdmin && !isAuthenticated()) {
      navigate("/login", { state: { from: location, course: course } });
      return;
    }
  }, [
    navigate,
    course,
    courses,
    location,
    groupAdminInfo,
    isAuthenticatedGroupAdmin,
  ]);

  if (!course && !courses) {
    return null;
  }

  const handlePayment = async () => {
    try {
      setLoading(true);

      const API_URL = getApiUrl();

      // If student, use student payment endpoint
      if (user?.role === "student" && course) {
        const token = getAuthToken();
        
        const response = await fetch(
          `${API_URL}/api/payment/create-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              courseId: course.id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "支払いセッションの作成に失敗しました"
          );
        }

        // Show success toast before redirect
        showToast({
          type: "success",
          title: "支払いセッションを作成しました",
          message: "Stripe決済画面にリダイレクトしています...",
          duration: 2000,
        });

        // Small delay to show toast, then redirect
        setTimeout(() => {
          window.location.href = data.sessionUrl;
        }, 1000);
        return;
      }

      // If authenticated group admin, use authenticated endpoint
      if (isAuthenticatedGroupAdmin && isGroupAdmin) {
        const token = getAuthToken();

        if (isMultiCourse) {
          // Multi-course purchase
          const courseData = courses!.map((c) => ({
            courseId: c.courseId,
            ticketCount: parseInt(c.ticketCount, 10),
          }));

          // Validate all ticket counts
          for (const c of courseData) {
            if (!c.ticketCount || c.ticketCount < 1 || c.ticketCount > 100) {
              showToast({
                type: "error",
                title: "エラー",
                message: "各講座のチケット数は1から100の間で指定してください",
                duration: 4000,
              });
              setLoading(false);
              return;
            }
          }

          const response = await fetch(
            `${API_URL}/api/group-admin/create-multi-ticket-session`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                courses: courseData,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "支払いセッションの作成に失敗しました"
            );
          }

          // Show success toast before redirect
          showToast({
            type: "success",
            title: "支払いセッションを作成しました",
            message: "Stripe決済画面にリダイレクトしています...",
            duration: 2000,
          });

          // Small delay to show toast, then redirect
          setTimeout(() => {
            window.location.href = data.sessionUrl;
          }, 1000);
          return;
        } else {
          // Single course purchase
          // Validate ticket count
          const count = parseInt(ticketCount, 10);
          if (!count || count < 1 || count > 100) {
            showToast({
              type: "error",
              title: "エラー",
              message: "チケット数は1から100の間で指定してください",
              duration: 4000,
            });
            setLoading(false);
            return;
          }

          const response = await fetch(
            `${API_URL}/api/group-admin/create-ticket-session`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                courseId: course!.id,
                ticketCount: count,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "支払いセッションの作成に失敗しました"
            );
          }

          // Show success toast before redirect
          showToast({
            type: "success",
            title: "支払いセッションを作成しました",
            message: "Stripe決済画面にリダイレクトしています...",
            duration: 2000,
          });

          // Small delay to show toast, then redirect
          setTimeout(() => {
            window.location.href = data.sessionUrl;
          }, 1000);
        }
      } else if (groupAdminInfo) {
        // If group admin info exists, use public group admin purchase endpoint
        if (isMultiCourse) {
          // Multi-course purchase
          const courseData = courses!.map((c) => ({
            courseId: c.courseId,
            courseName: c.courseName,
            price: c.price,
            ticketCount: parseInt(c.ticketCount, 10),
          }));

          // Validate all ticket counts
          for (const c of courseData) {
            if (!c.ticketCount || c.ticketCount < 1 || c.ticketCount > 100) {
              showToast({
                type: "error",
                title: "エラー",
                message: "各講座のチケット数は1から100の間で指定してください",
                duration: 4000,
              });
              setLoading(false);
              return;
            }
          }

          console.log("📤 Sending multi-course purchase request:", {
            courses: courseData,
            email: groupAdminInfo.email,
          });

          const requestBody = {
            courses: courseData,
            email: groupAdminInfo.email,
            name: groupAdminInfo.name,
            companyName: groupAdminInfo.companyName,
            postalCode: groupAdminInfo.postalCode,
            prefecture: groupAdminInfo.prefecture,
            city: groupAdminInfo.city,
            addressOther: groupAdminInfo.addressOther,
            phoneNumber: groupAdminInfo.phoneNumber,
          };

          console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));

          let response;
          try {
            response = await fetch(
              `${API_URL}/api/group-admin/create-multi-ticket-session-public`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              }
            );
          } catch (fetchError) {
            console.error("❌ Fetch error:", fetchError);
            throw new Error(
              fetchError instanceof Error
                ? fetchError.message
                : "ネットワークエラーが発生しました。サーバーに接続できません。"
            );
          }

          console.log("📥 Response status:", response.status);
          console.log("📥 Response ok:", response.ok);

          if (!response.ok) {
            let errorText;
            try {
              errorText = await response.text();
            } catch {
              errorText = `サーバーエラー (${response.status})`;
            }

            console.error("❌ Error response:", errorText);
            console.error("❌ Response status:", response.status);

            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = {
                message:
                  response.status === 502
                    ? "サーバーが応答できません。しばらく待ってから再度お試しください。"
                    : errorText || "サーバーエラーが発生しました",
              };
            }
            
            // If requiresLogin flag is set, redirect to login page
            if (errorData.requiresLogin) {
              showToast({
                type: "error",
                title: "ログインが必要です",
                message: errorData.message || "再度購入するには、ログインしてください。",
                duration: 5000,
              });
              navigate("/login", {
                state: {
                  from: location,
                  courses: courses,
                  groupAdminInfo: groupAdminInfo,
                },
              });
              setLoading(false);
              return;
            }
            
            throw new Error(
              errorData.message || `サーバーエラー (${response.status})`
            );
          }

          let data;
          try {
            const responseText = await response.text();
            console.log("📥 Response text:", responseText);
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("❌ Failed to parse response:", parseError);
            throw new Error("サーバーからの応答を解析できませんでした");
          }

          if (!response.ok) {
            throw new Error(
              data.message || "支払いセッションの作成に失敗しました"
            );
          }

          // Show success toast before redirect
          showToast({
            type: "success",
            title: "支払いセッションを作成しました",
            message: "Stripe決済画面にリダイレクトしています...",
            duration: 2000,
          });

          // Small delay to show toast, then redirect
          setTimeout(() => {
            window.location.href = data.sessionUrl;
          }, 1000);
          return;
        } else {
          // Single course purchase
          const response = await fetch(
            `${API_URL}/api/group-admin/create-ticket-session-public`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courseId: course!.id,
                ticketCount: parseInt(groupAdminInfo.numberOfTickets, 10),
                email: groupAdminInfo.email,
                name: groupAdminInfo.name,
                companyName: groupAdminInfo.companyName,
                postalCode: groupAdminInfo.postalCode,
                prefecture: groupAdminInfo.prefecture,
                city: groupAdminInfo.city,
                addressOther: groupAdminInfo.addressOther,
                phoneNumber: groupAdminInfo.phoneNumber,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "支払いセッションの作成に失敗しました"
            );
          }

          // Show success toast before redirect
          showToast({
            type: "success",
            title: "支払いセッションを作成しました",
            message: "Stripe決済画面にリダイレクトしています...",
            duration: 2000,
          });

          // Small delay to show toast, then redirect
          setTimeout(() => {
            window.location.href = data.sessionUrl;
          }, 1000);
        }
      } else {
        // Regular student course enrollment (single course only)
        const token = localStorage.getItem("authToken");

        const response = await fetch(`${API_URL}/api/payment/create-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: course!.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if user is already enrolled
          if (data.alreadyEnrolled) {
            showToast({
              type: "info",
              title: "既に登録済みのコースです",
              message: `${
                data.message || "このコースには既に登録されています"
              }\n登録日: ${new Date(
                data.enrollment?.enrollmentAt
              ).toLocaleDateString("ja-JP")}\nステータス: ${
                data.enrollment?.status
              }`,
              duration: 8000,
            });
            return;
          }
          throw new Error(
            data.message || "支払いセッションの作成に失敗しました"
          );
        }

        // Show success toast before redirect
        showToast({
          type: "success",
          title: "支払いセッションを作成しました",
          message: "Stripe決済画面にリダイレクトしています...",
          duration: 2000,
        });

        // Small delay to show toast, then redirect
        setTimeout(() => {
          window.location.href = data.sessionUrl;
        }, 1000);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "支払いの処理中にエラーが発生しました";
      showToast({
        type: "error",
        title: "支払いエラー",
        message: message,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (groupAdminInfo) {
      // If coming from group admin form, go back to that page
      navigate("/group-admin/info-form", {
        state: {
          course: course,
          courses: courses,
        },
      });
    } else {
      // Otherwise go back to courses page
      navigate("/courses");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Image Section */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
        <img
          src="/img/payment.png"
          alt="お支払い"
          className="w-full h-full object-cover"
        />
        <div className="absolute bg-black/20 inset-0 bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-gray-800 px-4">
            <h1 className="text-7xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
              お支払い
            </h1>
            <p className="text-lg sm:text-base md:text-lg lg:text-xl max-w-[700px] mx-auto">
              {isMultiCourse
                ? `${courses!.length}講座の受講料金をお支払いください`
                : `${course!.name}の受講料金をお支払いください`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Go Back Link */}
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Course Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {isMultiCourse ? "選択された講座" : "コース詳細"}
              </h2>

              <div className="space-y-4">
                {isMultiCourse ? (
                  // Multi-course display
                  <div className="space-y-4">
                    {courses!.map((c) => {
                      return (
                        <div
                          key={c.courseId}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h3 className="text-lg font-semibold text-gray-900">
                            {c.courseName}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              チケット数: {c.ticketCount}枚
                            </p>
                            <p className="text-sm text-gray-600">
                              単価: ¥{c.price.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              小計: ¥
                              {(
                                c.price * parseInt(c.ticketCount, 10)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          合計
                        </span>
                        <span className="text-xl font-bold text-primary-600">
                          ¥
                          {courses!
                            .reduce(
                              (sum, c) =>
                                sum + c.price * parseInt(c.ticketCount, 10),
                              0
                            )
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Single course display
                  <>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course!.name}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {course!.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-gray-200">
                      <span className="text-base font-medium text-gray-900">
                        期間
                      </span>
                      <span className="text-base text-gray-600">
                        {course!.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-gray-200">
                      <span className="text-base font-medium text-gray-900">
                        レベル
                      </span>
                      <span className="text-base text-gray-600">
                        {course!.level}
                      </span>
                    </div>

                    <div className="py-4 border-t border-gray-200">
                      <h4 className="text-base font-medium text-gray-900 mb-3">
                        コース内容
                      </h4>
                      <ul className="space-y-2">
                        {course!.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">お支払い</h2>

              {/* Ticket Count Input for Authenticated Group Admin (Single course only) */}
              {isAuthenticatedGroupAdmin && isGroupAdmin && !isMultiCourse && (
                <div className="mb-6 bg-gray-50 rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      チケット数
                    </h3>
                    <label
                      htmlFor="ticketCount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      チケット数 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="ticketCount"
                      min="1"
                      max="100"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded outline-none bg-white text-gray-900"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      1から100の間で指定してください
                    </p>
                  </div>
                </div>
              )}

              {/* Price Display */}
              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  {isMultiCourse ? (
                    <>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        ¥
                        {courses!
                          .reduce(
                            (sum, c) =>
                              sum + c.price * parseInt(c.ticketCount, 10),
                            0
                          )
                          .toLocaleString()}
                      </div>
                      <div className="text-gray-600">
                        {courses!.reduce(
                          (sum, c) => sum + parseInt(c.ticketCount, 10),
                          0
                        )}
                        枚のチケット
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ({courses!.length}講座)
                      </div>
                    </>
                  ) : isAuthenticatedGroupAdmin && isGroupAdmin ? (
                    <>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        ¥
                        {(
                          course!.price * parseInt(ticketCount || "1", 10)
                        ).toLocaleString()}
                      </div>
                      <div className="text-gray-600">
                        {ticketCount || "1"}枚のチケット
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        (1枚あたり ¥{course!.price.toLocaleString()})
                      </div>
                    </>
                  ) : groupAdminInfo ? (
                    <>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        ¥
                        {(
                          course!.price *
                          parseInt(groupAdminInfo.numberOfTickets, 10)
                        ).toLocaleString()}
                      </div>
                      <div className="text-gray-600">
                        {groupAdminInfo.numberOfTickets}枚のチケット
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        (1枚あたり ¥{course!.price.toLocaleString()})
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        ¥{course!.price.toLocaleString()}
                      </div>
                      <div className="text-gray-600">月額料金</div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  お支払い方法
                </h3>
              </div>

              {/* Security Notice */}
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg mb-6">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-green-800 mb-1">
                    安全なお支払い
                  </h4>
                  <p className="text-xs text-green-700">
                    Stripeを使用した安全な決済システムです。カード情報は暗号化されて処理されます。
                  </p>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={
                  loading ||
                  (isAuthenticatedGroupAdmin &&
                    isGroupAdmin &&
                    (!ticketCount ||
                      parseInt(ticketCount, 10) < 1 ||
                      parseInt(ticketCount, 10) > 100))
                }
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? "処理中..." : "今すぐ支払う"}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                お支払いを完了することで、
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  利用規約
                </a>
                および
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  プライバシーポリシー
                </a>
                に同意したものとみなされます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
