import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { getApiUrl } from "../../utils/apiConfig";

interface Course {
  id: string;
  name: string;
  price: number;
}

const GroupAdminPurchase: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const course = location.state?.course as Course;
  const ticketCount = location.state?.ticketCount as number;
  const email = location.state?.email as string;

  const createPaymentSession = React.useCallback(async () => {
    if (!course || !ticketCount || !email) {
      showToast({
        type: "error",
        title: "エラー",
        message: "コース情報またはメールアドレスが見つかりません",
      });
      navigate("/courses");
      return;
    }

    try {
      const API_URL = getApiUrl();

      const response = await fetch(
        `${API_URL}/api/group-admin/create-ticket-session-public`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: course.id,
            ticketCount: ticketCount,
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Redirect to Stripe payment
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.message || "支払いセッションの作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create payment session:", error);
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : undefined;
      showToast({
        type: "error",
        title: "エラー",
        message: errorMessage || "支払いセッションの作成に失敗しました",
      });
      navigate("/courses");
    }
  }, [course, ticketCount, email, navigate, showToast]);

  useEffect(() => {
    createPaymentSession();
  }, [createPaymentSession]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-700 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-wide">
          支払いページに移動中...
        </h2>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">送信先:</span>
            <span className="text-gray-900 font-semibold text-sm">{email}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">コース:</span>
            <span className="text-gray-900 font-semibold">{course?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">チケット数:</span>
            <span className="text-gray-900 font-semibold">{ticketCount}枚</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          Stripeの安全な支払いページに自動的にリダイレクトされます...
        </p>
      </div>
    </div>
  );
};

export default GroupAdminPurchase;
