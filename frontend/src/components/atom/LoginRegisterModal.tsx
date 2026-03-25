import React, { useState } from 'react';
import { X, User, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../hooks/useToast';
import { getApiUrl } from '../../utils/apiConfig';
import { FaceRegistrationModal } from './FaceRegistrationModal';

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  redirectPath?: string;
}

export const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  redirectPath: _redirectPath,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);
  const { refreshData } = useData();
  const { showToast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginData.email.trim() || !loginData.password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      setLoading(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }

      // Store user data and token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      await refreshData();

      showToast({
        type: 'success',
        title: 'ログイン成功',
        message: `ようこそ、${data.user?.username}さん！`,
        duration: 3000,
      });

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました';
      setError(message);
      showToast({
        type: 'error',
        title: 'ログインエラー',
        message: message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!registerData.username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }
    if (!registerData.email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    if (!registerData.password) {
      setError('パスワードを入力してください');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (registerData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    // Show face registration modal
    setShowFaceRegistrationModal(true);
  };

  const handleFaceRegistrationSuccess = async (
    descriptor: Float32Array,
    imageData: string
  ) => {
    setShowFaceRegistrationModal(false);

    try {
      setLoading(true);

      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          role: 'student',
          faceDescriptor: Array.from(descriptor),
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`サーバーエラー: ${response.status} - ${responseText || '不明なエラー'}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || '登録に失敗しました');
      }

      // Store user data and token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Register face data in FaceData collection
      if (descriptor && imageData) {
        try {
          const faceResponse = await fetch(`${API_URL}/api/face/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({
              userId: data.user.id,
              descriptor: Array.from(descriptor),
              imageData: imageData,
            }),
          });

          if (!faceResponse.ok) {
            console.error('Failed to register face data');
          }
        } catch (faceError) {
          console.error('Error registering face:', faceError);
        }
      }

      await refreshData();

      showToast({
        type: 'success',
        title: 'アカウント作成完了！',
        message: `ようこそ、${data.user?.username}さん！`,
        duration: 4000,
      });

      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '登録に失敗しました。もう一度お試しください。';
      setError(message);
      showToast({
        type: 'error',
        title: '登録エラー',
        message: message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'ログイン' : 'ユーザー登録'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-6">
              コースを購入するには、ログインまたは登録が必要です。
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                新規登録
              </button>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="メールアドレス"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="パスワード"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-primary-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary-400" />
                    )}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-bold hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Username */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, username: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="ユーザー名"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="メールアドレス"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="パスワード"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-primary-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary-400" />
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="パスワード確認"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-primary-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary-400" />
                    )}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-bold hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      登録中...
                    </>
                  ) : (
                    '登録'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Face Registration Modal for Register Mode */}
      {mode === 'register' && (
        <FaceRegistrationModal
          isOpen={showFaceRegistrationModal}
          onClose={() => setShowFaceRegistrationModal(false)}
          onRegistrationSuccess={handleFaceRegistrationSuccess}
          title="顔登録"
          description="アカウント登録のために顔を登録してください。カメラの前に顔を向けて「撮影開始」をクリックしてください。"
        />
      )}
    </>
  );
};

export default LoginRegisterModal;

