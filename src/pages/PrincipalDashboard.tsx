import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import { MessageSquare, Megaphone, MessagesSquare, Users, UserPlus, LogOut, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import PrincipalMessaging from "@/components/admin/PrincipalMessaging";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminTeacherPreview from "@/components/admin/AdminTeacherPreview";
import AdminTeacherAccounts from "@/components/admin/AdminTeacherAccounts";
import DiscussionRoom from "@/components/DiscussionRoom";
import AdminLessonPlanner from "@/components/admin/AdminLessonPlanner";

const tabs = [
  { key: "messaging", label: "Messages", icon: MessageSquare },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "discussion", label: "Discussion", icon: MessagesSquare },
  { key: "teacher", label: "Teacher Panel", icon: Users },
  { key: "accounts", label: "Teacher Accounts", icon: UserPlus },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const PrincipalDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("messaging");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showDiscussion, setShowDiscussion] = useState(false);

  const fetchCounts = async () => {
    const { count } = await supabase
      .from("admin_messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_email", "principal.access@dps.portal")
      .eq("is_read", false);
    setUnreadMessages(count ?? 0);
  };

  useEffect(() => {
    fetchCounts();
    const ch = supabase
      .channel("principal-badge-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => fetchCounts())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const getBadge = (key: string) => {
    if (key === "messaging" && unreadMessages > 0) return unreadMessages;
    return 0;
  };

  return (
    <PageShell>
      <DashboardHeader subtitle="Principal Panel" />

      <div className="px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut size={16} /> Logout
        </Button>
      </div>

      <div className="px-3 sm:px-6 mb-3 sm:mb-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key && tab.key !== "discussion";
            const badge = getBadge(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === "discussion") {
                    setShowDiscussion(true);
                  } else {
                    setActiveTab(tab.key);
                  }
                }}
                className={`relative flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 active:scale-[0.96] ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.5)] scale-[1.02]"
                    : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.2)] hover:border-primary/25"
                }`}
              >
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 min-w-[18px] h-[18px] sm:min-w-[22px] sm:h-[22px] flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] sm:text-[11px] font-bold rounded-full px-1 animate-pulse shadow-lg">
                    {badge}
                  </span>
                )}
                <Icon size={18} />
                <span className="text-[8px] sm:text-[10px] font-semibold text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "messaging" && <PrincipalMessaging />}
        {activeTab === "announcements" && <AdminAnnouncements />}
        {activeTab === "teacher" && <AdminTeacherPreview />}
        {activeTab === "accounts" && <AdminTeacherAccounts isPrincipal />}
      </div>

      <DiscussionRoom open={showDiscussion} onOpenChange={setShowDiscussion} />
    </PageShell>
  );
};

export default PrincipalDashboard;
