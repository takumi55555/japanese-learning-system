import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  loadFaceApiModels,
  detectFaceFromVideo,
  captureVideoFrame,
} from '../../utils/faceRecognition';

interface FaceRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: (descriptor: Float32Array, imageData: string) => void;
  title?: string;
  description?: string;
}

export const FaceRegistrationModal: React.FC<FaceRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistrationSuccess,
  title = '顔登録',
  description = '試験開始前に顔を登録してください',
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<
    'idle' | 'capturing' | 'success' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(3);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedData, setCapturedData] = useState<{
    descriptor: Float32Array;
    imageData: string;
  } | null>(null);

  // モデルのロード
  useEffect(() => {
    if (isOpen) {
      loadFaceApiModels().then((loaded) => {
        setIsModelLoaded(loaded);
        if (!loaded) {
          setErrorMessage('顔認識モデルの読み込みに失敗しました');
        }
      });
    }
  }, [isOpen]);

  // 顔を撮影して登録
  const handleCaptureFace = async () => {
    if (!webcamRef.current?.video) {
      setErrorMessage('カメラの初期化に失敗しました');
      return;
    }

    setIsCapturing(true);
    setCaptureStatus('capturing');
    setErrorMessage('');

    // カウントダウン
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const videoElement = webcamRef.current.video;

      // 顔を検出
      const result = await detectFaceFromVideo(videoElement);

      if (!result.detected || !result.descriptor) {
        setCaptureStatus('failed');
        setErrorMessage('顔が検出されませんでした。もう一度お試しください。');
        setIsCapturing(false);
        return;
      }

      // 画像をキャプチャ
      const imageData = captureVideoFrame(videoElement);
      setCapturedImage(imageData);
      setCaptureStatus('success');

      // 成功後、データを保存（ユーザーのボタンクリックを待つ）
      setCapturedData({
        descriptor: result.descriptor!,
        imageData: imageData,
      });
      setIsCapturing(false);
    } catch (error) {
      console.error('Capture error:', error);
      setCaptureStatus('failed');
      setErrorMessage('顔の撮影中にエラーが発生しました');
      setIsCapturing(false);
    }
  };

  // リトライ
  const handleRetry = () => {
    setCaptureStatus('idle');
    setIsCapturing(false);
    setErrorMessage('');
    setCapturedImage(null);
    setCapturedData(null);
    setCountdown(3);
  };

  // 試験開始ボタンのハンドラー
  const handleProceedToExam = () => {
    if (capturedData) {
      onRegistrationSuccess(capturedData.descriptor, capturedData.imageData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Webcam */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
          {!capturedImage ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              className="w-full h-auto"
            />
          ) : (
            <img src={capturedImage} alt="Captured face" className="w-full h-auto rounded-lg" />
          )}

          {/* Countdown overlay - elegant design */}
          {isCapturing && countdown > 0 && (
            <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-4 shadow-lg">
                <div className="text-4xl font-bold text-gray-800">{countdown}</div>
              </div>
            </div>
          )}

          {/* Status Overlay */}
          {captureStatus === 'capturing' && countdown === 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-700 text-lg font-medium">顔を検出中...</p>
              </div>
            </div>
          )}

          {captureStatus === 'success' && (
            <div className="absolute inset-0 bg-emerald-50/95 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                <p className="text-emerald-700 text-xl font-bold">登録成功！</p>
              </div>
            </div>
          )}

          {captureStatus === 'failed' && (
            <div className="absolute inset-0 bg-red-50/95 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 text-xl font-bold">登録失敗</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Loading Status */}
        {!isModelLoaded && (
          <div className="flex items-center justify-center py-3 mb-4">
            <Loader2 className="w-5 h-5 text-gray-500 animate-spin mr-2" />
            <span className="text-gray-600 text-sm">モデルを読み込み中...</span>
          </div>
        )}

        {/* Instructions */}
        {captureStatus === 'idle' && isModelLoaded && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <Camera className="w-5 h-5 text-gray-600 mr-2 mt-0.5" />
              <div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  カメラに正面から顔を向けてください。明るい場所で、マスクやサングラスを外して撮影してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {captureStatus === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCaptureFace}
                disabled={!isModelLoaded || isCapturing}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${!isModelLoaded || isCapturing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
              >
                {isCapturing ? '撮影中...' : '顔を登録する'}
              </button>
            </>
          )}

          {captureStatus === 'success' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                再登録
              </button>
              <button
                onClick={handleProceedToExam}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                試験を開始
              </button>
            </>
          )}

          {captureStatus === 'failed' && (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                再試行
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

