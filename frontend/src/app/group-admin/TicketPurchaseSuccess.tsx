import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useHandleTicketPurchaseSuccessMutation } from "../../api/group-admin/groupAdminApi";

const TicketPurchaseSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [handleSuccess, { isLoading }] =
    useHandleTicketPurchaseSuccessMutation();

  const [tickets, setTickets] = useState<
    Array<{
      ticketId: string;
      loginId: string;
      password: string;
      status: string;
    }>
  >([]);
  const [courseInfo, setCourseInfo] = useState<{
    courseId: string;
    courseName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [, setRetryCount] = useState(0);
  const [showTicketPasswords, setShowTicketPasswords] = useState<{
    [key: string]: boolean;
  }>({});

  const processPayment = useCallback(
    async (sessionId: string, currentRetryCount: number) => {
      try {
        const response = await handleSuccess({ sessionId }).unwrap();

        if (response.success) {
          // Check if tickets exist (even if already processed)
          if (response.tickets && response.tickets.length > 0) {
            setTickets(response.tickets);
            setCourseInfo({
              courseId: response.courseId || "",
              courseName: response.courseName || "",
            });
            setIsProcessed(true);
            setError(null); // Clear any previous errors
          } else {
            setError("チケット情報が見つかりませんでした");
          }
        }
      } catch (err) {
        console.error("Failed to process payment:", err);

        // Check if error is due to already processed session
        const errorData =
          err && typeof err === "object" && "data" in err
            ? (err as { data?: any }).data
            : undefined;

        // If it's a 400 error with alreadyProcessed or if tickets exist, treat as success
        if (
          errorData?.alreadyProcessed ||
          (errorData?.tickets && errorData.tickets.length > 0)
        ) {
          setTickets(errorData.tickets || []);
          setCourseInfo({
            courseId: errorData.courseId || "",
            courseName: errorData.courseName || "",
          });
          setIsProcessed(true);
          setError(null); // Clear error since we successfully retrieved tickets
          return;
        }

        // Retry logic: if retry count is less than 2, retry after a delay
        // This handles cases where the backend processed successfully but response was lost
        if (currentRetryCount < 2) {
          const newRetryCount = currentRetryCount + 1;
          setRetryCount(newRetryCount);
          setTimeout(() => {
            processPayment(sessionId, newRetryCount);
          }, 2000 * newRetryCount); // Exponential backoff: 2s, 4s
          return;
        }

        const errorMessage =
          errorData?.message || "チケット購入の処理に失敗しました";
        setError(errorMessage);
      }
    },
    [handleSuccess]
  );

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("セッションIDが見つかりません");
      return;
    }

    // Prevent multiple executions if already processed
    if (isProcessed) {
      return;
    }

    processPayment(sessionId, 0);
  }, [searchParams, processPayment, isProcessed]);

  const copyAllCredentials = () => {
    const credentialsText = tickets
      .map(
        (ticket, index) =>
          `【チケット ${index + 1}】\nID: ${ticket.loginId}\nパスワード: ${
            ticket.password
          }\n`
      )
      .join("\n");

    navigator.clipboard.writeText(credentialsText);
    alert("すべての認証情報をクリップボードにコピーしました");
  };

  const downloadCredentials = () => {
    const credentialsText =
      `${courseInfo?.courseName || "コース"} - ログイン情報\n\n` +
      tickets
        .map(
          (ticket, index) =>
            `【チケット ${index + 1}】\nログインID: ${
              ticket.loginId
            }\nパスワード: ${ticket.password}\n`
        )
        .join("\n");

    const blob = new Blob([credentialsText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-700 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">チケット情報を処理中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <XCircle size={64} strokeWidth={1.5} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 tracking-wide">
            エラーが発生しました
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/group-admin/ticket-sale")}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!isProcessed || tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-700 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">処理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} strokeWidth={1.5} className="text-green-500" />
        </div>

        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-4 tracking-wide">
          チケット購入完了！
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          {courseInfo?.courseName} の {tickets.length}{" "}
          枚のチケットを購入しました
        </p>

        {/* Student Tickets Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
              ログイン情報
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyAllCredentials}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
              >
                すべてコピー
              </button>
              <button
                onClick={downloadCredentials}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
              >
                ダウンロード
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.ticketId}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    チケット {index + 1}
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `ID: ${ticket.loginId}\nPassword: ${ticket.password}`
                      );
                      alert("コピーしました");
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
                  >
                    コピー
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium text-gray-700 min-w-[120px]">
                      ログインID:
                    </span>
                    <code className="bg-white px-4 py-2 rounded border border-gray-300 flex-1 font-mono text-sm break-all">
                      {ticket.loginId}
                    </code>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium text-gray-700 min-w-[120px]">
                      パスワード:
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <code className="bg-white px-4 py-2 rounded border border-gray-300 flex-1 font-mono text-sm break-all">
                        {showTicketPasswords[ticket.ticketId]
                          ? ticket.password
                          : "●".repeat(ticket.password.length)}
                      </code>
                      <button
                        onClick={() =>
                          setShowTicketPasswords((prev) => ({
                            ...prev,
                            [ticket.ticketId]: !prev[ticket.ticketId],
                          }))
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
                        title={
                          showTicketPasswords[ticket.ticketId]
                            ? "パスワードを隠す"
                            : "パスワードを表示"
                        }
                      >
                        {showTicketPasswords[ticket.ticketId] ? (
                          <EyeOff size={20} className="text-gray-600" />
                        ) : (
                          <Eye size={20} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-400 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-900 flex items-center gap-2 mb-4">
            <AlertCircle size={20} strokeWidth={1.5} />
            重要な注意事項
          </h3>
          <ul className="space-y-2 text-yellow-900 text-sm leading-relaxed">
            <li className="flex gap-2">
              <span className="text-yellow-600 flex-shrink-0">•</span>
              <span>これらのログイン情報は生徒に配布してください</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 flex-shrink-0">•</span>
              <span>各チケットは1回のみ使用可能です</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 flex-shrink-0">•</span>
              <span>生徒はこのIDとパスワードでログインできます</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 flex-shrink-0">•</span>
              <span>ダッシュボードからいつでも確認できます</span>
            </li>
          </ul>
        </div>

        {/* Dashboard Button */}
        <button
          onClick={() => navigate("/group-admin/ticket-sale")}
          className="w-full px-6 py-4 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-lg"
        >
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
};

export default TicketPurchaseSuccess;
