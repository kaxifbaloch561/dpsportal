import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectOptionsPage from "./pages/SubjectOptionsPage";
import ChaptersPage from "./pages/ChaptersPage";
import ExercisePage from "./pages/ExercisePage";
import ChatbotPage from "./pages/ChatbotPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/class/:classId" element={<SubjectsPage />} />
          <Route path="/class/:classId/subject/:subjectId" element={<SubjectOptionsPage />} />
          <Route path="/class/:classId/subject/:subjectId/chapters" element={<ChaptersPage />} />
          <Route path="/class/:classId/subject/:subjectId/chat" element={<ChatbotPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
