import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

// Public
const Landing = lazy(() => import("@/pages/public/Landing").then((m) => ({ default: m.Landing })));
const About = lazy(() => import("@/pages/public/About").then((m) => ({ default: m.About })));
const Features = lazy(() => import("@/pages/public/Features").then((m) => ({ default: m.Features })));
const CareerDomains = lazy(() => import("@/pages/public/CareerDomains").then((m) => ({ default: m.CareerDomains })));
const CareerExplorer = lazy(() => import("@/pages/public/CareerExplorer").then((m) => ({ default: m.CareerExplorer })));
const CareerComparison = lazy(() => import("@/pages/public/CareerComparison").then((m) => ({ default: m.CareerComparison })));
const ScholarshipFinder = lazy(() => import("@/pages/public/ScholarshipFinder").then((m) => ({ default: m.ScholarshipFinder })));
const CollegeFinder = lazy(() => import("@/pages/public/CollegeFinder").then((m) => ({ default: m.CollegeFinder })));
const EntranceExams = lazy(() => import("@/pages/public/EntranceExams").then((m) => ({ default: m.EntranceExams })));
const LearningResources = lazy(() => import("@/pages/public/LearningResources").then((m) => ({ default: m.LearningResources })));
const SuccessStories = lazy(() => import("@/pages/public/SuccessStories").then((m) => ({ default: m.SuccessStories })));
const Faq = lazy(() => import("@/pages/public/Faq").then((m) => ({ default: m.Faq })));
const Contact = lazy(() => import("@/pages/public/Contact").then((m) => ({ default: m.Contact })));
const NotFound = lazy(() => import("@/pages/public/NotFound").then((m) => ({ default: m.NotFound })));

// Auth
const StudentLogin = lazy(() => import("@/pages/auth/StudentLogin").then((m) => ({ default: m.StudentLogin })));
const StudentRegister = lazy(() => import("@/pages/auth/StudentRegister").then((m) => ({ default: m.StudentRegister })));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));
const AdminLogin = lazy(() => import("@/pages/auth/AdminLogin").then((m) => ({ default: m.AdminLogin })));

// Student
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard").then((m) => ({ default: m.StudentDashboard })));
const StudentProfile = lazy(() => import("@/pages/student/StudentProfile").then((m) => ({ default: m.StudentProfile })));
const CareerAssessment = lazy(() => import("@/pages/student/CareerAssessment").then((m) => ({ default: m.CareerAssessment })));
const AiRecommendation = lazy(() => import("@/pages/student/AiRecommendation").then((m) => ({ default: m.AiRecommendation })));
const CareerDnaReport = lazy(() => import("@/pages/student/CareerDnaReport").then((m) => ({ default: m.CareerDnaReport })));
const CareerRoadmap = lazy(() => import("@/pages/student/CareerRoadmap").then((m) => ({ default: m.CareerRoadmap })));
const SkillGapAnalyzer = lazy(() => import("@/pages/student/SkillGapAnalyzer").then((m) => ({ default: m.SkillGapAnalyzer })));
const StudentCareerComparison = lazy(() => import("@/pages/student/StudentCareerComparison").then((m) => ({ default: m.StudentCareerComparison })));
const StudentCollegeFinder = lazy(() => import("@/pages/student/StudentCollegeFinder").then((m) => ({ default: m.StudentCollegeFinder })));
const StudentScholarshipFinder = lazy(() => import("@/pages/student/StudentScholarshipFinder").then((m) => ({ default: m.StudentScholarshipFinder })));
const ResumeBuilder = lazy(() => import("@/pages/student/ResumeBuilder").then((m) => ({ default: m.ResumeBuilder })));
const SavedCareers = lazy(() => import("@/pages/student/SavedCareers").then((m) => ({ default: m.SavedCareers })));
const StudentNotifications = lazy(() => import("@/pages/student/StudentNotifications").then((m) => ({ default: m.StudentNotifications })));
const StudentSettings = lazy(() => import("@/pages/student/StudentSettings").then((m) => ({ default: m.StudentSettings })));
const HelpCenter = lazy(() => import("@/pages/student/HelpCenter").then((m) => ({ default: m.HelpCenter })));
const StudentResources = lazy(() => import("@/pages/student/StudentResources").then((m) => ({ default: m.StudentResources })));
const StudentExams = lazy(() => import("@/pages/student/StudentExams").then((m) => ({ default: m.StudentExams })));
const CareerChat = lazy(() => import("@/pages/student/CareerChat").then((m) => ({ default: m.CareerChat })));
const ResumeAnalyzer = lazy(() => import("@/pages/student/ResumeAnalyzer").then((m) => ({ default: m.ResumeAnalyzer })));

// Admin
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const ManageStudents = lazy(() => import("@/pages/admin/ManageStudents").then((m) => ({ default: m.ManageStudents })));
const ManageCareers = lazy(() => import("@/pages/admin/ManageCareers").then((m) => ({ default: m.ManageCareers })));
const ManageColleges = lazy(() => import("@/pages/admin/ManageColleges").then((m) => ({ default: m.ManageColleges })));
const ManageScholarships = lazy(() => import("@/pages/admin/ManageScholarships").then((m) => ({ default: m.ManageScholarships })));
const ManageExams = lazy(() => import("@/pages/admin/ManageExams").then((m) => ({ default: m.ManageExams })));
const ManageDomains = lazy(() => import("@/pages/admin/ManageDomains").then((m) => ({ default: m.ManageDomains })));
const ManageResources = lazy(() => import("@/pages/admin/ManageResources").then((m) => ({ default: m.ManageResources })));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics })));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports").then((m) => ({ default: m.AdminReports })));
const AdminNotifications = lazy(() => import("@/pages/admin/AdminNotifications").then((m) => ({ default: m.AdminNotifications })));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/domains" element={<CareerDomains />} />
          <Route path="/explore" element={<CareerExplorer />} />
          <Route path="/compare" element={<CareerComparison />} />
          <Route path="/scholarships" element={<ScholarshipFinder />} />
          <Route path="/colleges" element={<CollegeFinder />} />
          <Route path="/exams" element={<EntranceExams />} />
          <Route path="/resources" element={<LearningResources />} />
          <Route path="/stories" element={<SuccessStories />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth (no layout) */}
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="assessment" element={<CareerAssessment />} />
          <Route path="recommendation" element={<AiRecommendation />} />
          <Route path="dna" element={<CareerDnaReport />} />
          <Route path="roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
          <Route path="skill-gap" element={<ProtectedRoute><SkillGapAnalyzer /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><CareerChat /></ProtectedRoute>} />
          <Route path="resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
          <Route path="compare" element={<StudentCareerComparison />} />
          <Route path="colleges" element={<StudentCollegeFinder />} />
          <Route path="scholarships" element={<StudentScholarshipFinder />} />
          <Route path="resume" element={<ResumeBuilder />} />
          <Route path="saved" element={<SavedCareers />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="exams" element={<StudentExams />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="careers" element={<ManageCareers />} />
          <Route path="colleges" element={<ManageColleges />} />
          <Route path="scholarships" element={<ManageScholarships />} />
          <Route path="exams" element={<ManageExams />} />
          <Route path="domains" element={<ManageDomains />} />
          <Route path="resources" element={<ManageResources />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export { AppRoutes };
