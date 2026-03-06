import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MessageSquare, Send, CheckCheck, Lightbulb, AlertTriangle, Sparkles, ChevronLeft, User, Mail } from "lucide-react";
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

const AdminNotifications = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("teacher_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setRequests(data);
    } catch (err) {
      console.error("Fetch requests error:", err);
      toast({ title: "Failed to load notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_requests" }, () => fetchRequests())
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

  // Group requests by teacher email
  const teacherGroups = requests.reduce<Record<string, TeacherRequest[]>>((acc, req) => {
    if (!acc[req.teacher_email]) acc[req.teacher_email] = [];
    acc[req.teacher_email].push(req);
    return acc;
  }, {});

  const totalUnread = requests.filter((r) => !r.is_read).length;

  // If a teacher is selected, show their messages
  if (selectedTeacher) {
    const teacherRequests = teacherGroups[selectedTeacher] || [];
    const filtered = filter === "all" ? teacherRequests : teacherRequests.filter((r) => r.type === filter);

    return (
      <div className="px-6 pb-8">
        {/* Back + Header */}
        <button
          onClick={() => { setSelectedTeacher(null); setFilter("all"); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={16} /> Back to teachers
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <User size={20} />
          </div>
          <div>
            <p className="font-bold text-foreground">{selectedTeacher}</p>
            <p className="text-xs text-muted-foreground">{teacherRequests.length} message{teacherRequests.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
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

        {/* Messages */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No messages in this category</p>
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

                      {req.admin_reply && (
                        <div className="mt-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                          <p className="text-xs font-semibold text-primary mb-0.5 flex items-center gap-1"><CheckCheck size={12} /> Your Reply</p>
                          <p className="text-sm text-foreground">{req.admin_reply}</p>
                        </div>
                      )}

                      {replyingTo === req.id ? (
                        <div className="mt-2 space-y-2">
                          <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="rounded-xl text-sm" />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReply(req.id)} className="rounded-full"><Send size={14} /> Send</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }} className="rounded-full">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm" variant="outline" className="mt-2 rounded-full text-xs"
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
      </div>
    );
  }

  // Teacher list view
  return (
    <div className="px-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={20} className="text-primary" />
        <span className="font-bold text-foreground">Notifications</span>
        {totalUnread > 0 && (
          <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            {totalUnread} new
          </span>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : Object.keys(teacherGroups).length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          Object.entries(teacherGroups).map(([email, reqs]) => {
            const unread = reqs.filter((r) => !r.is_read).length;
            const latest = reqs[0];
            const typeCounts = reqs.reduce<Record<string, number>>((acc, r) => {
              acc[r.type] = (acc[r.type] || 0) + 1;
              return acc;
            }, {});

            return (
              <button
                key={email}
                onClick={() => setSelectedTeacher(email)}
                className={`w-full text-left rounded-2xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  unread > 0 ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground truncate">{email}</p>
                      {unread > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Latest: {latest.subject}
                    </p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {Object.entries(typeCounts).map(([type, count]) => {
                        const cfg = typeConfig[type] || typeConfig.feature;
                        return (
                          <span
                            key={type}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: cfg.color + "22", color: cfg.color }}
                          >
                            {count} {cfg.label}
                          </span>
                        );
                      })}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {reqs.length} total
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
