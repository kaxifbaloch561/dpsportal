import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClassesData } from "@/hooks/useClassesData";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TeacherRequestForm from "@/components/TeacherRequestForm";

import { Sparkles, AlertTriangle, Info, Megaphone, MessagesSquare, CalendarDays } from "lucide-react";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import { supabase } from "@/integrations/supabase/client";
import DiscussionRoom from "@/components/DiscussionRoom";
import OnboardingTour from "@/components/OnboardingTour";
import { useNotifications } from "@/hooks/useNotifications";


const classThemes = [
  { bg: "linear-gradient(135deg, hsl(235,78%,62%), hsl(260,80%,55%))", shadow: "hsl(235,78%,65%)" },
  { bg: "linear-gradient(135deg, hsl(340,80%,55%), hsl(14,100%,58%))", shadow: "hsl(340,80%,55%)" },
  { bg: "linear-gradient(135deg, hsl(160,60%,38%), hsl(130,65%,45%))", shadow: "hsl(160,60%,40%)" },
  { bg: "linear-gradient(135deg, hsl(45,95%,52%), hsl(25,100%,55%))", shadow: "hsl(45,90%,50%)" },
  { bg: "linear-gradient(135deg, hsl(200,85%,50%), hsl(185,75%,42%))", shadow: "hsl(200,80%,50%)" },
  { bg: "linear-gradient(135deg, hsl(270,72%,55%), hsl(295,65%,50%))", shadow: "hsl(270,70%,55%)" },
  { bg: "linear-gradient(135deg, hsl(20,85%,52%), hsl(38,95%,50%))", shadow: "hsl(20,80%,55%)" },
  { bg: "linear-gradient(135deg, hsl(170,62%,42%), hsl(195,75%,48%))", shadow: "hsl(170,60%,45%)" },
  { bg: "linear-gradient(135deg, hsl(350,72%,52%), hsl(325,80%,48%))", shadow: "hsl(350,70%,55%)" },
  { bg: "linear-gradient(135deg, hsl(210,72%,48%), hsl(235,78%,62%))", shadow: "hsl(210,70%,50%)" },
];

