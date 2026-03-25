import React from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../../api/auth/authService";
import { Check } from "lucide-react";

const HomePage: React.FC = () => {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Utility Bar */}
      <div className="bg-white border-b border-gray-200"></div>

      {/* Hero Section with Full Width Image */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
        <img
          src="/img/banner.png"
          alt="オンライン日本語レッスン"
          className="w-full h-full object-cover object-left"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
            <div className="max-w-4xl">
              {/* Breadcrumbs */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <p className="text-white text-xl sm:text-xl">
                  オンライン日本語レッスン
                </p>
              </div>

              {/* Main Content */}
              <div>
                <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                  学ぼうオンライン日本語学校
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                  柔軟で個別化されたクラスで日本語のすべての分野をマスターし、いつでもどこでも日本語を学ぶことができます。
                </p>
                {!authenticated ? (
                  <Link
                    to="/login"
                    className="inline-block px-12 py-2.5 sm:px-16 sm:py-3 md:px-20 md:py-4 lg:px-24 lg:py-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors font-semibold text-sm sm:text-base md:text-lg"
                  >
                    ログイン
                  </Link>
                ) : (
                  <Link
                    to="/courses"
                    className="inline-block px-12 py-2.5 sm:px-16 sm:py-3 md:px-20 md:py-4 lg:px-24 lg:py-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors font-semibold text-sm sm:text-base md:text-lg"
                  >
                    コースを選択
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section - Image and Dropdown Content */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
            {/* Left Column - Image */}
            <div className="relative order-2 lg:order-1">
              <div
                className="h-64 sm:h-80 md:h-96 lg:h-[500px] bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('/img/business.jpg')`,
                }}
              />
              {/* Dark teal geometric shape overlay at bottom left */}
            </div>

            {/* Right Column - System Introduction */}
            <div className="flex flex-col pl-0 lg:pl-6 order-1 lg:order-2 lg:h-[500px] lg:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-6 lg:mb-8 leading-tight">
                  このようなことで日本語学習にお困りではないですか？
                </h2>

                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-gray-800">
                    {/* Row 1 - Left */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        対面授業だと時間が
                        <br />
                        合わなくて受講できない･･･
                      </span>
                    </div>
                    {/* Row 1 - Right */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        いつでもどこでも
                        <br />
                        自分のペースで学習したい
                      </span>
                    </div>
                    {/* Row 2 - Left */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        通学時間や交通費を
                        <br />
                        節約したい･･･
                      </span>
                    </div>
                    {/* Row 2 - Right */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        動画を繰り返し視聴して
                        <br />
                        理解を深めたい
                      </span>
                    </div>
                    {/* Row 3 - Left */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        忙しくて決まった時間に
                        <br />
                        通えない･･･
                      </span>
                    </div>
                    {/* Row 3 - Right */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        24時間いつでも
                        <br />
                        アクセスできる環境が欲しい･･･
                      </span>
                    </div>
                    {/* Row 4 - Left */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        教室の定員制限で
                        <br />
                        希望のクラスに入れない･･･
                      </span>
                    </div>
                    {/* Row 4 - Right */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        録画された講義を
                        <br />
                        何度でも復習できる
                      </span>
                    </div>
                    {/* Row 5 - Left */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        体調不良や急用で
                        <br />
                        授業を休むと遅れてしまう･･･
                      </span>
                    </div>
                    {/* Row 5 - Right */}
                    <div className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed">
                        欠席しても後から
                        <br />
                        学習内容を確認できる
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 text-right">
                    などなど
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
