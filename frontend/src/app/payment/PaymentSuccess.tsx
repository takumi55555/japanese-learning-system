import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Copy, Check } from "lucide-react";
import { getAuthToken } from "../../api/auth/authService";
import { useToast } from "../../hooks/useToast";
import { getApiUrl } from "../../utils/apiConfig";

interface StudentCredentials {
  id: string;
  password: string;
  email: string;
  courseId: string;
  courseName: string;
}

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<StudentCredentials | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const hasProcessedRef = useRef(false);
  const { showToast } = useToast();

  const sessionId = searchParams.get("session_id");

  const handlePaymentSuccess = useCallback(async () => {
    if (hasProcessedRef.current) return;

    hasProcessedRef.current = true;
    try {
      const API_URL = getApiUrl();
      const token = getAuthToken();

      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await fetch(`${API_URL}/api/payment/success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "支払いの確認に失敗しました");
      }

      // Check if user was already enrolled
      if (data.alreadyEnrolled) {
        setAlreadyEnrolled(true);
        showToast({
          type: "info",
          title: "既に登録済みのコースです",
          message:
            "新しい支払いは発生しておりません。既存のログイン情報が表示されています。",
          duration: 6000,
        });
      } else {
        showToast({
          type: "success",
          title: "お支払いが完了しました！",
          message: `${data.credentials?.courseName}へのアクセスが可能になりました。`,
          duration: 5000,
        });
      }

      setCredentials(data.credentials);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "エラーが発生しました";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  useEffect(() => {
    if (sessionId && !hasProcessedRef.current) {
      handlePaymentSuccess();
    } else if (!sessionId) {
      setError("セッションIDが見つかりません");
      setLoading(false);
    }
  }, [sessionId, handlePaymentSuccess]);

  const copyToClipboard = (text: string, type: "id" | "password") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      showToast({
        type: "success",
        title: "コピーしました",
        message: "ユーザーIDをクリップボードにコピーしました",
        duration: 2000,
      });
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      showToast({
        type: "success",
        title: "コピーしました",
        message: "パスワードをクリップボードにコピーしました",
        duration: 2000,
      });
    }
  };

  const handleGoToHomepage = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">処理中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
              <CheckCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/courses")}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors cursor-pointer border border-primary-500"
            >
              コース選択に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {alreadyEnrolled
              ? "既に登録済みのコースです"
              : "購入が完了しました！"}
          </h1>
          <p className="text-gray-600">
            {alreadyEnrolled
              ? `${credentials?.courseName}に既に登録されています。`
              : `${credentials?.courseName}へのアクセスが可能になりました。`}
          </p>
        </div>

        {/* Credentials - Simple Design */}
        <div className="mb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                ユーザーID
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-3">
                <span className="flex-1 font-mono text-sm text-gray-800">
                  {credentials?.id}
                </span>
                <button
                  onClick={() => copyToClipboard(credentials?.id || "", "id")}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                パスワード
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-3">
                <span className="flex-1 font-mono text-sm text-gray-800">
                  {credentials?.password}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(credentials?.password || "", "password")
                  }
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {copiedPassword ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice - Simple */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2 text-sm">
            重要なお知らせ
          </h3>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li>1. ログイン情報は安全に保管してください</li>
            <li>2. パスワードは他の人と共有しないでください</li>
            <li>
              3. ログイン情報を忘れた場合は、サポートまでお問い合わせください
            </li>
          </ul>
        </div>

        {/* Action Button - Full Radius */}
        <div className="text-center">
          <button
            onClick={handleGoToHomepage}
            className="w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base rounded-full transition-colors shadow-sm hover:shadow-md"
          >
            ログインページへ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
