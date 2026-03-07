import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Trash2, ArrowDownLeft, ArrowUpRight, X, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  sender_type: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Teacher {
  email: string;
  first_name: string;
  last_name: string;
}

const AdminMessageMonitor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [msgRes, teacherRes] = await Promise.all([
      supabase.from("admin_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("teacher_accounts").select("email, first_name, last_name"),
    ]);
    if (msgRes.data) setMessages(msgRes.data as Message[]);
    if (teacherRes.data) setTeachers(teacherRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel("admin-msg-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const getPersonName = (email: string) => {
    if (email === "admin") return "Admin";
    const t = teachers.find((t) => t.email === email);
    return t ? `${t.first_name} ${t.last_name}` : email;
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("admin_messages").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Message deleted"); fetchAll(); }
    setDeleteTarget(null);
  };

  const filtered = messages.filter((msg) => {
    if (filter === "incoming" && msg.sender_type !== "teacher") return false;
    if (filter === "outgoing" && msg.sender_type !== "admin") return false;
    if (search) {
      const q = search.toLowerCase();
      const senderName = getPersonName(msg.sender_email).toLowerCase();
      const recipientName = getPersonName(msg.recipient_email).toLowerCase();
      return (
        senderName.includes(q) ||
        recipientName.includes(q) ||
        msg.subject.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const incomingCount = messages.filter((m) => m.sender_type === "teacher").length;
  const outgoingCount = messages.filter((m) => m.sender_type === "admin").length;

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Eye size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Message Monitor</h3>
          <p className="text-xs text-muted-foreground">
            View & manage all teacher messages ({messages.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          { key: "all" as const, label: "All", count: messages.length },
          { key: "incoming" as const, label: "Incoming", count: incomingCount, icon: ArrowDownLeft },
          { key: "outgoing" as const, label: "Outgoing", count: outgoingCount, icon: ArrowUpRight },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.icon && <f.icon size={12} />}
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              filter === f.key ? "bg-primary-foreground/20" : "bg-background"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, subject, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No messages found</p>
          </div>
        ) : (
          filtered.map((msg) => {
            const isIncoming = msg.sender_type === "teacher";
            return (
              <div
                key={msg.id}
                className="group rounded-2xl border border-border bg-card p-3.5 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {/* Direction icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isIncoming
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* From -> To */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isIncoming
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {isIncoming ? "INCOMING" : "OUTGOING"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <User size={10} />
                      <span className="font-semibold text-foreground">{getPersonName(msg.sender_email)}</span>
                      <span>→</span>
                      <span className="font-semibold text-foreground">{getPersonName(msg.recipient_email)}</span>
                    </div>

                    <p className="font-semibold text-sm text-foreground">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{msg.message}</p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => setDeleteTarget(msg.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMessageMonitor;
