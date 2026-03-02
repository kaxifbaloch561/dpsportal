import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Inbox, Sparkles, AlertTriangle, Lightbulb, CheckCheck, Clock, MessageSquare } from "lucide-react";

interface TeacherRequest {
  id: string;
  type: string;
  subject: string;
  message: string;
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeacherInbox = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchRequests = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("teacher_requests")
      .select("*")
      .eq("teacher_email", user.email)
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchRequests();

      const channel = supabase
        .channel("teacher-inbox")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "teacher_requests" }, () => {
          fetchRequests();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [open, user?.email]);

  const repliedCount = requests.filter((r) => r.admin_reply).length;
  const filtered = filter === "all" ? requests : filter === "replied" ? requests.filter((r) => r.admin_reply) : requests.filter((r) => r.type === filter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <Inbox size={18} />
            </div>
            My Inbox
            {repliedCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {repliedCount} replied
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "replied", label: "Replied" },
            { key: "feature", label: "Features" },
            { key: "problem", label: "Problems" },
            { key: "suggestion", label: "Suggestions" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto space-y-3 mt-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            filtered.map((req) => {
              const config = typeConfig[req.type] || typeConfig.feature;
              const Icon = config.icon;
              return (
                <div key={req.id} className="rounded-2xl border border-border bg-card p-3.5 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: config.color + "22", color: config.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: config.color + "22", color: config.color }}>
                          {config.label}
                        </span>
                        {req.admin_reply ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 flex items-center gap-1">
                            <CheckCheck size={10} /> Replied
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {new Date(req.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-foreground mt-1">{req.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{req.message}</p>

                      {req.admin_reply && (
                        <div className="mt-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                          <p className="text-[10px] font-bold text-primary mb-0.5 flex items-center gap-1">
                            <CheckCheck size={10} /> Admin Reply
                            {req.replied_at && (
                              <span className="font-normal text-muted-foreground ml-1">
                                • {new Date(req.replied_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-foreground">{req.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherInbox;
