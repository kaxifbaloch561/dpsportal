import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import { Bell, BookOpen, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminTeacherPreview from "@/components/admin/AdminTeacherPreview";

const tabs = [
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "content", label: "Manage Content", icon: BookOpen },
  { key: "teacher", label: "Teacher Panel", icon: Users },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("notifications");

  const handleLogout = () => { logout(); navigate("/"); };

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
        <div className="grid grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
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
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                    : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                <Icon size={24} />
                <span className="text-sm font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "notifications" && <AdminNotifications />}
        {activeTab === "teacher" && <AdminTeacherPreview />}
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
