import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClassesData } from "@/hooks/useClassesData";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TeacherRequestForm from "@/components/TeacherRequestForm";
import HowToUseGuide from "@/components/HowToUseGuide";
import TeacherProfile from "@/components/TeacherProfile";
import { Sparkles, AlertTriangle, Info, Mail, UserCircle2, Megaphone, MessagesSquare } from "lucide-react";
import TeacherInbox from "@/components/TeacherInbox";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import { supabase } from "@/integrations/supabase/client";
import DiscussionRoom from "@/components/DiscussionRoom";

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
  const [showGuide, setShowGuide] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [loginNotification, setLoginNotification] = useState<string | null>(null);
  const [announcementCount, setAnnouncementCount] = useState(0);

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
      {/* Fixed top corners: Inbox (left) & Profile (right) */}
      <div className="flex items-center justify-between px-3 sm:px-6 pt-3 sm:pt-4">
        <button
          onClick={() => setShowInbox(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300 active:scale-[0.97]"
        >
          <Inbox size={15} />
          <span className="text-[10px] sm:text-xs font-bold">My Inbox</span>
        </button>
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300 active:scale-[0.97]"
        >
          <User size={15} />
          <span className="text-[10px] sm:text-xs font-bold">My Profile</span>
        </button>
      </div>

      <DashboardHeader subtitle="Select your class to begin" />

      {/* Action buttons row: scrollable */}
      <div className="px-3 sm:px-6 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max justify-center">
          <button
            onClick={() => setShowAnnouncements(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-yellow-400/15 to-amber-500/15 border border-yellow-400/30 text-yellow-600 dark:text-yellow-400 hover:from-yellow-400/25 hover:to-amber-500/25 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.97] shrink-0"
          >
            <Megaphone size={16} />
            <span className="text-xs font-bold whitespace-nowrap">Announcements</span>
            {announcementCount > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 text-black text-[9px] font-bold rounded-full px-1 animate-pulse">
                {announcementCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowDiscussion(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary hover:from-primary/20 hover:to-primary/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.97] shrink-0"
          >
            <MessagesSquare size={16} />
            <span className="text-xs font-bold whitespace-nowrap">Discussion</span>
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

      <div className="px-3 sm:px-8 mb-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => {
                  if (action.key === "guide") setShowGuide(true);
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

      <div className="flex-1 px-3 sm:px-8 pb-4 sm:pb-8">
        <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-3 sm:mb-6 mt-2 sm:mt-4" style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
          Select Your Class
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {classesData.map((cls, i) => {
            const theme = classThemes[i];
            return (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[28px] border-0 p-0 transition-all duration-500 hover:-translate-y-5 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  animation: `cardEntrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.4 + i * 0.07}s`,
                  opacity: 0,
                  boxShadow: `0 8px 32px -8px ${theme.shadow}55`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 24px 64px -12px ${theme.shadow}99, 0 0 0 2px rgba(255,255,255,0.2)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px -8px ${theme.shadow}55`; }}
              >
                <div className="absolute inset-0" style={{ background: theme.bg }} />
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/[0.07] group-hover:scale-125 transition-transform duration-700 delay-100" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: "shimmer 2s ease-in-out infinite" }} />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4 py-8 px-5" style={{ animation: "float 4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>
                  <div className="w-[72px] h-[72px] rounded-[20px] bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_-6px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/30 transition-all duration-500">
                    <span className="text-[32px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{cls.id}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[15px] font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">{cls.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                      <span className="text-[11px] text-white/75 font-semibold uppercase tracking-widest">{cls.subjects.length} Subjects</span>
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                    </div>
                  </div>
                  <div className="relative h-1 w-10 rounded-full overflow-hidden bg-white/20 group-hover:w-14 transition-all duration-600">
                    <div className="absolute inset-0 bg-white/60 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {formType && <TeacherRequestForm type={formType} open={!!formType} onOpenChange={(open) => { if (!open) setFormType(null); }} />}
      <HowToUseGuide open={showGuide} onOpenChange={setShowGuide} />
      <TeacherInbox open={showInbox} onOpenChange={setShowInbox} />
      <TeacherProfile open={showProfile} onOpenChange={setShowProfile} />
      <AnnouncementPopup open={showAnnouncements} onOpenChange={setShowAnnouncements} />
      <DiscussionRoom open={showDiscussion} onOpenChange={setShowDiscussion} />
    </PageShell>
  );
};

export default Dashboard;
