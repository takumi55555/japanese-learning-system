import React, { useState, useRef } from "react";
import { Ticket, UserPlus, Upload, X } from "lucide-react";
import {
  useGetTicketGroupsQuery,
  useAssignStudentInfoMutation,
} from "../../api/group-admin/groupAdminApi";
import { useToast } from "../../hooks/useToast";
import { getStoredUser } from "../../api/auth/authService";
import {
  loadFaceApiModels,
  getFaceDescriptor,
  base64ToImage,
} from "../../utils/faceRecognition";

const GroupAdminDashboard: React.FC = () => {
  const { data: ticketGroupsData, isLoading: groupsLoading } =
    useGetTicketGroupsQuery();
  const [assignStudentInfo, { isLoading: isAssigning }] =
    useAssignStudentInfoMutation();
  const { showToast } = useToast();

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [activeTabCourseId, setActiveTabCourseId] = useState<string | null>(
    null
  );
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    birthday: "",
    email: "",
  });
  const [facePhoto, setFacePhoto] = useState<{
    file: File | null;
    preview: string | null;
    descriptor: Float32Array | null;
  }>({
    file: null,
    preview: null,
    descriptor: null,
  });
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and filter states
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("all"); // "all", "unused", "used"

  const handleResetStudentForm = () => {
    setSelectedCourseIds([]);
    setSelectedTicketIds([]);
    setActiveTabCourseId(null);
    setStudentFormData({
      name: "",
      birthday: "",
      email: "",
    });
    setFacePhoto({
      file: null,
      preview: null,
      descriptor: null,
    });
  };

  const handleFacePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast({
        type: "error",
        title: "エラー",
        message: "画像ファイルを選択してください",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: "error",
        title: "エラー",
        message: "画像サイズは5MB以下にしてください",
      });
      return;
    }

    setIsProcessingFace(true);

    try {
      // Load face recognition models
      const modelsLoaded = await loadFaceApiModels();
      if (!modelsLoaded) {
        throw new Error("顔認識モデルの読み込みに失敗しました");
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setFacePhoto((prev) => ({ ...prev, preview: base64 }));

        // Extract face descriptor
        try {
          const img = await base64ToImage(base64);
          const descriptor = await getFaceDescriptor(img);

          if (!descriptor) {
            showToast({
              type: "error",
              title: "エラー",
              message:
                "画像から顔を検出できませんでした。顔がはっきり写っている画像を選択してください",
            });
            setFacePhoto({
              file: null,
              preview: null,
              descriptor: null,
            });
            setIsProcessingFace(false);
            return;
          }

          setFacePhoto((prev) => ({
            ...prev,
            file: file,
            descriptor: descriptor,
          }));

          showToast({
            type: "success",
            title: "成功",
            message: "顔写真を登録しました",
            duration: 2000,
          });
        } catch (error) {
          console.error("Error processing face:", error);
          showToast({
            type: "error",
            title: "エラー",
            message: "顔の処理中にエラーが発生しました",
          });
          setFacePhoto({
            file: null,
            preview: null,
            descriptor: null,
          });
        } finally {
          setIsProcessingFace(false);
        }
      };

      reader.onerror = () => {
        showToast({
          type: "error",
          title: "エラー",
          message: "画像の読み込みに失敗しました",
        });
        setIsProcessingFace(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading face photo:", error);
      showToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error
            ? error.message
            : "顔写真のアップロードに失敗しました",
      });
      setIsProcessingFace(false);
    }
  };

  const handleRemoveFacePhoto = () => {
    setFacePhoto({
      file: null,
      preview: null,
      descriptor: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTicketSelect = (
    ticketId: string,
    checked: boolean,
    courseId: string
  ) => {
    if (checked) {
      // Automatically add course to selectedCourseIds if not already there
      if (!selectedCourseIds.includes(courseId)) {
        setSelectedCourseIds([...selectedCourseIds, courseId]);
      }

      // Check if student already has a ticket for this course
      const courseTickets =
        ticketGroups
          .find((group) => group.courseId === courseId)
          ?.tickets?.filter(
            (t) => t.status === "in_use" || t.status === "used"
          ) || [];

      // Check if any ticket in this course is already assigned to this student
      if (studentFormData.email || studentFormData.name) {
        const hasTicketForCourse = courseTickets.some((ticket) => {
          if (!ticket.studentInfo) return false;
          return (
            (studentFormData.email &&
              ticket.studentInfo.email?.toLowerCase() ===
                studentFormData.email.toLowerCase()) ||
            (studentFormData.name &&
              ticket.studentInfo.name?.toLowerCase() ===
                studentFormData.name.toLowerCase())
          );
        });

        if (hasTicketForCourse) {
          showToast({
            type: "error",
            title: "エラー",
            message:
              "この講座では既にチケットが割り当てられています。一つの講座で一人の学生に一つしかチケットを割り当てられません。",
          });
          return;
        }
      }

      // Remove other tickets from the same course (radio button behavior)
      const otherTicketsFromCourse = selectedTicketIds.filter((id) => {
        const ticket = ticketGroups
          .flatMap((group) => group.tickets || [])
          .find((t) => t.ticketId === id);
        return (
          ticket &&
          ticketGroups.find((g) => g.tickets?.some((t) => t.ticketId === id))
            ?.courseId === courseId
        );
      });

      // Remove tickets from same course and add the new one
      setSelectedTicketIds([
        ...selectedTicketIds.filter(
          (id) => !otherTicketsFromCourse.includes(id)
        ),
        ticketId,
      ]);
    } else {
      setSelectedTicketIds(selectedTicketIds.filter((id) => id !== ticketId));
      // Note: We don't remove the course from selectedCourseIds when unchecking a ticket
      // This allows the course to remain in the list even after switching tabs
    }
  };

  const handleSubmitStudentForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCourseIds.length === 0) {
      showToast({
        type: "error",
        title: "エラー",
        message: "少なくとも1つの講座を選択してください",
      });
      return;
    }

    if (selectedTicketIds.length === 0) {
      showToast({
        type: "error",
        title: "エラー",
        message: "少なくとも1枚のチケットを選択してください",
      });
      return;
    }

    // Validate that each selected course has exactly one ticket selected
    for (const courseId of selectedCourseIds) {
      const ticketsFromCourse = selectedTicketIds.filter((id) => {
        const ticket = ticketGroups
          .flatMap((group) => group.tickets || [])
          .find((t) => t.ticketId === id);
        return (
          ticket &&
          ticketGroups.find((g) => g.tickets?.some((t) => t.ticketId === id))
            ?.courseId === courseId
        );
      });

      if (ticketsFromCourse.length === 0) {
        const courseName =
          ticketGroups.find((g) => g.courseId === courseId)?.courseName ||
          "選択された講座";
        showToast({
          type: "error",
          title: "エラー",
          message: `${courseName}からチケットを選択してください`,
        });
        return;
      }

      if (ticketsFromCourse.length > 1) {
        const courseName =
          ticketGroups.find((g) => g.courseId === courseId)?.courseName ||
          "選択された講座";
        showToast({
          type: "error",
          title: "エラー",
          message: `${courseName}からは1枚のチケットのみ選択できます`,
        });
        return;
      }
    }

    if (!studentFormData.name || !studentFormData.email) {
      showToast({
        type: "error",
        title: "エラー",
        message: "名前とメールアドレスは必須です",
      });
      return;
    }

    if (!facePhoto.descriptor) {
      showToast({
        type: "error",
        title: "エラー",
        message: "顔写真をアップロードしてください",
      });
      return;
    }

    try {
      // Convert Float32Array to array for JSON serialization
      const faceDescriptorArray = Array.from(facePhoto.descriptor);

      const result = await assignStudentInfo({
        ticketIds: selectedTicketIds,
        studentInfo: {
          name: studentFormData.name,
          birthday: studentFormData.birthday || undefined,
          email: studentFormData.email,
          faceDescriptor: faceDescriptorArray,
        },
      }).unwrap();

      showToast({
        type: "success",
        title: "成功",
        message: result.message,
      });

      handleResetStudentForm();
    } catch (error: unknown) {
      // Check if error message contains duplicate key or the specific error message
      let errorMessage = "学生情報の登録に失敗しました";
      const errorData = error as { data?: { message?: string } };

      if (errorData?.data?.message) {
        if (
          errorData.data.message.includes("duplicate key") ||
          errorData.data.message.includes("E11000") ||
          errorData.data.message.includes("学生情報を正確に入力してください")
        ) {
          errorMessage = "学生情報を正確に入力してください。";
        } else {
          errorMessage = errorData.data.message;
        }
      }

      showToast({
        type: "error",
        title: "エラー",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const ticketGroups = React.useMemo(
    () => ticketGroupsData?.ticketGroups || [],
    [ticketGroupsData]
  );

  // Set initial active tab if not set and there are courses available
  React.useEffect(() => {
    if (!activeTabCourseId && ticketGroups.length > 0) {
      const firstCourseWithTickets = ticketGroups.find(
        (group) => group.unusedCount > 0
      );
      if (firstCourseWithTickets) {
        setActiveTabCourseId(firstCourseWithTickets.courseId);
      }
    }
  }, [ticketGroups, activeTabCourseId]);

  // Get group admin info and log on login
  React.useEffect(() => {
    const groupAdmin = getStoredUser();

    if (groupAdmin) {
      const adminData = groupAdmin as {
        userId?: string;
        id?: string;
        username?: string;
        email?: string;
        role?: string;
      };
      console.log("👤 Group Admin Info:", {
        userId: adminData.userId || adminData.id,
        username: adminData.username,
        email: adminData.email,
        role: adminData.role,
      });
    }
  }, []);

  // Debug: Log ticket groups data
  React.useEffect(() => {
    if (ticketGroupsData) {
      console.log("📦 Ticket Groups Data:", ticketGroupsData);
      console.log("📋 Ticket Groups:", ticketGroups);
      console.log("🔢 Ticket Groups Count:", ticketGroups.length);
      ticketGroups.forEach((group, index) => {
        console.log(`Group ${index}:`, {
          courseId: group.courseId,
          courseName: group.courseName,
          ticketCount: group.ticketCount,
          unusedCount: group.unusedCount,
          tickets: group.tickets?.length || 0,
        });
      });
    }
  }, [ticketGroupsData, ticketGroups]);

  if (groupsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="p-4 sm:p-5 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <UserPlus className="text-primary-600" size={20} />
              <span className="text-sm sm:text-base md:text-lg lg:text-xl">
                新規受講者追加 (修了証に印字される情報)
              </span>
            </h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-amber-900 flex items-start sm:items-center gap-2">
                <span className="font-semibold">⚠️ 重要:</span>
                <span>
                  顔写真をアップロードしてください。試験開始時や試験途中に本人確認に使用されます。
                </span>
              </p>
            </div>

            <form
              onSubmit={handleSubmitStudentForm}
              className="space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* Student Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  受講者情報
                </h3>
                {/* Mobile: Stack layout, Desktop: Table layout */}
                <div className="block md:hidden space-y-4">
                  {/* Name */}
                  <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="名前"
                      value={studentFormData.name}
                      onChange={(e) =>
                        setStudentFormData({
                          ...studentFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  {/* Birthday */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生年月日
                    </label>
                    <input
                      type="date"
                      value={studentFormData.birthday}
                      onChange={(e) =>
                        setStudentFormData({
                          ...studentFormData,
                          birthday: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="bg-amber-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="メールアドレス"
                      value={studentFormData.email}
                      onChange={(e) =>
                        setStudentFormData({
                          ...studentFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  {/* Face Photo */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      顔写真 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      試験時の本人確認に使用します
                    </p>
                    <div className="space-y-3">
                      {!facePhoto.preview ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFacePhotoUpload}
                            disabled={isProcessingFace}
                            className="hidden"
                            id="face-photo-upload"
                          />
                          <label
                            htmlFor="face-photo-upload"
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                              isProcessingFace
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="text-gray-700">
                              {isProcessingFace
                                ? "処理中..."
                                : "顔写真をアップロード"}
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="relative inline-block">
                            <img
                              src={facePhoto.preview}
                              alt="Face preview"
                              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveFacePhoto}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              title="写真を削除"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-green-600 mt-2">
                            ✓ 顔写真が登録されました
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        対応形式: JPG, PNG (最大5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden md:block overflow-x-auto pt-2">
                  <table className="w-full border-collapse">
                    <tbody>
                      {/* Name */}
                      <tr className="bg-amber-50">
                        <td className="px-4 py-3 border border-gray-300 align-middle w-1/3">
                          <label className="text-sm font-medium text-gray-700">
                            名前 <span className="text-red-500">*</span>
                          </label>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                          <input
                            type="text"
                            placeholder="名前"
                            value={studentFormData.name}
                            onChange={(e) =>
                              setStudentFormData({
                                ...studentFormData,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </td>
                      </tr>

                      {/* Birthday */}
                      <tr className="bg-white">
                        <td className="px-4 py-3 border border-gray-300 align-middle">
                          <label className="text-sm font-medium text-gray-700">
                            生年月日
                          </label>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                          <input
                            type="date"
                            value={studentFormData.birthday}
                            onChange={(e) =>
                              setStudentFormData({
                                ...studentFormData,
                                birthday: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </td>
                      </tr>

                      {/* Email */}
                      <tr className="bg-amber-50">
                        <td className="px-4 py-3 border border-gray-300 align-middle">
                          <label className="text-sm font-medium text-gray-700">
                            メールアドレス{" "}
                            <span className="text-red-500">*</span>
                          </label>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                          <input
                            type="email"
                            placeholder="メールアドレス"
                            value={studentFormData.email}
                            onChange={(e) =>
                              setStudentFormData({
                                ...studentFormData,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </td>
                      </tr>

                      {/* Face Photo */}
                      <tr className="bg-white">
                        <td className="px-4 py-3 border border-gray-300 align-middle">
                          <label className="text-sm font-medium text-gray-700">
                            顔写真 <span className="text-red-500">*</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            試験時の本人確認に使用します
                          </p>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 bg-white align-middle">
                          <div className="space-y-3">
                            {!facePhoto.preview ? (
                              <div className="flex items-center gap-4">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFacePhotoUpload}
                                  disabled={isProcessingFace}
                                  className="hidden"
                                  id="face-photo-upload"
                                />
                                <label
                                  htmlFor="face-photo-upload"
                                  className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                                    isProcessingFace
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <Upload className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm text-gray-700">
                                    {isProcessingFace
                                      ? "処理中..."
                                      : "顔写真をアップロード"}
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="relative inline-block">
                                  <img
                                    src={facePhoto.preview}
                                    alt="Face preview"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveFacePhoto}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    title="写真を削除"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-xs text-green-600 mt-2">
                                  ✓ 顔写真が登録されました
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              対応形式: JPG, PNG (最大5MB)
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Course Selection and Ticket Selection - Combined Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  講座選択 <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  チケットを割り当てる講座を選択してください。
                </p>
                <div className="space-y-4">
                  {/* Tab-based course navigation */}
                  {ticketGroups.filter((group) => group.unusedCount > 0)
                    .length > 0 ? (
                    <>
                      <div className="border-b border-gray-200">
                        {/* Desktop: Full width tabs (lg and above) */}
                        <div className="hidden lg:flex -mb-px">
                          {ticketGroups
                            .filter((group) => group.unusedCount > 0)
                            .map((group) => {
                              const isActive =
                                activeTabCourseId === group.courseId;
                              const hasSelectedTicket = selectedTicketIds.some(
                                (ticketId) => {
                                  const ticket = ticketGroups
                                    .flatMap((g) => g.tickets || [])
                                    .find((t) => t.ticketId === ticketId);
                                  return (
                                    ticket &&
                                    ticketGroups.find((g) =>
                                      g.tickets?.some(
                                        (t) => t.ticketId === ticketId
                                      )
                                    )?.courseId === group.courseId
                                  );
                                }
                              );
                              return (
                                <button
                                  key={group.courseId}
                                  type="button"
                                  onClick={() => {
                                    setActiveTabCourseId(group.courseId);
                                  }}
                                  className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${
                                    isActive
                                      ? "border-primary-500 text-primary-600 bg-primary-50"
                                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                                  }`}
                                >
                                  <span className="whitespace-nowrap">
                                    {group.courseName}
                                  </span>
                                  <span
                                    className={`ml-2 text-xs ${
                                      isActive
                                        ? "text-primary-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    <br />
                                    (未使用: {group.unusedCount}枚)
                                  </span>
                                  {hasSelectedTicket && (
                                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                        {/* Mobile/Tablet: Scrollable tabs (below lg) */}
                        <div className="lg:hidden overflow-x-auto -mb-px">
                          <div className="flex min-w-max">
                            {ticketGroups
                              .filter((group) => group.unusedCount > 0)
                              .map((group) => {
                                const isActive =
                                  activeTabCourseId === group.courseId;
                                const hasSelectedTicket =
                                  selectedTicketIds.some((ticketId) => {
                                    const ticket = ticketGroups
                                      .flatMap((g) => g.tickets || [])
                                      .find((t) => t.ticketId === ticketId);
                                    return (
                                      ticket &&
                                      ticketGroups.find((g) =>
                                        g.tickets?.some(
                                          (t) => t.ticketId === ticketId
                                        )
                                      )?.courseId === group.courseId
                                    );
                                  });
                                return (
                                  <button
                                    key={group.courseId}
                                    type="button"
                                    onClick={() => {
                                      setActiveTabCourseId(group.courseId);
                                    }}
                                    className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors relative whitespace-nowrap ${
                                      isActive
                                        ? "border-primary-500 text-primary-600 bg-primary-50"
                                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                                    }`}
                                  >
                                    <span>{group.courseName}</span>
                                    <span
                                      className={`ml-1 sm:ml-2 text-xs ${
                                        isActive
                                          ? "text-primary-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      ({group.unusedCount})
                                    </span>
                                    {hasSelectedTicket && (
                                      <span className="ml-1 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary-500 text-white text-xs font-bold">
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      {/* Ticket Selection */}
                      {activeTabCourseId ? (
                        <div className="mt-6">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                            利用チケット選択
                            {selectedTicketIds.length > 0 && (
                              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium">
                                {selectedTicketIds.length}枚選択中
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            この講座から1枚のチケットを選択してください。
                          </p>
                          <div className="space-y-6">
                            {(() => {
                              const courseId = activeTabCourseId;
                              if (!courseId) return null;
                              const courseGroup = ticketGroups.find(
                                (group) => group.courseId === courseId
                              );
                              if (!courseGroup) return null;

                              // Get all tickets (both used and unused)
                              let courseTickets = (
                                courseGroup.tickets || []
                              ).map(
                                (ticket: {
                                  ticketId: string;
                                  loginId: string | null;
                                  password: string | null;
                                  status: string;
                                  purchaseDate?: string;
                                }) => ({
                                  ticketId: ticket.ticketId,
                                  loginId: ticket.loginId,
                                  password: ticket.password,
                                  status: ticket.status,
                                  purchaseDate: ticket.purchaseDate,
                                  courseName: courseGroup.courseName,
                                  courseId: courseGroup.courseId,
                                })
                              );

                              // Apply filters
                              if (searchStatus !== "all") {
                                courseTickets = courseTickets.filter((t) => {
                                  if (searchStatus === "unused") {
                                    return t.status === "unused";
                                  } else if (searchStatus === "used") {
                                    return (
                                      t.status === "assigned" ||
                                      t.status === "in_use" ||
                                      t.status === "completed"
                                    );
                                  }
                                  return true;
                                });
                              }

                              if (searchDate) {
                                courseTickets = courseTickets.filter((t) => {
                                  if (!t.purchaseDate) return false;
                                  const ticketDate = new Date(t.purchaseDate)
                                    .toISOString()
                                    .split("T")[0];
                                  return ticketDate === searchDate;
                                });
                              }

                              return (
                                <div
                                  key={courseId}
                                  className="border border-gray-200 rounded-lg"
                                >
                                  <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 ">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 sm:gap-3">
                                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex-shrink-0">
                                        {courseGroup.courseName}
                                      </h4>

                                      {/* Search Bar - Same row as course name */}
                                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                        <input
                                          type="date"
                                          value={searchDate}
                                          onChange={(e) =>
                                            setSearchDate(e.target.value)
                                          }
                                          className="w-auto min-w-[140px] sm:min-w-[160px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300  outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                          placeholder="購入日で検索"
                                        />
                                        <select
                                          value={searchStatus}
                                          onChange={(e) =>
                                            setSearchStatus(e.target.value)
                                          }
                                          className="w-auto min-w-[100px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300  outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                          <option value="all">すべて</option>
                                          <option value="unused">未使用</option>
                                          <option value="used">使用済み</option>
                                        </select>
                                        {(searchDate ||
                                          searchStatus !== "all") && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSearchDate("");
                                              setSearchStatus("all");
                                            }}
                                            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors whitespace-nowrap"
                                          >
                                            リセット
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="overflow-hidden">
                                    {courseTickets.length === 0 ? (
                                      <div className="p-8 text-center">
                                        <p className="text-gray-600 font-medium mb-1">
                                          該当するチケットがありません
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                          検索条件を変更してください
                                        </p>
                                      </div>
                                    ) : (
                                      courseTickets.map(
                                        (ticket: {
                                          ticketId: string;
                                          loginId: string | null;
                                          password: string | null;
                                          status: string;
                                          purchaseDate?: string;
                                          courseName: string;
                                          courseId: string;
                                        }) => {
                                          const formatDate = (
                                            dateString?: string
                                          ) => {
                                            if (!dateString) return "-";
                                            try {
                                              const date = new Date(dateString);
                                              return date.toLocaleDateString(
                                                "ja-JP",
                                                {
                                                  year: "numeric",
                                                  month: "2-digit",
                                                  day: "2-digit",
                                                }
                                              );
                                            } catch {
                                              return "-";
                                            }
                                          };

                                          const isSelected =
                                            selectedTicketIds.includes(
                                              ticket.ticketId
                                            );
                                          return (
                                            <div
                                              key={ticket.ticketId}
                                              onClick={() =>
                                                handleTicketSelect(
                                                  ticket.ticketId,
                                                  !isSelected,
                                                  courseId
                                                )
                                              }
                                              className={`p-3 sm:p-4 transition-all cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                                isSelected
                                                  ? "bg-primary-50 shadow-md"
                                                  : "bg-white hover:bg-gray-50"
                                              }`}
                                            >
                                              <div className="flex items-start gap-3 sm:gap-4">
                                                {/* Checkbox */}
                                                <div className="flex-shrink-0 pt-0.5">
                                                  <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                      isSelected
                                                        ? "border-primary-500 bg-primary-500"
                                                        : "border-gray-300 bg-white"
                                                    }`}
                                                  >
                                                    {isSelected && (
                                                      <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth={3}
                                                          d="M5 13l4 4L19 7"
                                                        />
                                                      </svg>
                                                    )}
                                                  </div>
                                                </div>
                                                {/* Ticket Info */}
                                                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                                  <div className="min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                      チケットID
                                                    </p>
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800 border border-gray-200 break-all block">
                                                      {ticket.ticketId}
                                                    </code>
                                                  </div>
                                                  <div className="min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                      購入日
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-800">
                                                      {formatDate(
                                                        ticket.purchaseDate
                                                      )}
                                                    </p>
                                                  </div>
                                                  <div className="flex-shrink-0 sm:flex-shrink">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                      ステータス
                                                    </p>
                                                    <span
                                                      className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap min-w-[80px] text-center ${
                                                        ticket.status ===
                                                        "unused"
                                                          ? "bg-blue-100 text-blue-800"
                                                          : ticket.status ===
                                                            "assigned"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : ticket.status ===
                                                            "in_use"
                                                          ? "bg-green-100 text-green-800"
                                                          : ticket.status ===
                                                            "completed"
                                                          ? "bg-gray-100 text-gray-800"
                                                          : "bg-gray-100 text-gray-800"
                                                      }`}
                                                    >
                                                      {ticket.status ===
                                                      "unused"
                                                        ? "未使用"
                                                        : ticket.status ===
                                                          "assigned"
                                                        ? "割り当て済み"
                                                        : ticket.status ===
                                                          "in_use"
                                                        ? "使用中"
                                                        : ticket.status ===
                                                          "completed"
                                                        ? "完了"
                                                        : ticket.status}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 text-center py-8">
                          <Ticket
                            className="mx-auto text-gray-400 mb-3"
                            size={40}
                          />
                          <p className="text-gray-600 font-medium mb-1">
                            講座を選択してください
                          </p>
                          <p className="text-gray-500 text-sm">
                            上記のタブから、チケットを割り当てる講座を選択してください
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Ticket
                        className="mx-auto text-gray-400 mb-3"
                        size={40}
                      />
                      <p className="text-gray-600 font-medium mb-1">
                        未使用のチケットがありません
                      </p>
                      <p className="text-gray-500 text-sm">
                        チケットを購入してから受講者を追加してください
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetStudentForm}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  リセット
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || selectedTicketIds.length === 0}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      登録中...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span className="whitespace-nowrap">
                        上記の受講者を追加する
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAdminDashboard;
