import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, User, Search, Trash2, X, Check, CheckCheck } from "lucide-react";
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

const PRINCIPAL_EMAIL = "principal.access@dps.portal";

interface Message {
  id: string;
  sender_type: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_delivered: boolean | null;
  parent_id: string | null;
  created_at: string;
}

interface Teacher {
  email: string;
  first_name: string;
  last_name: string;
}

const PrincipalMessaging = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: "message" | "chat"; id?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTeachers = async () => {
    const { data } = await supabase.from("teacher_accounts").select("email, first_name, last_name").eq("status", "approved");
    if (data) setTeachers(data);
  };

  const fetchUnreadCounts = async () => {
    const { data } = await supabase.from("admin_messages").select("sender_email").eq("recipient_email", PRINCIPAL_EMAIL).eq("is_read", false);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((m: any) => { counts[m.sender_email] = (counts[m.sender_email] || 0) + 1; });
      setUnreadCounts(counts);
    }
  };

  const fetchLastMessages = async () => {
    const { data } = await supabase.from("admin_messages").select("*")
      .or(`sender_email.eq.${PRINCIPAL_EMAIL},recipient_email.eq.${PRINCIPAL_EMAIL}`)
      .order("created_at", { ascending: false });
    if (data) {
      const lasts: Record<string, Message> = {};
      (data as Message[]).forEach((m) => {
        const other = m.sender_email === PRINCIPAL_EMAIL ? m.recipient_email : m.sender_email;
        if (other !== "admin" && !lasts[other]) lasts[other] = m;
      });
      setLastMessages(lasts);
    }
  };

  const fetchMessages = async (teacherEmail: string) => {
    const { data } = await supabase.from("admin_messages").select("*")
      .or(`and(sender_email.eq.${PRINCIPAL_EMAIL},recipient_email.eq.${teacherEmail}),and(sender_email.eq.${teacherEmail},recipient_email.eq.${PRINCIPAL_EMAIL})`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    await supabase.from("admin_messages").update({ is_read: true })
      .eq("sender_email", teacherEmail).eq("recipient_email", PRINCIPAL_EMAIL).eq("is_read", false);
    fetchUnreadCounts();
  };

  useEffect(() => {
    fetchTeachers(); fetchUnreadCounts(); fetchLastMessages();
    const ch = supabase.channel("principal-messaging")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => {
        fetchUnreadCounts(); fetchLastMessages();
        if (selectedTeacher) fetchMessages(selectedTeacher);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedTeacher]);

  useEffect(() => { if (selectedTeacher) fetchMessages(selectedTeacher); }, [selectedTeacher]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!selectedTeacher || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from("admin_messages").insert({
      sender_type: "principal", sender_email: PRINCIPAL_EMAIL, recipient_email: selectedTeacher,
      subject: "Message from Principal", message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    else { setNewMessage(""); toast.success("Message sent!"); }
    setSending(false);
  };

  const handleDeleteMessage = async (msgId: string) => {
    const { error } = await supabase.from("admin_messages").delete().eq("id", msgId);
    if (error) toast.error("Failed to delete message");
    else { toast.success("Message deleted"); if (selectedTeacher) fetchMessages(selectedTeacher); }
    setDeleteTarget(null);
  };

  const handleDeleteChat = async () => {
    if (!selectedTeacher) return;
    const { error } = await supabase.from("admin_messages").delete()
      .or(`and(sender_email.eq.${PRINCIPAL_EMAIL},recipient_email.eq.${selectedTeacher}),and(sender_email.eq.${selectedTeacher},recipient_email.eq.${PRINCIPAL_EMAIL})`);
    if (error) toast.error("Failed to delete chat");
    else { toast.success("Chat deleted"); setMessages([]); }
    setDeleteTarget(null);
  };

  const filtered = teachers.filter((t) =>
    `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const getTeacherName = (email: string) => {
    const t = teachers.find((t) => t.email === email);
    return t ? `${t.first_name} ${t.last_name}` : email;
  };

  const getInitials = (email: string) => {
    const t = teachers.find((t) => t.email === email);
    if (t) return `${t.first_name[0]}${t.last_name[0]}`.toUpperCase();
    return email.slice(0, 2).toUpperCase();
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
    if (diff < 172800000) return "Yesterday";
    return date.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  };

  const sortedTeachers = [...filtered].sort((a, b) => {
    const la = lastMessages[a.email];
    const lb = lastMessages[b.email];
    if (la && lb) return new Date(lb.created_at).getTime() - new Date(la.created_at).getTime();
    if (la) return -1;
    if (lb) return 1;
    return 0;
  });

  /* ════════ CHAT LIST ════════ */
  if (!selectedTeacher) {
    return (
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-[14px] bg-foreground flex items-center justify-center text-background">
            <Send size={18} className="rotate-[-30deg]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">Messages</h3>
            <p className="text-[11px] text-muted-foreground">Chat with teachers</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-[14px] border-border bg-background h-11 text-sm"
          />
        </div>

        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Recent chats</p>

        <div className="space-y-1">
          {sortedTeachers.map((t) => {
            const lastMsg = lastMessages[t.email];
            const unread = unreadCounts[t.email] || 0;
            const isLastMine = lastMsg?.sender_email === PRINCIPAL_EMAIL;
            return (
              <button
                key={t.email}
                onClick={() => setSelectedTeacher(t.email)}
                className="w-full flex items-center gap-3 p-3 rounded-[14px] border border-transparent hover:bg-muted/50 hover:border-border transition-all duration-200 text-left"
              >
                <div className="w-[42px] h-[42px] rounded-[12px] bg-foreground text-background flex items-center justify-center font-semibold text-[13px] shrink-0">
                  {getInitials(t.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[13px] font-semibold text-foreground truncate">{t.first_name} {t.last_name}</p>
                    {lastMsg && (
                      <span className={`text-[11px] shrink-0 ml-2 ${unread > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                        {formatTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-muted-foreground truncate pr-3 flex items-center gap-1">
                      {isLastMine && lastMsg && (
                        lastMsg.is_read ? <CheckCheck size={13} className="shrink-0 text-muted-foreground" />
                          : <Check size={13} className="shrink-0 text-muted-foreground/50" />
                      )}
                      <span className="truncate">{lastMsg?.message || t.email}</span>
                    </p>
                    {unread > 0 && (
                      <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-foreground text-background text-[10px] font-bold rounded-full px-1.5 shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {sortedTeachers.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No teachers found</p>
          )}
        </div>
      </div>
    );
  }

  /* ════════ CONVERSATION ════════ */
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedTeacher(null)} className="w-10 h-10 rounded-[10px] border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="w-[42px] h-[42px] rounded-[12px] bg-foreground text-background flex items-center justify-center font-semibold text-[13px]">
            {getInitials(selectedTeacher)}
          </div>
          <div>
            <p className="text-[14px] font-bold text-foreground">{getTeacherName(selectedTeacher)}</p>
            <p className="text-[11px] text-muted-foreground">Teacher</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6 space-y-4 bg-background">
        {messages.length === 0 && (
          <div className="flex justify-center my-8">
            <span className="text-[12px] bg-muted/50 text-muted-foreground px-4 py-1.5 rounded-full border border-border font-medium">
              No messages yet — start a conversation
            </span>
          </div>
        )}
        {messages.map((msg, i) => {
          const isPrincipal = msg.sender_email === PRINCIPAL_EMAIL;
          const prevMsg = messages[i - 1];
          const showTime = !prevMsg || (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) > 600000;
          return (
            <div key={msg.id}>
              {showTime && (
                <div className="flex justify-center my-4">
                  <span className="text-[11px] bg-muted/50 text-muted-foreground px-3.5 py-1 rounded-full border border-border">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex ${isPrincipal ? "justify-end" : "justify-start"} group`}>
                <div className="max-w-[70%] flex flex-col gap-1">
                  <div
                    className={`relative px-3.5 py-2.5 rounded-2xl border text-[14px] leading-relaxed ${
                      isPrincipal
                        ? "bg-muted/60 border-border rounded-br-md"
                        : "bg-background border-border rounded-bl-md"
                    }`}
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
                  >
                    <button
                      onClick={() => setDeleteTarget({ type: "message", id: msg.id })}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={10} />
                    </button>
                    <p className="text-foreground">{msg.message}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-1 ${isPrincipal ? "justify-end" : "justify-start"}`}>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isPrincipal && (
                      msg.is_read
                        ? <CheckCheck size={13} className="text-muted-foreground" />
                        : <Check size={13} className="text-muted-foreground/50" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="px-4 sm:px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2.5 border border-border rounded-[18px] px-3 py-2 bg-background" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none border-none"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="w-11 h-11 rounded-[12px] bg-foreground text-background flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget?.type === "chat" ? "Delete Entire Chat?" : "Delete Message?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "chat"
                ? `All messages with ${getTeacherName(selectedTeacher)} will be permanently deleted.`
                : "This message will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget?.type === "chat" ? handleDeleteChat() : deleteTarget?.id && handleDeleteMessage(deleteTarget.id)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrincipalMessaging;
