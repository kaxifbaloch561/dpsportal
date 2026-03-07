import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import { Bell, BookOpen, Users, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminTeacherPreview from "@/components/admin/AdminTeacherPreview";
import AdminTeacherAccounts from "@/components/admin/AdminTeacherAccounts";

const tabs = [
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "content", label: "Manage Content", icon: BookOpen },
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

  const fetchCounts = async () => {
    const [notifRes, accountRes] = await Promise.all([
      supabase.from("teacher_requests").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("teacher_accounts").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setUnreadNotifs(notifRes.count ?? 0);
    setPendingAccounts(accountRes.count ?? 0);
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
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []);

  // When switching to a tab, refresh counts (seen items get marked read inside components)
  useEffect(() => {
    // Small delay to let the component mark things as read
    const timer = setTimeout(fetchCounts, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate("/"); };

  const getBadge = (key: string) => {
    if (key === "notifications" && unreadNotifs > 0) return unreadNotifs;
    if (key === "accounts" && pendingAccounts > 0) return pendingAccounts;
    return 0;
  };

  return (
    <PageShell>
      <DashboardHeader subtitle="Admin Panel" />

      {/* Top bar */}
      <div className="px-6 py-3 flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut size={16} /> Logout
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-4 gap-3">
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
                  } else {
                    setActiveTab(tab.key);
                  }
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 active:scale-[0.96] ${
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
                <Icon size={24} />
                <span className="text-[11px] font-semibold text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "notifications" && <AdminNotifications />}
        {activeTab === "teacher" && <AdminTeacherPreview />}
        {activeTab === "accounts" && <AdminTeacherAccounts />}
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
