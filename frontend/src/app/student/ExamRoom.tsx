import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExamAccessModal } from "../../components/atom/ExamAccessModal";
import { FaceVerificationModal } from "../../components/atom/FaceVerificationModal";
import { useGetExamEligibilityQuery } from "../../api/exam/examApiSlice";
import { useLazyGetFaceDataQuery } from "../../api/student/faceRecognitionApiSlice";

export const ExamRoom: React.FC = () => {
  const navigate = useNavigate();
  const [showExamModal, setShowExamModal] = useState(false);
  const [showFaceVerificationModal, setShowFaceVerificationModal] =
    useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(
    null
  );

  // Fetch exam eligibility status
  const { data: eligibilityData, isLoading: eligibilityLoading } =
    useGetExamEligibilityQuery({});

  // Face recognition hooks
  const [getFaceData] = useLazyGetFaceDataQuery();

  // Check if user has registered face data on component mount
  useEffect(() => {
    const checkFaceData = async () => {
      try {
        const result = await getFaceData().unwrap();
        if (result.data?.descriptor) {
          setFaceDescriptor(new Float32Array(result.data.descriptor));
        }
      } catch {
        console.log("No face data found, user needs to register");
      }
    };

    checkFaceData();
  }, [getFaceData]);

  const handleStartTest = async () => {
    if (eligibilityLoading) return;

    // Check exam eligibility before starting
    // Only proceed if eligibilityData exists AND examEligible is explicitly true
    if (!eligibilityData || eligibilityData.examEligible !== true) {
      // If not eligible or data not loaded, show exam access modal
      setShowExamModal(true);
      return;
    }

    // If eligible, show face verification modal
    // Face should already be registered during user registration
    setShowFaceVerificationModal(true);
  };

  const handleFaceVerificationSuccess = () => {
    setShowFaceVerificationModal(false);
    // Navigate to exam after successful verification
    navigate("/exam-taking");
  };

  const handleFaceVerificationFailed = () => {
    // Modal stays open until verification succeeds
    console.log("Face verification failed, please try again");
  };

  const handleGoToCourses = () => {
    setShowExamModal(false);
    navigate("/courses");
  };

  const handleGoToExam = () => {
    // Only allow exam access if user is eligible
    // Check explicitly that examEligible is true
    if (!eligibilityData || eligibilityData.examEligible !== true) {
      // If not eligible, keep showing the modal
      return;
    }
    setShowExamModal(false);

    // Show verification modal
    // Face should already be registered during user registration
    setShowFaceVerificationModal(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Image Section */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
        <img
          src="/img/exam.jpg"
          alt="試験ルーム"
          className="w-full h-full object-cover"
        />
        <div className="absolute bg-black/20 inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              試験ルーム
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-[700px] mx-auto mb-2 sm:mb-3">
              オンライン講習システム試験で、あなたの知識をテストしましょう
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section 1: Image Left, Text Right */}
          <div className="relative flex flex-col lg:flex-row items-center py-8">
            {/* Left Side - Image */}
            <div className="relative w-full lg:w-2/5 h-[300px] lg:h-[350px] flex-shrink-0">
              <img
                src="/img/exam2.jpg"
                alt="オンライン試験"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side - Text */}
            <div className="w-full lg:w-3/5 flex items-center flex-shrink-0">
              <div className="p-8 lg:p-12 w-full">
                <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
                  実践的な試験問題
                </h2>
                <div className="space-y-4 text-base text-gray-800 leading-relaxed">
                  <p>
                    このオンライン試験システムでは、受講したコースの内容に基づいた実践的な問題が出題されます。試験を通じて、学習した知識がしっかりと身についているかを確認できます。
                  </p>
                  <p>
                    実際の職場や日常生活で役立つ実践的な問題を出題。単なる暗記ではなく、理解度を深める問題構成になっています。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Text Left, Image Right */}
          <div className="relative flex flex-col lg:flex-row items-center py-8">
            {/* Left Side - Text */}
            <div className="w-full lg:w-3/5 flex items-center flex-shrink-0 order-2 lg:order-1">
              <div className="p-8 lg:p-12 w-full">
                <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
                  即座に結果確認
                </h2>
                <div className="space-y-4 text-base text-gray-800 leading-relaxed">
                  <p>
                    試験終了後は、即座に結果を確認できます。正答率や各問題の詳細な解説を確認し、自分の理解度を把握して今後の学習に活かすことができます。
                  </p>
                  <p>
                    間違えた問題の解説を読むことで、理解を深めることができます。試験結果は詳細な分析と共に表示され、学習の改善点を明確に把握できます。
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative w-full lg:w-2/5 h-[300px] lg:h-[350px] flex-shrink-0 order-1 lg:order-2">
              <img
                src="/img/exam3.jpg"
                alt="試験結果確認"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Conditions and Button Section */}
          <div className="bg-white py-12 lg:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <h3 className="text-xl lg:text-2xl font-medium text-gray-900 mb-8 text-center">
                  試験を受けるための条件
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg h-full">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed flex-1">
                      すべてのコース動画を視聴完了していること
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg h-full">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed flex-1">
                      顔認証データが登録されていること
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleStartTest}
                  disabled={eligibilityLoading}
                  className={`px-10 py-3.5 text-base font-medium transition-colors duration-200 flex items-center justify-center rounded-full ${
                    eligibilityLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  <span>
                    {eligibilityLoading
                      ? "確認中..."
                      : eligibilityData?.examEligible
                      ? "試験を開始"
                      : "試験を受ける"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Access Modal */}
      {eligibilityData && (
        <ExamAccessModal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
          onGoToCourses={handleGoToCourses}
          onGoToExam={handleGoToExam}
          courses={eligibilityData.courses || []}
          examEligible={eligibilityData.examEligible || false}
        />
      )}

      {/* Face Verification Modal */}
      {faceDescriptor && (
        <FaceVerificationModal
          isOpen={showFaceVerificationModal}
          onClose={() => setShowFaceVerificationModal(false)}
          onVerificationSuccess={handleFaceVerificationSuccess}
          onVerificationFailed={handleFaceVerificationFailed}
          referenceDescriptor={faceDescriptor}
          title="試験開始前の本人確認"
          description="試験を開始する前に、本人確認のため顔認証を行います。"
          canClose={true}
          similarityThreshold={0.6}
        />
      )}
    </div>
  );
};

export default ExamRoom;
