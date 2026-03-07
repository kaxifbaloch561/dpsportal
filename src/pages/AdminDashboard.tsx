import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import { Bell, BookOpen, Users, LogOut, UserPlus, GraduationCap, MessageSquare, Megaphone, MessagesSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminTeacherPreview from "@/components/admin/AdminTeacherPreview";
import AdminTeacherAccounts from "@/components/admin/AdminTeacherAccounts";
import AdminClassesManager from "@/components/admin/AdminClassesManager";
import AdminMessaging from "@/components/admin/AdminMessaging";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminMessageMonitor from "@/components/admin/AdminMessageMonitor";
import DiscussionRoom from "@/components/DiscussionRoom";

const tabs = [
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "content", label: "Manage Content", icon: BookOpen },
  { key: "classes", label: "Classes", icon: GraduationCap },
  { key: "messaging", label: "Messages", icon: MessageSquare },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "discussion", label: "Discussion", icon: MessagesSquare },
  { key: "monitor", label: "Monitor", icon: Eye },
  { key: "teacher", label: "Teacher Panel", icon: Users },
  { key: "accounts", label: "Teacher Accounts", icon: UserPlus },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("notifications");
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [pendingAccounts, setPendingAccounts] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showDiscussion, setShowDiscussion] = useState(false);

  const fetchCounts = async () => {
    const [notifRes, accountRes, msgRes] = await Promise.all([
      supabase.from("teacher_requests").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("teacher_accounts").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("admin_messages").select("id", { count: "exact", head: true }).eq("sender_type", "teacher").eq("is_read", false),
    ]);
    setUnreadNotifs(notifRes.count ?? 0);
    setPendingAccounts(accountRes.count ?? 0);
    setUnreadMessages(msgRes.count ?? 0);
  };

  useEffect(() => {
    fetchCounts();
    const ch1 = supabase
      .channel("admin-badge-notifs")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_requests" }, () => fetchCounts())
      .subscribe();
    const ch2 = supabase
      .channel("admin-badge-accounts")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_accounts" }, () => fetchCounts())
      .subscribe();
    const ch3 = supabase
      .channel("admin-badge-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => fetchCounts())
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); supabase.removeChannel(ch3); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchCounts, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate("/"); };

  const getBadge = (key: string) => {
    if (key === "notifications" && unreadNotifs > 0) return unreadNotifs;
    if (key === "accounts" && pendingAccounts > 0) return pendingAccounts;
    if (key === "messaging" && unreadMessages > 0) return unreadMessages;
    return 0;
  };

  return (
    <PageShell>
      <DashboardHeader subtitle="Admin Panel" />

      <div className="px-6 py-3 flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut size={16} /> Logout
        </Button>
      </div>

      <div className="px-6 mb-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const badge = getBadge(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === "content") {
                    navigate("/admin/content");
                  } else if (tab.key === "discussion") {
                    setShowDiscussion(true);
                  } else {
                    setActiveTab(tab.key);
                  }
                }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 active:scale-[0.96] ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.5)] scale-[1.02]"
                    : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.2)] hover:border-primary/25"
                }`}
              >
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] flex items-center justify-center bg-destructive text-destructive-foreground text-[11px] font-bold rounded-full px-1.5 animate-pulse shadow-lg">
                    {badge}
                  </span>
                )}
                <Icon size={20} />
                <span className="text-[10px] font-semibold text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "notifications" && <AdminNotifications />}
        {activeTab === "classes" && <AdminClassesManager />}
        {activeTab === "messaging" && <AdminMessaging />}
        {activeTab === "announcements" && <AdminAnnouncements />}
        {activeTab === "monitor" && <AdminMessageMonitor />}
        {activeTab === "teacher" && <AdminTeacherPreview />}
        {activeTab === "accounts" && <AdminTeacherAccounts />}
      </div>

      <DiscussionRoom open={showDiscussion} onOpenChange={setShowDiscussion} />
    </PageShell>
  );
};

export default AdminDashboard;
