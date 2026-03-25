import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  loadFaceApiModels,
  detectFaceFromVideo,
  compareFaces,
} from '../../utils/faceRecognition';

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
  onVerificationFailed: () => void;
  referenceDescriptor: Float32Array | null;
  title?: string;
  description?: string;
  canClose?: boolean; // 試験中はfalse（モーダルを閉じられない）
  similarityThreshold?: number; // デフォルト0.6
}

export const FaceVerificationModal: React.FC<FaceVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
  onVerificationFailed,
  referenceDescriptor,
  title = '顔認証',
  description = 'カメラに顔を向けてください',
  canClose = true,
  similarityThreshold = 0.6,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // モデルのロードとカメラの初期化
  useEffect(() => {
    if (isOpen) {
      setIsCameraReady(false);
      setVerificationStatus('idle');
      setErrorMessage('');
      loadFaceApiModels().then((loaded) => {
        setIsModelLoaded(loaded);
        if (!loaded) {
          setErrorMessage('顔認識モデルの読み込みに失敗しました');
        }
      });
    }
  }, [isOpen]);

  // カメラが準備できた時のハンドラ
  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  // カメラエラーハンドラ
  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    setErrorMessage('カメラへのアクセスに失敗しました。カメラの権限を確認してください。');
    setIsCameraReady(false);
  };

  // 顔認証を開始
  const startVerification = useCallback(async () => {
    if (!webcamRef.current?.video || !referenceDescriptor) {
      setErrorMessage('カメラの初期化に失敗しました');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('verifying');
    setErrorMessage('');

    try {
      const videoElement = webcamRef.current.video;
      const result = await detectFaceFromVideo(videoElement);

      if (!result.detected || !result.descriptor) {
        setVerificationStatus('failed');
        setErrorMessage('顔が検出されませんでした。もう一度お試しください。');
        setIsVerifying(false);
        onVerificationFailed();
        return;
      }

      // 顔の比較
      const similarity = compareFaces(referenceDescriptor, result.descriptor);
      console.log('Face similarity:', similarity);

      if (similarity >= similarityThreshold) {
        setVerificationStatus('success');
        setIsVerifying(false);
        setTimeout(() => {
          onVerificationSuccess();
          if (canClose) {
            onClose();
          }
        }, 1500);
      } else {
        setVerificationStatus('failed');
        setErrorMessage(
          `顔が一致しませんでした（類似度: ${(similarity * 100).toFixed(1)}%）。もう一度お試しください。`
        );
        setIsVerifying(false);
        onVerificationFailed();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      setErrorMessage('顔認証中にエラーが発生しました');
      setIsVerifying(false);
      onVerificationFailed();
    }
  }, [referenceDescriptor, similarityThreshold, onVerificationSuccess, onVerificationFailed, onClose, canClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 text-sm mt-0.5">{description}</p>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Webcam */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
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
            className="w-full h-auto"
          />

          {/* Camera Loading Overlay */}
          {!isCameraReady && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
                <p className="text-white text-sm">カメラを起動中...</p>
              </div>
            </div>
          )}

          {/* Status Icon Overlay */}
          {verificationStatus === 'verifying' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
                <p className="text-white text-lg font-semibold">認証中...</p>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
          {verificationStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold text-green-800 mb-1">認証成功</h5>
                <p className="text-green-700 text-sm">本人確認が完了しました。試験を開始します。</p>
              </div>
              </div>
            </div>
          )}

        {/* Error Message */}
        {errorMessage && verificationStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold text-red-800 mb-1">認証失敗</h5>
                <p className="text-red-700 text-sm">{errorMessage}</p>
            {!canClose && (
              <p className="text-red-600 text-xs mt-2">
                ※ 認証が完了するまで試験を続行できません
              </p>
            )}
              </div>
            </div>
          </div>
        )}
        {errorMessage && verificationStatus !== 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Status Info */}
        {(!isModelLoaded || !isCameraReady) && verificationStatus === 'idle' && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
            <span className="text-gray-600">
              {!isModelLoaded ? 'モデルを読み込み中...' : 'カメラを準備中...'}
            </span>
          </div>
        )}

        {/* Instructions */}
        {verificationStatus === 'idle' && isModelLoaded && isCameraReady && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <Camera className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h5 className="text-sm font-semibold text-blue-800 mb-1">
                  顔認証の手順
                </h5>
                <ul className="text-blue-700 text-xs space-y-0.5">
                  <li>• カメラに正面から顔を向けてください</li>
                  <li>• 明るい場所で撮影してください</li>
                  <li>• マスクやサングラスは外してください</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isModelLoaded && verificationStatus !== 'success' && (
          <div className="flex gap-3">
            {canClose && (
              <button
                onClick={onClose}
                disabled={isVerifying}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={() => {
                setVerificationStatus('idle');
                setIsVerifying(false);
                setErrorMessage('');
                startVerification();
              }}
              disabled={isVerifying || !isCameraReady}
              className={`${canClose ? 'flex-1' : 'w-full'} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  認証中...
                </>
              ) : !isCameraReady ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  準備中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  確認
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

