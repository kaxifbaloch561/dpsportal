import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectOptionsPage from "./pages/SubjectOptionsPage";
import ChaptersPage from "./pages/ChaptersPage";
import ChapterViewPage from "./pages/ChapterViewPage";
import ExercisePage from "./pages/ExercisePage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";
import ChatbotPage from "./pages/ChatbotPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/class/:classId" element={<SubjectsPage />} />
            <Route path="/class/:classId/subject/:subjectId" element={<SubjectOptionsPage />} />
            <Route path="/class/:classId/subject/:subjectId/chapters" element={<ChaptersPage />} />
            <Route path="/class/:classId/subject/:subjectId/chapter/:chapterNumber" element={<ChapterViewPage />} />
            <Route path="/class/:classId/subject/:subjectId/chapter/:chapterNumber/exercise" element={<ExercisePage />} />
            <Route path="/class/:classId/subject/:subjectId/chapter/:chapterNumber/exercise/:exerciseType" element={<ExerciseDetailPage />} />
            <Route path="/class/:classId/subject/:subjectId/chat" element={<ChatbotPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
