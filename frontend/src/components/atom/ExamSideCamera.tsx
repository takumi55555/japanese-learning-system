import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import {
  loadFaceApiModels,
  detectFaceFromVideo,
  compareFaces,
} from '../../utils/faceRecognition';

interface ExamSideCameraProps {
  referenceDescriptor: Float32Array | null;
  onVerificationSuccess: () => void;
  onVerificationFailed: () => void;
  countdown: number | null;
  shouldVerify: boolean;
  onVerificationComplete: () => void;
}

export const ExamSideCamera: React.FC<ExamSideCameraProps> = ({
  referenceDescriptor,
  onVerificationSuccess,
  onVerificationFailed,
  countdown,
  shouldVerify,
  onVerificationComplete,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'failed'
  >('idle');
  const verificationAttemptedRef = useRef(false);

  // モデルのロード
  useEffect(() => {
    loadFaceApiModels().then((loaded) => {
      setIsModelLoaded(loaded);
    });
  }, []);

  // カメラが準備できた時のハンドラ
  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  // カメラエラーハンドラ
  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    setIsCameraReady(false);
  };

  // 自動顔認証を実行
  const performAutoVerification = useCallback(async () => {
    if (!webcamRef.current?.video || !referenceDescriptor || !isModelLoaded || !isCameraReady) {
      console.log('Cannot perform verification: prerequisites not met');
      onVerificationFailed();
      onVerificationComplete();
      return;
    }

    if (isVerifying || verificationAttemptedRef.current) {
      return;
    }

    verificationAttemptedRef.current = true;
    setIsVerifying(true);
    setVerificationStatus('verifying');

    try {
      const videoElement = webcamRef.current.video;
      const result = await detectFaceFromVideo(videoElement);

      if (!result.detected || !result.descriptor) {
        setVerificationStatus('failed');
        setIsVerifying(false);
        onVerificationFailed();
        onVerificationComplete();
        
        // 3秒後にステータスをリセット
        setTimeout(() => {
          setVerificationStatus('idle');
          verificationAttemptedRef.current = false;
        }, 3000);
        return;
      }

      // 顔の比較
      const similarity = compareFaces(referenceDescriptor, result.descriptor);
      console.log('Face similarity:', similarity);

      if (similarity >= 0.6) {
        setVerificationStatus('success');
        setIsVerifying(false);
        onVerificationSuccess();
        onVerificationComplete();
        
        // 3秒後にステータスをリセット
        setTimeout(() => {
          setVerificationStatus('idle');
          verificationAttemptedRef.current = false;
        }, 3000);
      } else {
        setVerificationStatus('failed');
        setIsVerifying(false);
        onVerificationFailed();
        onVerificationComplete();
        
        // 3秒後にステータスをリセット
        setTimeout(() => {
          setVerificationStatus('idle');
          verificationAttemptedRef.current = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      setIsVerifying(false);
      onVerificationFailed();
      onVerificationComplete();
      
      // 3秒後にステータスをリセット
      setTimeout(() => {
        setVerificationStatus('idle');
        verificationAttemptedRef.current = false;
      }, 3000);
    }
  }, [referenceDescriptor, isModelLoaded, isCameraReady, isVerifying, onVerificationSuccess, onVerificationFailed, onVerificationComplete]);

  // shouldVerify が true になったら自動検証を実行
  useEffect(() => {
    if (shouldVerify && !verificationAttemptedRef.current) {
      performAutoVerification();
    }
  }, [shouldVerify, performAutoVerification]);

  return (
    <div className="sticky top-24 h-fit">
      <div className="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 border-b border-blue-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white tracking-wide">本人確認カメラ</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Camera Feed */}
          <div className="relative bg-gray-900 rounded-md overflow-hidden border-2 border-gray-300 shadow-md" style={{ height: '300px' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: 'user',
            }}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
          />

          {/* Camera Loading Overlay */}
          {!isCameraReady && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-4">
                  <Camera className="w-16 h-16 text-gray-600 mx-auto" />
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-300 text-base font-medium">カメラを起動しています</p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Verifying Overlay */}
          {verificationStatus === 'verifying' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
              <div className="bg-white rounded-xl px-6 py-5 shadow-2xl border-2 border-blue-500 max-w-xs">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                    <Loader2 className="w-6 h-6 text-white animate-spin" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-900 text-base font-bold">認証中...</p>
                </div>
                <p className="text-gray-600 text-sm ml-11">しばらくお待ちください</p>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {verificationStatus === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <div className="bg-white rounded-xl px-6 py-5 shadow-2xl border-2 border-green-500 max-w-xs">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-900 text-base font-bold">認証成功</p>
                </div>
                <p className="text-gray-600 text-sm ml-11">本人確認が完了しました</p>
              </div>
            </div>
          )}

          {/* Failed Overlay */}
          {verificationStatus === 'failed' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
              <div className="bg-white rounded-xl px-6 py-5 shadow-2xl border-2 border-red-500 max-w-xs">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-red-500 rounded-full p-2 flex-shrink-0">
                    <XCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-900 text-base font-bold">認証失敗</p>
                </div>
                <p className="text-gray-600 text-sm ml-11">モーダルで再試行してください</p>
              </div>
            </div>
          )}
          </div>

          {/* Status Message Box */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 px-5 py-4">
          <div className="flex items-center justify-center space-x-3">
            {countdown !== null && countdown > 0 ? (
              <>
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                <p className="text-base font-bold text-gray-900">
                  認証開始まで <span className="text-blue-600 text-xl">{countdown}</span> 秒
                </p>
              </>
            ) : verificationStatus === 'verifying' ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-base font-bold text-blue-700">認証処理中...</p>
              </>
            ) : verificationStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-base font-bold text-green-700">認証成功</p>
              </>
            ) : verificationStatus === 'failed' ? (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-base font-bold text-red-700">認証失敗</p>
              </>
            ) : isCameraReady ? (
              <>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-base font-semibold text-gray-700">カメラ準備完了</p>
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                <p className="text-base font-semibold text-gray-600">初期化中...</p>
              </>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