const quickActions = [
  { key: "feature" as const, icon: Sparkles, label: "Ask for Features", color: "hsl(235,78%,62%)" },
  { key: "problem" as const, icon: AlertTriangle, label: "Report a Problem", color: "hsl(0,72%,55%)" },
  { key: "guide" as const, icon: Info, label: "How to Use", color: "hsl(160,60%,38%)" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: classesData = [] } = useClassesData();
  const [formType, setFormType] = useState<"feature" | "problem" | null>(null);
  
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [loginNotification, setLoginNotification] = useState<string | null>(null);
  const [announcementCount, setAnnouncementCount] = useState(0);

  // Activate browser notifications for teachers
  useNotifications();

  useEffect(() => {
    const notif = localStorage.getItem("dps_login_notification");
    if (notif) {
      setLoginNotification(notif);
      localStorage.removeItem("dps_login_notification");
    }
  }, []);

  // Fetch active announcement count
  useEffect(() => {
    const fetchCount = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, expires_at")
        .eq("is_active", true);
      if (data) {
        const active = data.filter((a: any) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now());
        setAnnouncementCount(active.length);
      }
    };
    fetchCount();
    const ch = supabase
      .channel("dashboard-ann-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => fetchCount())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <PageShell>
      <DashboardHeader subtitle="Select your class to begin" />

      {/* Action buttons row: scrollable */}
      <div className="px-3 sm:px-6 py-2">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:justify-center">
          <button
            id="tour-announcements"
            onClick={() => setShowAnnouncements(true)}
            className="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-400/15 to-amber-500/15 border border-yellow-400/30 text-yellow-600 dark:text-yellow-400 hover:from-yellow-400/25 hover:to-amber-500/25 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.97] flex-1 sm:flex-initial justify-center sm:justify-start"
          >
            <Megaphone size={14} className="sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">Announcements</span>
            {announcementCount > 0 && (
              <span className="min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 text-black text-[8px] sm:text-[9px] font-bold rounded-full px-0.5 sm:px-1 animate-pulse">
                {announcementCount}
              </span>
            )}
          </button>
          <button
            id="tour-discussion"
            onClick={() => setShowDiscussion(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary hover:from-primary/20 hover:to-primary/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.97] flex-1 sm:flex-initial justify-center sm:justify-start"
          >
            <MessagesSquare size={14} className="sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">Discussion</span>
          </button>
          <button
            onClick={() => navigate("/lesson-planner")}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.97] flex-1 sm:flex-initial justify-center sm:justify-start"
          >
            <CalendarDays size={14} className="sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">Lesson Planner</span>
          </button>
        </div>
      </div>

      <BreadcrumbNav crumbs={[{ label: "Dashboard" }]} />

      {loginNotification && (
        <div className="px-3 sm:px-8 mb-3" style={{ animation: "slideDown 0.5s ease forwards" }}>
          <div className="relative p-3 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground text-xs sm:text-sm font-medium pr-8">
            <button onClick={() => setLoginNotification(null)} className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            {loginNotification}
          </div>
        </div>
      )}

      <div className="px-3 sm:px-8 mb-4" id="tour-quick-actions">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => {
                  if (action.key === "guide") navigate("/how-to-use");
                  else setFormType(action.key);
                }}
                className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-card border border-border hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.2)] hover:-translate-y-1.5 hover:border-primary/25 transition-all duration-300 active:scale-[0.97]"
                style={{ animation: `slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.2 + i * 0.08}s`, opacity: 0 }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: action.color + "18", color: action.color }}
                >
                  <Icon size={16} />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-foreground text-center sm:text-left leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-3 sm:px-8 pb-4 sm:pb-8 overflow-y-auto">
        <div className="flex items-center gap-3 mb-3 sm:mb-5 mt-2 sm:mt-4" style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">Select Your Class</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent ml-2" />
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">{classesData.length} Classes</span>
        </div>

        <div id="tour-classes" className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-5">
          {classesData.map((cls, i) => {
            const theme = classThemes[i];
            return (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[24px] border-0 p-0 transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  animation: `cardEntrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.4 + i * 0.07}s`,
                  opacity: 0,
                  boxShadow: `0 8px 32px -8px ${theme.shadow}55`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 24px 56px -12px ${theme.shadow}aa, 0 0 0 1.5px rgba(255,255,255,0.15)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px -8px ${theme.shadow}55`; }}
              >
                <div className="absolute inset-0" style={{ background: theme.bg }} />
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
                {/* Decorative orbs */}
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/[0.08] group-hover:scale-[1.8] transition-transform duration-700 ease-out" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/[0.05] group-hover:scale-[1.5] transition-transform duration-700 delay-75 ease-out" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/[0.03] group-hover:scale-[2] transition-transform duration-1000" />
                {/* Shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
                {/* Glass border top */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 py-5 sm:py-7 px-3 sm:px-4">
                  <div className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] rounded-xl sm:rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_8px_24px_-8px_rgba(0,0,0,0.2)] group-hover:scale-110 group-hover:rotate-2 group-hover:bg-white/25 transition-all duration-500">
                    <span className="text-[24px] sm:text-[28px] font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]">{cls.id}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[13px] sm:text-[14px] font-bold text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]">{cls.name}</span>
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5 border border-white/10">
                      <span className="text-[10px] text-white/80 font-semibold">{cls.subjects.length} Subjects</span>
                    </div>
                  </div>
                  {/* Bottom accent line */}
                  <div className="relative h-0.5 w-8 rounded-full overflow-hidden bg-white/15 group-hover:w-12 transition-all duration-500">
                    <div className="absolute inset-0 bg-white/70 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {formType && <TeacherRequestForm type={formType} open={!!formType} onOpenChange={(open) => { if (!open) setFormType(null); }} />}
      
      <AnnouncementPopup open={showAnnouncements} onOpenChange={setShowAnnouncements} />
      <DiscussionRoom open={showDiscussion} onOpenChange={setShowDiscussion} />

      {user?.role === "teacher" && user.email && (
        <OnboardingTour userEmail={user.email} />
      )}
    </PageShell>
  );
};

export default Dashboard;
