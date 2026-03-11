import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import OfflineBanner from "@/components/OfflineBanner";

// Lazy-loaded pages for fast initial load
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminContentManager = lazy(() => import("./pages/AdminContentManager"));
const PrincipalDashboard = lazy(() => import("./pages/PrincipalDashboard"));
const SubjectsPage = lazy(() => import("./pages/SubjectsPage"));
const SubjectOptionsPage = lazy(() => import("./pages/SubjectOptionsPage"));
const ChaptersPage = lazy(() => import("./pages/ChaptersPage"));
const ChapterViewPage = lazy(() => import("./pages/ChapterViewPage"));
const ExercisePage = lazy(() => import("./pages/ExercisePage"));
const ExerciseDetailPage = lazy(() => import("./pages/ExerciseDetailPage"));
const ChatbotPage = lazy(() => import("./pages/ChatbotPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HowToUsePage = lazy(() => import("./pages/HowToUsePage"));
const TeacherGuide = lazy(() => import("./pages/TeacherGuide"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — avoid refetching unchanged data
      gcTime: 10 * 60 * 1000,         // 10 min cache
      refetchOnWindowFocus: false,     // don't refetch on tab switch
      retry: 1,                        // fast fail
    },
  },
});

// Minimal full-screen spinner for route transitions
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <OfflineBanner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/how-to-use" element={<HowToUsePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/principal" element={<PrincipalDashboard />} />
              <Route path="/admin/content" element={<AdminContentManager />} />
              <Route path="/class/:classId" element={<SubjectsPage />} />
              <Route path="/class/:classId/subject/:subjectId" element={<SubjectOptionsPage />} />
              <Route path="/class/:classId/subject/:subjectId/chapters" element={<ChaptersPage />} />
              <Route path="/class/:classId/subject/:subjectId/chapter/:chapterNumber" element={<ChapterViewPage />} />
              <Route path="/class/:classId/subject/:subjectId/chapter/:chapterNumber/exercise" element={<ExercisePage />} />
              <Route path="/class/:classId/subject/:subjectId/chapter/:chapterNumber/exercise/:exerciseType" element={<ExerciseDetailPage />} />
              <Route path="/class/:classId/subject/:subjectId/chat" element={<ChatbotPage />} />
              <Route path="/teacher-guide" element={<TeacherGuide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
