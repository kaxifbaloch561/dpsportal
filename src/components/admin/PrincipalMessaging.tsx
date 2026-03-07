import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, ChevronLeft, User, Clock, CheckCheck, Search, Trash2, X } from "lucide-react";
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
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: "message" | "chat"; id?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get teachers who have messaged the principal
  const fetchTeachersWithConversations = async () => {
    // Get all approved teachers
    const { data: allTeachers } = await supabase
      .from("teacher_accounts")
      .select("email, first_name, last_name")
      .eq("status", "approved");
    
    // Get teachers who have conversations with principal
    const { data: msgData } = await supabase
      .from("admin_messages")
      .select("sender_email, recipient_email")
      .or(`sender_email.eq.${PRINCIPAL_EMAIL},recipient_email.eq.${PRINCIPAL_EMAIL}`);

    const teacherEmails = new Set<string>();
    msgData?.forEach((m: any) => {
      if (m.sender_email !== PRINCIPAL_EMAIL && m.sender_email !== "admin") teacherEmails.add(m.sender_email);
      if (m.recipient_email !== PRINCIPAL_EMAIL && m.recipient_email !== "admin") teacherEmails.add(m.recipient_email);
    });

    // Show teachers who have conversations, plus all approved ones
    if (allTeachers) setTeachers(allTeachers);
  };

  const fetchUnreadCounts = async () => {
    const { data } = await supabase
      .from("admin_messages")
      .select("sender_email")
      .eq("recipient_email", PRINCIPAL_EMAIL)
      .eq("is_read", false);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((m: any) => { counts[m.sender_email] = (counts[m.sender_email] || 0) + 1; });
      setUnreadCounts(counts);
    }
  };

  const fetchMessages = async (teacherEmail: string) => {
    const { data } = await supabase
      .from("admin_messages")
      .select("*")
      .or(`and(sender_email.eq.${PRINCIPAL_EMAIL},recipient_email.eq.${teacherEmail}),and(sender_email.eq.${teacherEmail},recipient_email.eq.${PRINCIPAL_EMAIL})`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);

    await supabase
      .from("admin_messages")
      .update({ is_read: true })
      .eq("sender_email", teacherEmail)
      .eq("recipient_email", PRINCIPAL_EMAIL)
      .eq("is_read", false);
    fetchUnreadCounts();
  };

  useEffect(() => {
    fetchTeachersWithConversations();
    fetchUnreadCounts();
    const ch = supabase
      .channel("principal-messaging")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => {
        fetchUnreadCounts();
        if (selectedTeacher) fetchMessages(selectedTeacher);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedTeacher]);

  useEffect(() => {
    if (selectedTeacher) fetchMessages(selectedTeacher);
  }, [selectedTeacher]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedTeacher || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from("admin_messages").insert({
      sender_type: "principal",
      sender_email: PRINCIPAL_EMAIL,
      recipient_email: selectedTeacher,
      subject: newSubject.trim() || "Message from Principal",
      message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    else { setNewMessage(""); setNewSubject(""); toast.success("Message sent!"); }
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
    const { error } = await supabase
      .from("admin_messages")
      .delete()
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

  if (!selectedTeacher) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Messages</h3>
            <p className="text-xs text-muted-foreground">Chat with teachers</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((t) => (
            <button
              key={t.email}
              onClick={() => setSelectedTeacher(t.email)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:bg-accent hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">{t.first_name} {t.last_name}</p>
                <p className="text-[11px] text-muted-foreground">{t.email}</p>
              </div>
              {(unreadCounts[t.email] || 0) > 0 && (
                <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-destructive text-destructive-foreground text-[11px] font-bold rounded-full px-1.5 animate-pulse">
                  {unreadCounts[t.email]}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No teachers found</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={() => setSelectedTeacher(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User size={16} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{getTeacherName(selectedTeacher)}</p>
          <p className="text-[10px] text-muted-foreground">{selectedTeacher}</p>
        </div>
        <button
          onClick={() => setDeleteTarget({ type: "chat" })}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          title="Delete entire chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No messages yet. Start a conversation!</p>
        )}
        {messages.map((msg) => {
          const isPrincipal = msg.sender_email === PRINCIPAL_EMAIL;
          return (
            <div key={msg.id} className={`flex ${isPrincipal ? "justify-end" : "justify-start"} group`}>
              <div className={`relative max-w-[80%] rounded-2xl p-3 ${
                isPrincipal
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                <button
                  onClick={() => setDeleteTarget({ type: "message", id: msg.id })}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Delete message"
                >
                  <X size={10} />
                </button>
                <p className="text-[10px] font-bold mb-1 opacity-75">{msg.subject}</p>
                <p className="text-sm">{msg.message}</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <Clock size={10} className="opacity-50" />
                  <span className="text-[9px] opacity-50">
                    {new Date(msg.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isPrincipal && <CheckCheck size={10} className={msg.is_read ? "text-green-300" : "opacity-50"} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border space-y-2">
        <Input
          placeholder="Subject (optional)"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="rounded-xl text-sm h-9"
        />
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="rounded-xl text-sm min-h-[60px] resize-none"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button size="icon" onClick={handleSend} disabled={sending || !newMessage.trim()} className="rounded-xl h-auto self-end">
            <Send size={16} />
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "chat" ? "Delete Entire Chat?" : "Delete Message?"}
            </AlertDialogTitle>
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrincipalMessaging;
