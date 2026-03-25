import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Home,
  Edit,
  Award,
  Settings,
  CheckCircle,
  AlertCircle,
  Ticket,
  X,
  Info,
  Monitor,
  Calendar,
  FileCheck,
  Phone,
} from "lucide-react";

const Help: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const openDetailModal = (sectionId: string) => {
    setOpenModal(sectionId);
  };

  const closeModal = () => {
    setOpenModal(null);
  };

  const sections = [
    {
      id: "getting-started",
      title: "はじめに",
      icon: Home,
      iconComponent: Info,
      preview: "オンライン学習システムの概要と基本的な使い方をご案内します。",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            学ぼう国際研修センターのオンライン学習システムへようこそ。このシステムは、グループ管理者によるチケット購入・発行システムと、学生によるオンライン学習・試験機能を提供します。
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2">システムの特徴</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>グループ管理者によるチケット購入・発行システム</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>24時間いつでもアクセス可能な学習プラットフォーム</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  チケット発行時に保存された顔認証コードによる試験セキュリティ体制構築
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>修了証明書の発行</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "ticket-system",
      title: "チケットシステムについて",
      icon: Ticket,
      iconComponent: Monitor,
      preview:
        "グループ管理者がチケットを購入・発行し、学生がコースを受講できるシステムです。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              チケットシステムの概要
            </h4>
            <p className="text-gray-700 text-sm mb-3">
              このシステムでは、グループ管理者がチケットを購入し、学生に発行することで、学生がコースを受講できるようになります。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
              <h5 className="font-semibold text-gray-900 mb-2">
                重要な注意事項
              </h5>
              <p className="text-gray-700 text-sm mb-2">
                <strong>メールによるログイン情報の送信について：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-2">
                <li>
                  グループ管理者がチケットを購入した際、メールでチケット情報（PDFファイル）が自動的に送信されます
                </li>
                <li>
                  グループ管理者がチケットを学生に発行（割り当て）した際、メールで学生にログイン情報（PDFファイル）が自動的に送信されます
                </li>
                <li>
                  これらのメールには機密情報（ログインID、パスワード）が含まれています
                </li>
                <li>
                  <strong className="text-red-600">
                    メールに記載されたログイン情報は、必ず安全に保管し、第三者に公開・伝達しないでください
                  </strong>
                </li>
                <li>
                  PDFファイルにはログイン方法と注意事項が記載されています。必ず確認してください
                </li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              グループ管理者：チケット購入の流れ
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>グループ管理者としてログイン</li>
              <li>
                「チケット購入」ページから希望のコースとチケット枚数を選択
              </li>
              <li>決済を完了</li>
              <li>
                <strong>
                  購入完了後、登録メールアドレスにチケット情報を含むPDFファイルが自動送信されます
                </strong>
              </li>
              <li>
                メールに添付されたPDFファイルを確認し、チケット情報を安全に保管してください
              </li>
            </ol>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 text-sm">
                    <strong>重要：</strong>
                    メールに送信されたチケット情報（ログインID、パスワード）は、学生に発行するまで安全に保管してください。第三者に公開・伝達しないでください。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              グループ管理者：チケット発行（学生への割り当て）の流れ
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>グループ管理者としてログイン</li>
              <li>「受講者登録」ページからチケットを選択</li>
              <li>学生情報（名前、メールアドレス、生年月日、顔写真）を入力</li>
              <li>チケットを学生に割り当て</li>
              <li>
                <strong>
                  割り当て完了後、学生のメールアドレスにログイン情報を含むPDFファイルが自動送信されます
                </strong>
              </li>
              <li>学生にメールが届いたことを確認してください</li>
            </ol>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 text-sm font-semibold mb-1">
                    絶対に忘れてはならないこと：
                  </p>
                  <p className="text-gray-700 text-sm">
                    チケットを発行した際、学生にメールでログイン情報が送信されることを、必ず学生に伝達してください。学生がメールを確認できるように案内してください。メールに記載されたログイン情報は、学生本人のみが使用できる機密情報です。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              学生：ログインの流れ
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>
                グループ管理者からチケットが発行されると、登録メールアドレスにログイン情報が送信されます
              </li>
              <li>
                メールに添付されたPDFファイルを開き、ログインIDとパスワードを確認してください
              </li>
              <li>トップページの「ログイン」ボタンをクリック</li>
              <li>メールに記載されたログインIDとパスワードを入力</li>
              <li>初回ログイン時は、自動的に学生アカウントが作成されます</li>
              <li>ログイン後、割り当てられたコースにアクセスできます</li>
            </ol>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 text-sm">
                    <strong>注意：</strong>
                    チケットが割り当てられていない場合、ログインできません。グループ管理者に連絡してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "courses",
      title: "コースの学習",
      icon: BookOpen,
      iconComponent: Calendar,
      preview: "自分のペースで、好きな時間に学習を進められます。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">コースの種類</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">
                  一般講習（¥4,500）
                </h5>
                <p className="text-gray-700 text-sm">
                  日常生活や職場で必要な基本的な日本語スキルと文化的知識を習得
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">
                  介護講習（¥6,500）
                </h5>
                <p className="text-gray-700 text-sm">
                  介護職に従事するための専門的なスキルと理論的知識を習得
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">
                  介護基礎研修（特定）（¥8,500）
                </h5>
                <p className="text-gray-700 text-sm">
                  特定技能外国人向けの介護基礎研修で、指定技能者資格取得を目指す
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">
                  介護職員初任者研修（¥7,500）
                </h5>
                <p className="text-gray-700 text-sm">
                  介護職員として必要な基本的な技術と知識を習得する入門コース
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">
                  日本語能力試験対策（¥5,500）
                </h5>
                <p className="text-gray-700 text-sm">
                  JLPT各レベルに特化した対策講座で、合格を目指す集中学習
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">学習の進め方</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>
                ログイン後、ナビゲーションメニューから「講習内容と費用」を選択
              </li>
              <li>割り当てられたコースの「学習を開始」ボタンをクリック</li>
              <li>
                コースページで学習教材（動画、PDF、ドキュメント）にアクセス
              </li>
              <li>各教材を順番に学習していきます</li>
              <li>
                動画視聴終了後は、プレイヤー機能バーの保存ボタンを押すことで学習完了と記録されます
              </li>
              <li>
                学習動画と文書資料をお気に入りリストに登録し、いつでも閲覧可能です
              </li>
            </ol>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">注意事項</h4>
                <p className="text-gray-700 text-sm">
                  コースの学習を完了しないと、試験を受けることができません。すべての教材を学習してから試験に臨みましょう。
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "materials",
      title: "学習教材",
      icon: FileText,
      iconComponent: FileText,
      preview: "動画、PDF、ドキュメントなどの学習教材を閲覧できます。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">教材の種類</h4>
            <div className="space-y-2 text-gray-700 text-sm">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>動画教材：</strong>
                  講師による解説動画で、視覚的に学習できます
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>PDF教材：</strong>
                  テキストや資料をPDF形式で提供
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>ドキュメント教材：</strong>
                  Word形式などの詳細な資料
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">教材の閲覧方法</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>コース学習ページにアクセス</li>
              <li>教材一覧から閲覧したい教材を選択</li>
              <li>動画はページ内で再生、PDFやドキュメントはダウンロード可能</li>
              <li>
                学習動画と文書資料をお気に入りリストに登録し、いつでも閲覧可能です
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "exams",
      title: "試験について",
      icon: Edit,
      iconComponent: FileCheck,
      preview:
        "AI顔認証システムによるセキュアな試験環境で、学習内容を確認できます。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              試験を受ける条件
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li>関連するコースの学習を完了していること</li>
              <li>
                チケット発行時に登録された顔認証コードが正常に照合できること
              </li>
              <li>試験の有効期限内であること</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">試験の流れ</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>
                <strong>試験ルームへアクセス：</strong>
                ナビゲーションメニューから「試験ルーム」を選択
              </li>
              <li>
                <strong>顔認証：</strong>
                AI顔認証システムにより、本人確認を行います
                <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                  <li>
                    カメラで顔を撮影し、チケット発行時に登録された顔写真と照合します
                  </li>
                  <li>明るい場所でカメラの前に座ってください</li>
                  <li>顔がはっきり見えるようにしてください</li>
                  <li>認証が成功すると試験を開始できます</li>
                  <li>
                    このシステムにより、試験のセキュリティが確保されています
                  </li>
                </ul>
              </li>
              <li>
                <strong>試験開始：</strong>
                試験問題に回答していきます
                <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                  <li>制限時間内に回答を完了してください</li>
                  <li>回答は自動的に保存されます</li>
                  <li>途中で退出することもできますが、時間は経過します</li>
                </ul>
              </li>
              <li>
                <strong>試験中の顔認証確認：</strong>
                試験中は15分ごとにカメラによる顔認証確認が自動的に行われます
                <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                  <li>
                    15分ごとにカメラで顔を撮影し、チケット発行時に登録された顔認証コードと照合します
                  </li>
                  <li>
                    この認証確認が正常に完了しない場合、試験を継続できません
                  </li>
                  <li>
                    認証に失敗した場合は、再度顔認証を行うことで試験を継続できます
                  </li>
                  <li>明るい場所でカメラの前に顔を向けてください</li>
                  <li>顔がはっきり見えるようにしてください</li>
                  <li>
                    このシステムにより、試験中のセキュリティが確保されています
                  </li>
                </ul>
              </li>
              <li>
                <strong>結果確認：</strong>
                試験終了後、結果とフィードバックを確認できます
              </li>
              <li>
                <strong>復習：</strong>
                間違えた問題を復習して理解を深めます
              </li>
            </ol>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  試験の注意事項
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>
                    試験中は他のタブやアプリケーションを開かないでください
                  </li>
                  <li>カンニング行為は厳禁です</li>
                  <li>試験時間は延長できません</li>
                  <li>ネットワーク接続が切れた場合、時間は経過し続けます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "certificates",
      title: "修了証明書",
      icon: Award,
      iconComponent: Award,
      preview:
        "学習完了と試験合格により、修了証明書の発行リクエストが自動送信されます。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              証明書の発行条件
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li>コースのすべての教材を学習完了していること</li>
              <li>試験で70点以上を取得していること</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              証明書の発行リクエスト
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>
                試験で70点以上を取得すると、自動的に管理者へ修了証発行リクエストが送信されます
              </li>
              <li>
                管理者が通知アイコンから修了証発行リクエストを確認できます
              </li>
              <li>管理者が修了証を発行すると、受講生に通知が送信されます</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "troubleshooting",
      title: "よくある問題と解決方法",
      icon: HelpCircle,
      iconComponent: HelpCircle,
      preview: "よくある問題とその解決方法をご案内します。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              ログインできない
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
              <li>
                メールに記載されたログインIDとパスワードが正しいか確認してください
              </li>
              <li>パスワードは大文字・小文字を区別します</li>
              <li>
                チケットが割り当てられているか確認してください（割り当てられていない場合はログインできません）
              </li>
              <li>ブラウザのキャッシュをクリアしてみてください</li>
              <li>
                それでも解決しない場合は、グループ管理者に連絡してください
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              メールが届かない
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
              <li>迷惑メールフォルダを確認してください</li>
              <li>メールアドレスが正しく登録されているか確認してください</li>
              <li>グループ管理者に連絡し、メール送信状況を確認してください</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              動画が再生されない
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
              <li>インターネット接続を確認してください</li>
              <li>ブラウザを最新版に更新してください</li>
              <li>別のブラウザで試してみてください</li>
              <li>動画プレーヤーの設定を確認してください</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              顔認証が失敗する
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
              <li>明るい場所でカメラの前に座ってください</li>
              <li>顔がはっきり見えるようにしてください</li>
              <li>カメラのアクセス許可を確認してください</li>
              <li>別のブラウザで試してみてください</li>
              <li>
                チケット発行時に登録された顔写真と似た環境で撮影してください
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              試験中にエラーが発生した
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
              <li>
                ページをリロードしてみてください（回答は保存されています）
              </li>
              <li>ネットワーク接続を確認してください</li>
              <li>ブラウザのコンソールでエラーメッセージを確認してください</li>
              <li>問題が続く場合は、システム管理者に連絡してください</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "お問い合わせ",
      icon: Settings,
      iconComponent: Phone,
      preview: "サポートへの連絡方法とお問い合わせ先をご案内します。",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              サポートへの連絡方法
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-medium text-gray-900 mb-1">
                  電話でのお問い合わせ
                </h5>
                <p className="text-gray-700 text-sm">+81 (0)3 1234 5678</p>
                <p className="text-gray-600 text-xs mt-1">
                  営業時間：月曜日-金曜日 9:00-18:00、土曜日 9:00-17:00
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-1">
                  メールでのお問い合わせ
                </h5>
                <p className="text-gray-700 text-sm">nakano@manabou.co.jp</p>
                <p className="text-gray-600 text-xs mt-1">
                  24時間受付、通常1-2営業日以内に返信いたします
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-1">所在地</h5>
                <p className="text-gray-700 text-sm">
                  学ぼう国際研修センター
                  <br />
                  〒150-0001 東京都渋谷区神宮前1-1-1 学ぼうビル 3階
                  <br />
                  Tokyo, Japan
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              お問い合わせの際にご準備いただく情報
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>お名前とメールアドレス</li>
              <li>ご利用中のアカウント情報（ログインID）</li>
              <li>問題が発生した日時と状況</li>
              <li>エラーメッセージ（該当する場合）</li>
              <li>使用しているブラウザとOSの情報</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  // 8 distinct images for 8 steps
  const stepImages = [
    "/img/introduce.jpg", // Step 1
    "/img/conversation.jpg", // Step 2
    "/img/lecture.jpg", // Step 3
    "/img/exam2.jpg", // Step 4
    "/img/business.jpg", // Step 5
    "/img/train.jpg", // Step 6
    "/img/online.jpg", // Step 7
    "/img/exam3.jpg", // Step 8
  ];

  const getImageForStep = (index: number) => {
    return stepImages[index] || stepImages[0];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
        <img
          src="/img/help.png"
          alt="Help"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase mb-2">
              ヘルプ & ガイド
            </h1>
            <p className="text-xl text-white/90">
              オンライン学習システムの使い方ガイド
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#f5f5f0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              このガイドでは、学ぼう国際研修センターのオンライン学習システムの使い方を詳しく説明します。
            </p>
          </div>

          {/* Timeline Layout - Matching uploaded image design */}
          <div className="relative pb-8">
            {/* Thick Vertical Timeline Bar - Positioned left-center, starting from first icon, ending at last icon */}
            <div
              className="absolute left-[30%] w-[40px] top-[225px] z-20 -ml-[20px]"
              style={{
                height: "calc((450px + 16px) * 7)",
                background:
                  "linear-gradient(to bottom, #FF6B35 0%, #FF8C5A 50%, #FFB380 100%)",
              }}
            >
              {/* Top Cap - Positioned at first icon center, will be obscured by icon */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-[#FF6B35] rounded-full z-20"></div>
              {/* Bottom Cap - Positioned at last icon center, will be obscured by icon */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-[#FF6B35] rounded-full z-20"></div>
            </div>
            {/* Desktop version with different height */}
            <div
              className="hidden lg:block absolute left-[30%] w-[40px] top-[250px] z-20 -ml-[20px]"
              style={{
                height: "calc((500px + 16px) * 7)",
                background:
                  "linear-gradient(to bottom, #FF6B35 0%, #FF8C5A 50%, #FFB380 100%)",
              }}
            >
              {/* Top Cap */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-[#FF6B35] rounded-full z-20"></div>
              {/* Bottom Cap */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-[#FF6B35] rounded-full z-20"></div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4">
              {sections.map((section, index) => {
                const isLeft = index % 2 === 0;
                const IconComponent = section.iconComponent || section.icon;
                const stepImage = getImageForStep(index);

                return (
                  <div
                    key={section.id}
                    className="relative h-[450px] lg:h-[500px] w-full"
                  >
                    {/* Image - Left side (absolute positioned) */}
                    {isLeft && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] z-10">
                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg">
                          <img
                            src={stepImage}
                            alt={section.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image - Right side (absolute positioned) */}
                    {!isLeft && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] z-10">
                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg">
                          <img
                            src={stepImage}
                            alt={section.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                      </div>
                    )}

                    {/* Icon on the vertical line - Much larger and prominent */}
                    <div className="absolute left-[30%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                      <div className="relative w-28 h-28 lg:w-32 lg:h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] cursor-pointer">
                        {/* Icon */}
                        <IconComponent className="w-12 h-12 lg:w-14 lg:h-14 text-[#fa7d58] transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Text Content - Right side of line (absolute positioned) */}
                    <div className="absolute left-[38%] top-1/2 transform -translate-y-1/2 z-40 max-w-[320px] lg:max-w-[450px] pr-4">
                      <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                        {section.title}
                      </h2>
                      <p className="leading-relaxed mb-4 lg:mb-6 text-base lg:text-xl text-gray-700">
                        {section.preview || "クリックして詳細を表示"}
                      </p>
                      <button
                        onClick={() => openDetailModal(section.id)}
                        className="text-[#FF6B35] hover:text-[#E55A2B] font-medium text-sm lg:text-lg underline transition-colors"
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed content */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">
                {sections.find((s) => s.id === openModal)?.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 text-gray-700">
                {sections.find((s) => s.id === openModal)?.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
