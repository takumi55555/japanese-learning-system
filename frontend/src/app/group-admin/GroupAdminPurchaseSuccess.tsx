import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Mail, AlertCircle, XCircle } from "lucide-react";
import { getApiUrl } from "../../utils/apiConfig";

const GroupAdminPurchaseSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedRef = useRef(false);

  const [purchaseInfo, setPurchaseInfo] = useState<{
    email: string;
    ticketCount: number;
    courseName: string;
    emailSent?: boolean;
    isMultiCourse?: boolean;
    ticketGroups?: Array<{
      ticketGroupId: string;
      courseId: string;
      courseName: string;
      tickets: Array<{
        ticketId: string;
        loginId: string;
        password: string;
        status: string;
      }>;
    }>;
    groupAdminCredentials?: {
      username: string;
      email: string;
      password: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent duplicate processing
    if (hasProcessedRef.current) {
      return;
    }

    // Reset states when component mounts or sessionId changes
    setError(null);
    setErrorDetails(null);
    setPurchaseInfo(null);
    setIsLoading(true);

    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("セッションIDが見つかりません");
      setIsLoading(false);
      return;
    }

    // Mark as processing to prevent duplicate calls
    hasProcessedRef.current = true;

    const processPayment = async () => {
      try {
        const API_URL = getApiUrl();
        console.log("📤 Sending request to backend with sessionId:", sessionId);

        const response = await fetch(
          `${API_URL}/api/group-admin/purchase-success-public`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        console.log("📥 Response status:", response.status);
        console.log("📥 Response ok:", response.ok);

        let data;
        try {
          const text = await response.text();
          console.log("📥 Response text:", text);
          data = JSON.parse(text);
          console.log("📥 Response data:", data);
        } catch (parseError) {
          console.error("❌ Failed to parse response:", parseError);
          setError("サーバーからの応答を解析できませんでした");
          setErrorDetails(
            "Response parsing error: " +
              (parseError instanceof Error
                ? parseError.message
                : String(parseError))
          );
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          console.error("❌ HTTP Error:", response.status, data);
          setError(data.message || `サーバーエラー (${response.status})`);
          setErrorDetails(data.error || data.details || null);
          setIsLoading(false);
          return;
        }

        if (data.success) {
          console.log("✅ Success! Setting purchase info:", data);
          setError(null);
          setErrorDetails(null);

          // Handle multi-course purchase
          if (data.isMultiCourse && data.ticketGroups) {
            const totalTickets = data.ticketGroups.reduce(
              (sum: number, group: { tickets: Array<unknown> }) =>
                sum + group.tickets.length,
              0
            );
            setPurchaseInfo({
              email: data.groupAdminCredentials?.email || data.email || "",
              ticketCount: totalTickets,
              courseName:
                data.ticketGroups.length > 1
                  ? `${data.ticketGroups.length}講座`
                  : data.ticketGroups[0]?.courseName || "",
              emailSent: data.emailSent !== false,
              isMultiCourse: true,
              ticketGroups: data.ticketGroups,
              groupAdminCredentials: data.groupAdminCredentials,
            });
          } else {
            // Single course purchase
            setPurchaseInfo({
              email: data.email || data.groupAdminCredentials?.email || "",
              ticketCount: data.ticketCount || 0,
              courseName: data.courseName || "",
              emailSent: data.emailSent !== false,
              isMultiCourse: false,
              groupAdminCredentials: data.groupAdminCredentials,
            });
          }
          setIsLoading(false);
        } else {
          console.error("❌ Error from backend:", data.message);
          setError(data.message || "購入処理に失敗しました");
          setErrorDetails(data.details || null);
          setIsLoading(false);
          // Reset processing flag on error so user can retry if needed
          hasProcessedRef.current = false;
        }
      } catch (err) {
        console.error("❌ Failed to process payment:", err);
        console.error("❌ Error details:", {
          name: err instanceof Error ? err.name : "Unknown",
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });

        // Only set error if it's a real error, not a successful response
        if (err instanceof TypeError && err.message.includes("fetch")) {
          setError(
            "ネットワークエラーが発生しました。インターネット接続を確認してください。"
          );
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "不明なエラー";
          setError("購入処理中にエラーが発生しました: " + errorMessage);
        }
        setIsLoading(false);
        // Reset processing flag on error so user can retry if needed
        hasProcessedRef.current = false;
      }
    };

    processPayment();
  }, [searchParams]);

  const handleLogin = () => {
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">チケット情報を処理中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="flex justify-center mb-4">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            エラーが発生しました
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          {errorDetails && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-left text-sm">
              <p className="text-yellow-800">{errorDetails}</p>
            </div>
          )}
          <button
            onClick={() => navigate("/courses")}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            コース一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!purchaseInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">処理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={56} className="text-green-600" />
        </div>

        {/* Main Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            購入が完了しました
          </h1>
          <p className="text-gray-600">
            {purchaseInfo.isMultiCourse ? (
              <>
                <span className="font-semibold">{purchaseInfo.courseName}</span>
                のチケット合計{" "}
                <span className="font-bold text-green-600">
                  {purchaseInfo.ticketCount}
                </span>
                枚を購入しました
              </>
            ) : (
              <>
                <span className="font-semibold">{purchaseInfo.courseName}</span>
                のチケット{" "}
                <span className="font-bold text-green-600">
                  {purchaseInfo.ticketCount}
                </span>
                枚を購入しました
              </>
            )}
          </p>
        </div>

        {/* Email Notification Section */}
        {purchaseInfo.emailSent ? (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  チケット情報をメールで送信しました
                </h3>
                <p className="text-sm text-gray-600">
                  ご登録のメールアドレスに送信いたしました
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  チケット情報が作成されました
                </h3>
                <div className="bg-white rounded p-3 mb-3 border border-yellow-100">
                  <p className="text-xs text-gray-500 mb-1">
                    登録メールアドレス
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {purchaseInfo.email}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  メール送信機能は現在設定されていません。グループ管理者ダッシュボードから全てのチケット情報を確認できます。
                </p>
                <div className="bg-white rounded p-3 border border-yellow-100">
                  <p className="text-xs font-semibold text-gray-900 mb-2">
                    次のステップ
                  </p>
                  <ol className="text-xs text-gray-700 space-y-1 ml-4 list-decimal">
                    <li>上記のメールアドレスでログイン</li>
                    <li>ダッシュボードでチケット情報を確認</li>
                    <li>学生にチケット情報を配布</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Details for Multi-Course Purchase */}
        {purchaseInfo.isMultiCourse && purchaseInfo.ticketGroups && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              購入した講座一覧
            </h3>
            <div className="space-y-2">
              {purchaseInfo.ticketGroups.map((group) => (
                <div
                  key={group.ticketGroupId}
                  className="bg-white rounded p-3 border border-blue-100"
                >
                  <p className="font-semibold text-gray-900">
                    {group.courseName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    チケット数: {group.tickets.length}枚
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-yellow-600" />
            重要なお知らせ
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {purchaseInfo.emailSent && (
              <li>
                メールが届かない場合は、<strong>迷惑メールフォルダ</strong>
                をご確認ください。
              </li>
            )}
            {purchaseInfo.emailSent && (
              <li>
                PDFファイルには機密情報が含まれています。安全に保管してください。
              </li>
            )}
            <li>
              グループ管理者ダッシュボードから、いつでもチケット情報を確認できます。
            </li>
            <li>各学生にチケット情報を配布してください。</li>
          </ul>
        </div>

        {/* Email Check Notice */}
        {purchaseInfo.emailSent && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 text-center">
            <p className="text-sm text-gray-700">
              メールが見つからない場合は、{" "}
              <a
                href="mailto:support@manabou.co.jp"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                support@manabou.co.jp
              </a>
              までお問い合わせください。
            </p>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded transition-colors"
        >
          ログインページへ
        </button>
      </div>
    </div>
  );
};

export default GroupAdminPurchaseSuccess;
