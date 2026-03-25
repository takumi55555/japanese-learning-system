import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Clock } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { BossLayout } from "../../components/layout/AdminLayout";
import { ConfirmModal } from "../../components/atom/ConfirmModal";
import { Breadcrumb } from "../../components/atom/Breadcrumb";
import { Pagination } from "../../components/atom/Pagination";
import {
  courseOptions,
  useGetQuestionsQuery,
  useDeleteQuestionMutation,
} from "../../api";
import type { Question } from "../../api";

export const ExamQuestionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // API hooks - Fetch ALL questions from database
  const {
    data: questionsData,
    isLoading,
    refetch,
  } = useGetQuestionsQuery({
    courseId: selectedCourse || undefined,
    type: selectedType || undefined,
    limit: 9999, // Fetch all questions
  });

  const [deleteQuestion] = useDeleteQuestionMutation();

  const questionTypes = [
    { value: "true_false", label: "タイプ1: 正誤問題" },
    { value: "single_choice", label: "タイプ2: 単一選択" },
    { value: "multiple_choice", label: "タイプ3: 複数選択" },
  ];

  // Filter questions based on search term and filters
  const filteredQuestions = useMemo(() => {
    return (questionsData?.questions || []).filter((question) => {
      const matchesSearch =
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [questionsData?.questions, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pagedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCourse, selectedType]);

  // Adjust page if it exceeds total pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleDelete = (question: Question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      await deleteQuestion(questionToDelete._id).unwrap();
      showToast({
        type: "success",
        title: "削除完了",
        message: `問題「${questionToDelete.title}」を削除しました`,
      });
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      refetch();
    } catch {
      showToast({
        type: "error",
        title: "削除エラー",
        message: "問題の削除に失敗しました",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const typeInfo = questionTypes.find((t) => t.value === type);
    return typeInfo ? typeInfo.label : type;
  };

  if (isLoading) {
    return (
      <BossLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">問題データを読み込み中...</p>
          </div>
        </div>
      </BossLayout>
    );
  }

  return (
    <BossLayout>
      <div className="p-3 md:p-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "試験問題管理" }]} />

        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            試験問題管理
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            試験問題の作成、編集、管理ができます (
            {questionsData?.questions?.length || 0} 件の問題)
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-stretch lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 w-full">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="問題タイトル、内容で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
              >
                <option value="">すべてのコース</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
              >
                <option value="">すべてのタイプ</option>
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Question Button */}
            <button
              onClick={() => navigate("/admin/question-management/create")}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              問題追加
            </button>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-2 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-800">
                    問題情報
                  </th>
                  <th className="px-2 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-800 hidden md:table-cell">
                    タイプ
                  </th>
                  <th className="px-2 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-800 hidden lg:table-cell">
                    コース
                  </th>
                  <th className="px-2 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-800 hidden md:table-cell">
                    推定時間
                  </th>
                  <th className="px-2 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-800 hidden lg:table-cell">
                    作成日
                  </th>
                  <th className="px-2 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-slate-800">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedQuestions.map((question) => (
                  <React.Fragment key={question._id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-2 md:px-6 py-3">
                        <div className="font-medium text-slate-800 text-xs md:text-sm">
                          {question.title}
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTypeLabel(question.type)}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-3 hidden lg:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {question.courseName}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-3 text-xs md:text-sm text-slate-600 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {question.estimatedTime}分
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-3 text-xs md:text-sm text-slate-600 hidden lg:table-cell">
                        {new Date(question.createdAt).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-2 md:px-6 py-3">
                        <div className="flex items-center justify-center space-x-1 md:space-x-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/question-management/${question._id}/edit`
                              )
                            }
                            className="p-1.5 md:p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="更新"
                          >
                            <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(question)}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                {pagedQuestions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      データを取得できませんでした
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="問題の削除"
          message={`「${questionToDelete?.title}」を削除しますか？この操作は取り消せません。`}
          confirmText="削除する"
          cancelText="キャンセル"
        />
      </div>
    </BossLayout>
  );
};

export default ExamQuestionManagement;
