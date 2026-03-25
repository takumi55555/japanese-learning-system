import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Face APIのモデルをロードする
 */
export const loadFaceApiModels = async (): Promise<boolean> => {
  if (modelsLoaded) {
    return true;
  }

  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face API models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face API models:', error);
    return false;
  }
};

/**
 * 画像から顔のディスクリプタを取得する
 */
export const getFaceDescriptor = async (
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> => {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return detection.descriptor;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
};

/**
 * 2つの顔ディスクリプタを比較する
 * @returns 類似度（0-1、1が完全一致）。0.6以上で同一人物と判定
 */
export const compareFaces = (
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  // 距離を類似度に変換（距離が小さいほど類似度が高い）
  return 1 - distance;
};

/**
 * ビデオストリームから顔を検出する
 */
export const detectFaceFromVideo = async (
  videoElement: HTMLVideoElement
): Promise<{
  detected: boolean;
  descriptor: Float32Array | null;
}> => {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return { detected: false, descriptor: null };
    }

    return { detected: true, descriptor: detection.descriptor };
  } catch (error) {
    console.error('Error detecting face from video:', error);
    return { detected: false, descriptor: null };
  }
};

/**
 * Base64文字列から画像要素を作成する
 */
export const base64ToImage = (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
};

/**
 * ビデオエレメントからBase64画像を取得する
 */
export const captureVideoFrame = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.95);
};

