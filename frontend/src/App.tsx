import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./app/homepage/HomePage";
import Login from "./app/auth/Login";
import CourseSelection from "./app/courses/CourseSelection";
import CourseLearning from "./app/courses/CourseLearning";
import Payment from "./app/payment/Payment";
import PaymentSuccess from "./app/payment/PaymentSuccess";
import { ProfileManagement } from "./app/profile/Profile";
import { AdminDashboard } from "./app/dashboard/AdminDashboard";
import MaterialManagement from "./app/admin/MaterialManagement";
import StudentManagement from "./app/admin/StudentManagement";
import ExamQuestionManagement from "./app/admin/ExamQuestionManagement";
import ExamQuestionForm from "./app/admin/ExamQuestionForm";
import ExamManagement from "./app/admin/ExamManagement";
import ExamSettings from "./app/admin/ExamSettings";
import NotificationManagement from "./app/admin/NotificationManagement";
import TextToPdf from "./app/admin/TextToPdf";
import CertificateGenerator from "./app/admin/CertificateGenerator";
import GroupAdminManagement from "./app/admin/GroupAdminManagement";
import ExamRoom from "./app/student/ExamRoom";
import ExamTaking from "./app/student/ExamTaking";
import ExamResults from "./app/student/ExamResults";
import ExamReview from "./app/student/ExamReview";
import Help from "./app/help/Help";
import { StudentLayout } from "./components/layout/StudentLayout";
import {
  AdminRoute,
  StudentRoute,
  PublicOrStudentRoute,
  GroupAdminRoute,
} from "./components/auth/ProtectedRoute";
import GroupAdminDashboard from "./app/group-admin/GroupAdminDashboard";
import TicketPurchaseSuccess from "./app/group-admin/TicketPurchaseSuccess";
import GroupAdminPurchase from "./app/group-admin/GroupAdminPurchase";
import GroupAdminPurchaseSuccess from "./app/group-admin/GroupAdminPurchaseSuccess";
import GroupAdminInfoForm from "./app/group-admin/GroupAdminInfoForm";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public routes - accessible by guests and students, but not admins */}
          <Route
            path="/"
            element={
              <PublicOrStudentRoute>
                <StudentLayout>
                  <HomePage />
                </StudentLayout>
              </PublicOrStudentRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/courses"
            element={
              <PublicOrStudentRoute>
                <StudentLayout>
                  <CourseSelection />
                </StudentLayout>
              </PublicOrStudentRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PublicOrStudentRoute>
                <StudentLayout>
                  <Help />
                </StudentLayout>
              </PublicOrStudentRoute>
            }
          />
          <Route
            path="/course/:courseId/learning"
            element={
              <StudentRoute>
                <StudentLayout>
                  <CourseLearning />
                </StudentLayout>
              </StudentRoute>
            }
          />
          {/* Payment routes - accessible by guests and students, but not admins */}
          <Route
            path="/payment"
            element={
              <PublicOrStudentRoute>
                <StudentLayout>
                  <Payment />
                </StudentLayout>
              </PublicOrStudentRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <StudentRoute>
                <StudentLayout>
                  <PaymentSuccess />
                </StudentLayout>
              </StudentRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/material-management"
            element={
              <AdminRoute>
                <MaterialManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/student-management"
            element={
              <AdminRoute>
                <StudentManagement />
              </AdminRoute>
            }
          />

          {/* Exam Question Management Routes */}
          <Route
            path="/admin/question-management"
            element={
              <AdminRoute>
                <ExamQuestionManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/question-management/create"
            element={
              <AdminRoute>
                <ExamQuestionForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/question-management/:id/edit"
            element={
              <AdminRoute>
                <ExamQuestionForm />
              </AdminRoute>
            }
          />

          {/* Exam Management Routes */}
          <Route
            path="/admin/exam-management"
            element={
              <AdminRoute>
                <ExamManagement />
              </AdminRoute>
            }
          />

          {/* Exam Settings Routes */}
          <Route
            path="/admin/exam-settings"
            element={
              <AdminRoute>
                <ExamSettings />
              </AdminRoute>
            }
          />

          {/* Notification Management Routes */}
          <Route
            path="/admin/notifications"
            element={
              <AdminRoute>
                <NotificationManagement />
              </AdminRoute>
            }
          />

          {/* Text to PDF Routes */}
          <Route
            path="/admin/text-to-pdf"
            element={
              <AdminRoute>
                <TextToPdf />
              </AdminRoute>
            }
          />

          {/* Certificate Generator Routes */}
          <Route
            path="/admin/certificate-generator"
            element={
              <AdminRoute>
                <CertificateGenerator />
              </AdminRoute>
            }
          />

          {/* Group Admin Management Routes */}
          <Route
            path="/admin/group-admin-management"
            element={
              <AdminRoute>
                <GroupAdminManagement />
              </AdminRoute>
            }
          />

          {/* Student Exam Routes */}
          <Route
            path="/exam-room"
            element={
              <StudentRoute>
                <StudentLayout>
                  <ExamRoom />
                </StudentLayout>
              </StudentRoute>
            }
          />
          <Route
            path="/exam-taking"
            element={
              <StudentRoute>
                <StudentLayout>
                  <ExamTaking />
                </StudentLayout>
              </StudentRoute>
            }
          />
          <Route
            path="/exam-results"
            element={
              <StudentRoute>
                <StudentLayout>
                  <ExamResults />
                </StudentLayout>
              </StudentRoute>
            }
          />
          <Route
            path="/exam-review"
            element={
              <StudentRoute>
                <StudentLayout>
                  <ExamReview />
                </StudentLayout>
              </StudentRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <StudentRoute>
                <StudentLayout>
                  <ProfileManagement />
                </StudentLayout>
              </StudentRoute>
            }
          />

          {/* Group Admin Routes */}
          <Route
            path="/group-admin/profile"
            element={
              <GroupAdminRoute>
                <StudentLayout>
                  <ProfileManagement />
                </StudentLayout>
              </GroupAdminRoute>
            }
          />
          <Route
            path="/group-admin/ticket-sale"
            element={
              <GroupAdminRoute>
                <StudentLayout>
                  <GroupAdminDashboard />
                </StudentLayout>
              </GroupAdminRoute>
            }
          />
          <Route
            path="/group-admin/ticket-purchase-success"
            element={
              <GroupAdminRoute>
                <TicketPurchaseSuccess />
              </GroupAdminRoute>
            }
          />
          {/* Public Group Admin Purchase Routes */}
          <Route
            path="/group-admin/info-form"
            element={
              <PublicOrStudentRoute>
                <StudentLayout>
                  <GroupAdminInfoForm />
                </StudentLayout>
              </PublicOrStudentRoute>
            }
          />
          <Route
            path="/group-admin/purchase"
            element={<GroupAdminPurchase />}
          />
          <Route
            path="/group-admin/purchase-success"
            element={<GroupAdminPurchaseSuccess />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
