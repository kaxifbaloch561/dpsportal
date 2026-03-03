import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import { Bell, LogOut, MessageSquare, Send, CheckCheck, Lightbulb, AlertTriangle, Sparkles, Filter, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TeacherRequest {
  id: string;
  type: string;
  subject: string;
  message: string;
  teacher_email: string;
  admin_reply: string | null;
  is_read: boolean;
  created_at: string;
  replied_at: string | null;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  feature: { icon: Sparkles, label: "Feature Request", color: "hsl(235,78%,62%)" },
  problem: { icon: AlertTriangle, label: "Problem Report", color: "hsl(0,72%,55%)" },
  suggestion: { icon: Lightbulb, label: "Suggestion", color: "hsl(45,90%,50%)" },
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("teacher_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error("Fetch requests error:", error);
      if (data) setRequests(data);
    } catch (err) {
      console.error("Unexpected fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_requests" }, () => {
        fetchRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const { error } = await supabase
        .from("teacher_requests")
        .update({ admin_reply: replyText, is_read: true, replied_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Reply sent!" });
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("Reply error:", err);
      toast({ title: "Failed to send reply", variant: "destructive" });
    }
  };

  const markRead = async (id: string) => {
    try {
      await supabase.from("teacher_requests").update({ is_read: true }).eq("id", id);
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const unreadCount = requests.filter((r) => !r.is_read).length;
  const filtered = filter === "all" ? requests : requests.filter((r) => r.type === filter);

  return (
    <PageShell>
      <DashboardHeader subtitle="Admin Panel" />

      {/* Top bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-primary" />
          <span className="font-bold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/content")} className="rounded-xl gap-2">
            <BookOpen size={16} /> Manage Content
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 flex gap-2 flex-wrap mb-4">
        {[
          { key: "all", label: "All" },
          { key: "feature", label: "Features" },
          { key: "problem", label: "Problems" },
          { key: "suggestion", label: "Suggestions" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div className="flex-1 px-6 pb-8 space-y-3 overflow-auto">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          filtered.map((req) => {
            const config = typeConfig[req.type] || typeConfig.feature;
            const Icon = config.icon;
            return (
              <div
                key={req.id}
                className={`rounded-2xl border p-4 transition-all ${
                  !req.is_read ? "bg-primary/5 border-primary/20 shadow-md" : "bg-card border-border"
                }`}
                onClick={() => !req.is_read && markRead(req.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: config.color + "22", color: config.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: config.color + "22", color: config.color }}>
                        {config.label}
                      </span>
                      {!req.is_read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(req.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground mt-1">{req.subject}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{req.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">From: {req.teacher_email}</p>

                    {req.admin_reply && (
                      <div className="mt-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-xs font-semibold text-primary mb-0.5 flex items-center gap-1"><CheckCheck size={12} /> Your Reply</p>
                        <p className="text-sm text-foreground">{req.admin_reply}</p>
                      </div>
                    )}

                    {replyingTo === req.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="rounded-xl text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleReply(req.id)} className="rounded-full">
                            <Send size={14} /> Send
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }} className="rounded-full">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 rounded-full text-xs"
                        onClick={(e) => { e.stopPropagation(); setReplyingTo(req.id); setReplyText(req.admin_reply || ""); }}
                      >
                        <MessageSquare size={12} /> {req.admin_reply ? "Edit Reply" : "Reply"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
