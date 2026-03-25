import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  isAuthenticated,
  getStoredUser,
  getAuthToken,
} from "../../api/auth/authService";
import { getApiUrl } from "../../utils/apiConfig";

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  features: string[];
  image: string;
  detailedExplanation?: string;
}

interface PurchasedCourse {
  courseId: string;
  courseName: string;
  studentId: string;
  password: string;
  enrollmentAt: string;
  status: string;
}

// Course List Item Component
interface CourseListItemProps {
  course: Course;
  isPurchased: boolean;
  isStudent: boolean;
  isGroupAdmin: boolean;
  handleGoToCourse: (course: Course) => void;
  courseIndex: number;
  isCourseSelected: boolean;
  onCourseToggle: (courseId: string) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

const CourseListItem: React.FC<CourseListItemProps> = ({
  course,
  isPurchased,
  isStudent,
  isGroupAdmin,
  handleGoToCourse,
  courseIndex,
  isCourseSelected,
  onCourseToggle,
  showDetails,
  onToggleDetails,
}) => {
  const getEnglishSubtitle = () => {
    if (course.id === "general") return "GENERAL COURSE";
    if (course.id === "caregiving") return "CAREGIVING COURSE";
    if (course.id === "specified-care") return "SPECIFIED SKILLS CAREGIVING";
    if (course.id === "initial-care") return "INITIAL CAREGIVING TRAINING";
    if (course.id === "jlpt") return "JLPT PREPARATION";
    if (course.id === "business-manner") return "BUSINESS MANNERS";
    return "";
  };

  const getDescription = () => {
    if (course.id === "general") {
      return (
        <>
          日常生活や職場で必要な
          <span className="text-primary-600 font-semibold">
            基本的な日本語スキル
          </span>
          と文化的知識を習得
        </>
      );
    }
    if (course.id === "caregiving") {
      return (
        <>
          介護職に従事するための
          <span className="text-primary-600 font-semibold">専門的なスキル</span>
          と理論的知識を習得
        </>
      );
    }
    if (course.id === "specified-care") {
      return (
        <>
          特定技能外国人向けの
          <span className="text-primary-600 font-semibold">介護基礎研修</span>
          で、指定技能者資格取得を目指す
        </>
      );
    }
    if (course.id === "initial-care") {
      return (
        <>
          介護職員として必要な
          <span className="text-primary-600 font-semibold">
            基本的な技術と知識
          </span>
          を習得する入門コース
        </>
      );
    }
    if (course.id === "jlpt") {
      return (
        <>
          JLPT各レベルに特化した
          <span className="text-primary-600 font-semibold">対策講座</span>
          で、合格を目指す集中学習
        </>
      );
    }
    if (course.id === "business-manner") {
      return (
        <>
          日本の職場で必要な
          <span className="text-primary-600 font-semibold">ビジネスマナー</span>
          とコミュニケーションスキルを習得
        </>
      );
    }
    return course.description;
  };

  return (
    <div
      onClick={() => !isPurchased && !isStudent && onCourseToggle(course.id)}
      className={`flex flex-col sm:flex-row items-start gap-4 sm:gap-6 py-4 sm:py-6 transition-all px-3 sm:px-4 md:px-6 duration-200 ${
        isCourseSelected ? "bg-primary-50/50 shadow-md" : "hover:bg-gray-50/50"
      } ${!isPurchased && !isStudent ? "cursor-pointer" : ""}`}
    >
      {/* Large Orange Number - Top on mobile, Left on desktop */}
      <div className="flex-shrink-0 w-full sm:w-auto flex items-center gap-3 sm:block">
        <div className="text-primary-500 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-none">
          {String(courseIndex + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Content with Left Border - Full width on mobile */}
      <div
        className={`flex-1 min-w-0 w-full sm:border-l-4 transition-all duration-200 ${
          isCourseSelected
            ? "border-primary-600 "
            : "border-primary-500 hover:border-primary-600"
        } sm:pl-4 md:pl-6`}
      >
        {/* Title Row - Japanese Title with English Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {course.name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-primary-500 text-xs sm:text-sm md:text-base font-medium uppercase tracking-wide">
              {getEnglishSubtitle()}
            </span>
            {/* Paid Course Badge - Only for students with purchased courses */}
            {isStudent && isPurchased && (
              <span className="px-2 sm:px-3 py-1 bg-[#fa7d58] text-white text-xs font-medium rounded-full">
                有料 - 購入済み
              </span>
            )}
          </div>
        </div>

        {/* Price Info */}
        <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div>
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary-600">
              ¥{course.price.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2">月額</span>
          </div>
          {!isPurchased && isCourseSelected && (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-primary-500 text-white text-xs sm:text-sm font-semibold rounded-full w-fit">
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>選択済み</span>
            </div>
          )}
        </div>

        {/* Description Paragraph */}
        <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-2">
          {getDescription()}
        </p>

        {/* Detailed Explanation Link for Mobile */}
        {course.detailedExplanation && (
          <>
            {/* Mobile: Show link to expand/collapse */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleDetails();
              }}
              className="sm:hidden flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium mb-2 transition-colors"
            >
              <span>詳細を見る</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {/* Mobile: Expandable detailed explanation */}
            {showDetails && (
              <div className="sm:hidden mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {course.detailedExplanation}
                </p>
              </div>
            )}
            
            {/* Desktop: Always show detailed explanation */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 hidden sm:block">
              {course.detailedExplanation}
            </p>
          </>
        )}

        {/* Status and Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Action Buttons */}
          {isStudent && isPurchased && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGoToCourse(course);
              }}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-[#fa7d58] hover:bg-[#e85d3a] text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            >
              受講を開始
            </button>
          )}

          {/* Group Admin Status */}
          {isGroupAdmin && isPurchased && (
            <span className="text-green-600 text-xs sm:text-sm font-medium">購入済み</span>
          )}
        </div>
      </div>

      {/* Image - Bottom on mobile, Right on desktop */}
      <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
        <div className="relative w-full sm:w-32 md:w-40 lg:w-48 h-48 sm:h-32 md:h-40 lg:h-48 overflow-hidden rounded-lg sm:rounded-2xl">
          <img
            src={course.image}
            alt={course.name}
            className={`w-full h-full object-cover transition-all duration-200 ${
              isCourseSelected ? "brightness-75" : ""
            }`}
          />
          {/* Selection Overlay with Check Icon */}
          {isCourseSelected && !isPurchased && (
            <div className="absolute inset-0 bg-primary-500/30 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-xl">
                <Check className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const courses: Course[] = [
  {
    id: "general",
    name: "一般講習",
    description: "日常生活や職場で必要な基本的な日本語スキルと文化的知識を習得",
    price: 4500,
    duration: "1ヶ月",
    level: "初級",
    image: "/img/lecture.png",
    features: [
      "基本的な日本語会話",
      "日本の文化理解",
      "職場でのコミュニケーション",
      "実践的な語彙学習",
      "修了証明書発行",
    ],
    detailedExplanation:
      "このコースでは、日常生活や職場で必要な基本的な日本語スキルと文化的知識を体系的に学習します。初心者から中級者まで、段階的に日本語能力を向上させることができます。実践的な会話練習や文化理解を通じて、日本での生活に必要なコミュニケーション能力を身につけます。",
  },
  {
    id: "caregiving",
    name: "介護講習",
    description: "介護職に従事するための専門的なスキルと理論的知識を習得",
    price: 6500,
    duration: "1ヶ月",
    level: "中級",
    image: "/img/middle.png",
    features: [
      "介護技術の基礎",
      "高齢者ケアの理論",
      "安全な介護方法",
      "コミュニケーション技術",
      "介護職員資格取得",
    ],
    detailedExplanation:
      "介護職に従事するために必要な専門的なスキルと理論的知識を包括的に学習します。高齢者ケアの基本理念から実践的な介護技術まで、安全で質の高い介護サービスを提供するための知識と技能を習得します。",
  },
  {
    id: "specified-care",
    name: "介護基礎研修（特定）",
    description:
      "特定技能外国人向けの介護基礎研修で、指定技能者資格取得を目指す",
    price: 8500,
    duration: "1ヶ月",
    level: "中級以上",
    image: "/img/beginer.png",
    features: [
      "特定技能制度対応",
      "介護の専門知識",
      "実習を含む研修",
      "資格試験対策",
      "就職サポート",
    ],
    detailedExplanation:
      "特定技能外国人向けの介護基礎研修プログラムです。特定技能制度に対応したカリキュラムで、介護の専門知識と実践的な技能を習得し、指定技能者資格取得を目指します。実習を含む包括的な研修で、即戦力として働ける人材を育成します。",
  },
  {
    id: "initial-care",
    name: "介護職員初任者研修",
    description: "介護職員として必要な基本的な技術と知識を習得する入門コース",
    price: 7500,
    duration: "1ヶ月",
    level: "初級以上",
    image: "/img/business.png",
    features: [
      "介護の基本理念",
      "身体介護技術",
      "生活支援技術",
      "介護過程の理解",
      "修了証明書発行",
    ],
    detailedExplanation:
      "介護職員として必要な基本的な技術と知識を習得する入門コースです。介護の基本理念から身体介護技術、生活支援技術まで、介護職員として働くために必要な基礎を体系的に学習します。修了後は修了証明書が発行され、介護施設での就職に有利です。",
  },
  {
    id: "jlpt",
    name: "日本語能力試験対策",
    description: "JLPT各レベルに特化した対策講座で、合格を目指す集中学習",
    price: 5500,
    duration: "1ヶ月",
    level: "全レベル",
    image: "/img/conversation.jpg",
    features: [
      "N1-N5レベル対応",
      "過去問題演習",
      "語彙・文法強化",
      "読解・聴解対策",
      "模擬試験実施",
    ],
    detailedExplanation:
      "日本語能力試験（JLPT）の各レベル（N1～N5）に特化した対策講座です。過去問題演習、語彙・文法の強化、読解・聴解対策など、合格に必要なすべてのスキルを集中的に学習します。定期的な模擬試験で実力を確認しながら、確実に合格を目指します。",
  },
  {
    id: "business-manner",
    name: "ビジネスマナー講習",
    description:
      "日本の職場で必要なビジネスマナーとコミュニケーションスキルを習得",
    price: 4000,
    duration: "1ヶ月",
    level: "中級以上",
    image: "/img/train.jpg",
    features: [
      "敬語の使い方",
      "電話対応マナー",
      "メール文書作成",
      "会議参加スキル",
      "職場適応支援",
    ],
    detailedExplanation:
      "日本の職場で必要なビジネスマナーとコミュニケーションスキルを実践的に学習します。敬語の使い方、電話対応、メール文書作成、会議参加など、実際の職場で即座に活用できるスキルを身につけます。職場での適応を支援し、円滑なコミュニケーションを実現します。",
  },
];

export const CourseSelection: React.FC = () => {
  const navigate = useNavigate();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  // Get user data
  const user = getStoredUser();
  const isGroupAdmin = user?.role === "group_admin";

  const handleToggleDetails = (courseId: string) => {
    setShowDetails((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleCourseToggle = (courseId: string) => {
    // Students cannot select courses for purchase
    if (user?.role === "student") {
      return;
    }

    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleNavigateToPurchase = () => {
    // Students cannot navigate to purchase page
    if (user?.role === "student") {
      return;
    }

    const selectedCoursesData = courses.filter((c) =>
      selectedCourses.has(c.id)
    );

    // For group admins or unauthenticated users, go to group admin info form
    navigate("/group-admin/info-form", {
      state: {
        courses:
          selectedCoursesData.length > 0 ? selectedCoursesData : undefined,
      },
    });
  };

  // Fetch purchased courses (only if authenticated)
  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      // Skip if user is not authenticated
      if (!isAuthenticated() || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = getApiUrl();
        const token = getAuthToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/courses/user/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPurchasedCourses(data.courses || []);
        }
      } catch (error) {
        console.error("Error fetching purchased courses:", error);
        // Error fetching purchased courses
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [user?.id]);

  // Check if a course is already purchased (including completed courses)
  const isCoursePurchased = (courseId: string): boolean => {
    return purchasedCourses.some(
      (purchased) =>
        purchased.courseId === courseId &&
        (purchased.status === "active" || purchased.status === "completed")
    );
  };

  const handleGoToCourse = (course: Course) => {
    // Navigate directly to course learning page (no login modal needed)
    navigate(`/course/${course.id}/learning`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">コース情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Image Section */}
      <div className="relative w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] overflow-hidden">
        <img
          src="/img/online.jpg"
          alt="コース紹介"
          className="w-full h-full object-cover"
        />
        <div className="absolute bg-black/20 inset-0 bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white px-3 sm:px-4 md:px-6">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
              コース選択
            </h1>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl max-w-[600px] sm:max-w-[700px] mx-auto leading-relaxed">
              あなたのレベルに合った最適なコースを見つけて、日本語学習を始めましょう
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
          {/* Course List */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
            {courses.map((course, index) => {
              const isPurchased = isCoursePurchased(course.id);
              const isStudent = user?.role === "student";

              return (
                <CourseListItem
                  key={course.id}
                  course={course}
                  isPurchased={isPurchased}
                  isStudent={isStudent}
                  isGroupAdmin={isGroupAdmin}
                  handleGoToCourse={handleGoToCourse}
                  courseIndex={index}
                  isCourseSelected={selectedCourses.has(course.id)}
                  onCourseToggle={handleCourseToggle}
                  showDetails={showDetails[course.id] || false}
                  onToggleDetails={() => handleToggleDetails(course.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar with Purchase Button - Only for non-students */}
      {selectedCourses.size > 0 && user?.role !== "student" && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-100 border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                    選択された項目
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">
                    {selectedCourses.size}件
                  </div>
                </div>
                <div className="hidden sm:block h-12 w-px bg-gray-300"></div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">合計金額</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600">
                    ¥
                    {Array.from(selectedCourses)
                      .reduce((total, courseId) => {
                        const course = courses.find((c) => c.id === courseId);
                        return total + (course?.price || 0);
                      }, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleNavigateToPurchase}
                className="group px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 bg-primary-500 hover:bg-primary-600 hover:px-8 sm:hover:px-12 md:hover:px-14 text-white text-sm sm:text-base font-bold rounded-full transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center gap-0 group-hover:gap-2 relative w-full sm:w-auto"
              >
                <span>購入ページへ移動</span>
                <ArrowRight className="w-0 group-hover:w-4 sm:group-hover:w-5 h-4 sm:h-5 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200 overflow-hidden" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSelection;
