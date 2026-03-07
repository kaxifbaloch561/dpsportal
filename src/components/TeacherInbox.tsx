import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Check, CheckCheck, Clock, Send, ChevronLeft, ShieldCheck, GraduationCap,
  Search, User, Plus, Sparkles, AlertTriangle, Lightbulb, Mail,
  MessageSquare, Image, Paperclip, Mic, MicOff, X, FileText, Play, Pause
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──
interface DirectMessage {
  id: string;
  sender_type: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_delivered: boolean;
  created_at: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
}

interface TeacherRequest {
  id: string; type: string; subject: string; message: string;
  admin_reply: string | null; is_read: boolean; created_at: string; replied_at: string | null;
}

interface Contact {
  id: string; label: string; email: string;
  type: "admin" | "principal" | "teacher"; subtitle?: string;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  feature: { icon: Sparkles, label: "Feature", color: "hsl(235,78%,62%)" },
  problem: { icon: AlertTriangle, label: "Problem", color: "hsl(0,72%,55%)" },
  suggestion: { icon: Lightbulb, label: "Suggestion", color: "hsl(45,90%,50%)" },
};

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

const TeacherInbox = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [view, setView] = useState<"chats" | "requests" | "conversation" | "new-chat">("chats");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");

  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [filter, setFilter] = useState("all");

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadPerContact, setUnreadPerContact] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, DirectMessage>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Data Fetching ──
  const fetchContacts = async () => {
    const { data: teachers } = await supabase
      .from("teacher_accounts")
      .select("email, first_name, last_name")
      .eq("status", "approved");
    const all: Contact[] = [
      { id: "admin", label: "Admin", email: "admin", type: "admin", subtitle: "School Administrator" },
      { id: "principal", label: "Principal", email: "principal.access@dps.portal", type: "principal", subtitle: "School Principal" },
    ];
    teachers?.forEach((t) => {
      if (t.email !== user?.email) {
        all.push({ id: t.email, label: `${t.first_name} ${t.last_name}`, email: t.email, type: "teacher", subtitle: t.email });
      }
    });
    setContacts(all);
  };

  const fetchUnreadAndLast = async () => {
    if (!user?.email) return;
    const { data: unreadData } = await supabase
      .from("admin_messages").select("sender_email")
      .eq("recipient_email", user.email).eq("is_read", false);
    if (unreadData) {
      const counts: Record<string, number> = {};
      unreadData.forEach((m: any) => { counts[m.sender_email] = (counts[m.sender_email] || 0) + 1; });
      setUnreadPerContact(counts);
    }
    const { data: allMsgs } = await supabase
      .from("admin_messages").select("*")
      .or(`sender_email.eq.${user.email},recipient_email.eq.${user.email}`)
      .order("created_at", { ascending: false });
    if (allMsgs) {
      const lasts: Record<string, DirectMessage> = {};
      allMsgs.forEach((m: any) => {
        const other = m.sender_email === user.email ? m.recipient_email : m.sender_email;
        if (!lasts[other]) lasts[other] = m;
      });
      setLastMessages(lasts);
    }
  };

  const fetchRequests = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("teacher_requests").select("*")
      .eq("teacher_email", user.email).order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoadingReq(false);
  };

  const fetchMessages = async (contact: Contact) => {
    if (!user?.email) return;
    setLoadingChat(true);
    const { data } = await supabase
      .from("admin_messages").select("*")
      .or(`and(sender_email.eq.${user.email},recipient_email.eq.${contact.email}),and(sender_email.eq.${contact.email},recipient_email.eq.${user.email})`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as DirectMessage[]);
    setLoadingChat(false);
    // Mark as delivered + read when viewing conversation
    await supabase
      .from("admin_messages").update({ is_delivered: true, is_read: true } as any)
      .eq("recipient_email", user.email).eq("sender_email", contact.email).eq("is_read", false);
    fetchUnreadAndLast();
  };

  // Mark all incoming messages as delivered when inbox opens (user is online)
  const markAllDelivered = async () => {
    if (!user?.email) return;
    await supabase
      .from("admin_messages").update({ is_delivered: true } as any)
      .eq("recipient_email", user.email).eq("is_delivered", false);
  };

  useEffect(() => {
    if (open) {
      setView("chats"); fetchContacts(); fetchUnreadAndLast(); setLoadingReq(true); fetchRequests();
      markAllDelivered();
      const ch = supabase.channel("teacher-inbox-all")
        .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => {
          fetchUnreadAndLast(); if (selectedContact) fetchMessages(selectedContact);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "teacher_requests" }, () => fetchRequests())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [open, user?.email]);

  useEffect(() => { if (selectedContact && view === "conversation") fetchMessages(selectedContact); }, [selectedContact, view]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Send Message ──
  const handleSend = async (fileData?: { url: string; name: string; type: string }) => {
    if (!user?.email || !selectedContact) return;
    if (!fileData && !newMessage.trim()) return;
    setSending(true);
    const senderType = user.role === "admin" ? "admin" : user.role === "principal" ? "principal" : "teacher";
    const insertData: any = {
      sender_type: senderType, sender_email: user.email,
      recipient_email: selectedContact.email,
      subject: "Direct Message",
      message: fileData ? (fileData.type.startsWith("audio") ? "🎤 Voice message" : `📎 ${fileData.name}`) : newMessage.trim(),
    };
    if (fileData) {
      insertData.file_url = fileData.url;
      insertData.file_name = fileData.name;
      insertData.file_type = fileData.type;
    }
    const { error } = await supabase.from("admin_messages").insert(insertData);
    if (error) toast.error("Failed to send");
    else setNewMessage("");
    setSending(false);
  };

  // ── File Handling ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, acceptType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      handleSend({ url: reader.result as string, name: file.name, type: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Voice Recording ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          handleSend({ url: reader.result as string, name: `voice-${Date.now()}.webm`, type: "audio/webm" });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  };

  // ── Helpers ──
  const openConversation = (c: Contact) => { setSelectedContact(c); setView("conversation"); };
  const activeChats = useMemo(() => {
    const cc = contacts.filter((c) => lastMessages[c.email]);
    cc.sort((a, b) => new Date(lastMessages[b.email]?.created_at || 0).getTime() - new Date(lastMessages[a.email]?.created_at || 0).getTime());
    return cc;
  }, [contacts, lastMessages]);
  const filteredNewContacts = contacts.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  const repliedCount = requests.filter((r) => r.admin_reply).length;
  const totalUnread = Object.values(unreadPerContact).reduce((a, b) => a + b, 0);
  const filtered = filter === "all" ? requests : filter === "replied" ? requests.filter((r) => r.admin_reply) : requests.filter((r) => r.type === filter);

  const getContactIcon = (type: string) => {
    if (type === "admin") return <ShieldCheck size={20} />;
    if (type === "principal") return <GraduationCap size={20} />;
    return <User size={20} />;
  };
  const getAvatarGradient = (type: string) => {
    if (type === "admin") return "linear-gradient(135deg, hsl(235,78%,55%), hsl(260,70%,60%))";
    if (type === "principal") return "linear-gradient(135deg, hsl(270,60%,50%), hsl(290,55%,55%))";
    return "linear-gradient(135deg, hsl(160,55%,38%), hsl(140,60%,45%))";
  };
  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
    if (diff < 172800000) return "Yesterday";
    return date.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  };
  const formatRecTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Render file in message ──
  const renderFileContent = (msg: DirectMessage) => {
    if (!msg.file_url) return null;
    const ft = msg.file_type || "";
    if (ft.startsWith("image/")) {
      return <img src={msg.file_url} alt={msg.file_name || "Image"} className="rounded-xl max-w-full max-h-[200px] object-cover mt-1.5 cursor-pointer" onClick={() => window.open(msg.file_url!, "_blank")} />;
    }
    if (ft.startsWith("audio/")) {
      return (
        <div className="mt-1.5 flex items-center gap-2 bg-black/5 rounded-xl px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Play size={14} className="ml-0.5" />
          </div>
          <audio src={msg.file_url} controls className="h-8 flex-1" style={{ maxWidth: "200px" }} />
        </div>
      );
    }
    return (
      <a href={msg.file_url} download={msg.file_name} className="mt-1.5 flex items-center gap-2 bg-black/5 rounded-xl px-3 py-2 hover:bg-black/10 transition-colors">
        <FileText size={16} className="text-primary shrink-0" />
        <span className="text-xs truncate">{msg.file_name || "Document"}</span>
      </a>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] max-w-[440px] w-[95vw] max-h-[92vh] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden border-0 gap-0" style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.35)" }}>

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" onChange={(e) => handleFileSelect(e, "document")} />
        <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "image")} />

        {/* ════════ CHATS LIST ════════ */}
        {view === "chats" && (
          <>
            <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(260,70%,55%))" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              <div className="relative px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-extrabold text-primary-foreground tracking-tight">Inbox</h2>
                  <button
                    onClick={() => { setSearch(""); setView("new-chat"); }}
                    className="w-10 h-10 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/25 transition-all active:scale-95"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-1">
                  <button
                    onClick={() => setView("chats")}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-primary-foreground text-primary text-center transition-all shadow-sm"
                  >
                    💬 Chats {totalUnread > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full">{totalUnread}</span>}
                  </button>
                  <button
                    onClick={() => setView("requests")}
                    className="flex-1 py-2 text-xs font-bold rounded-xl text-primary-foreground/70 hover:text-primary-foreground text-center transition-all"
                  >
                    📋 Requests {repliedCount > 0 && <span className="ml-1 opacity-60">({repliedCount})</span>}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-background">
              {activeChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-primary/30" />
                  </div>
                  <p className="text-base font-semibold text-foreground/70 mb-1">No conversations yet</p>
                  <p className="text-xs text-muted-foreground text-center">Tap <span className="font-bold text-primary">+</span> to start chatting</p>
                </div>
              ) : (
                activeChats.map((contact) => {
                  const lastMsg = lastMessages[contact.email];
                  const unread = unreadPerContact[contact.email] || 0;
                  const isLastMine = lastMsg?.sender_email === user?.email;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => openConversation(contact)}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-accent/40 transition-all border-b border-border/30 text-left active:bg-accent/60"
                    >
                      <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md" style={{ background: getAvatarGradient(contact.type) }}>
                        {getContactIcon(contact.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[13px] font-bold text-foreground truncate">{contact.label}</p>
                          <span className={`text-[10px] shrink-0 ml-2 ${unread > 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {lastMsg && formatTime(lastMsg.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground truncate pr-3 flex items-center gap-0.5">
                            {isLastMine && (
                              lastMsg?.is_read
                                ? <CheckCheck size={12} className="shrink-0 text-sky-500" />
                                : lastMsg?.is_delivered
                                  ? <CheckCheck size={12} className="shrink-0 text-muted-foreground/50" />
                                  : <Check size={12} className="shrink-0 text-muted-foreground/50" />
                            )}
                            <span className="truncate">{lastMsg?.file_type?.startsWith("image") ? "📷 Photo" : lastMsg?.file_type?.startsWith("audio") ? "🎤 Voice" : lastMsg?.message || ""}</span>
                          </p>
                          {unread > 0 && (
                            <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 shrink-0 shadow-sm">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ════════ NEW CHAT ════════ */}
        {view === "new-chat" && (
          <>
            <div style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(260,70%,55%))" }}>
              <div className="px-4 pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => setView("chats")} className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/25 transition-all active:scale-95">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-base font-bold text-primary-foreground">New Message</h2>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
                  <input
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground placeholder:text-primary-foreground/40 text-sm outline-none border-none"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-background">
              {filteredNewContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => openConversation(contact)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-accent/40 transition-all border-b border-border/30 text-left active:bg-accent/60"
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm" style={{ background: getAvatarGradient(contact.type) }}>
                    {getContactIcon(contact.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{contact.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{contact.subtitle}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground capitalize px-2.5 py-1 rounded-full bg-muted">{contact.type}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ════════ CONVERSATION ════════ */}
        {view === "conversation" && selectedContact && (
          <>
            <div className="flex items-center gap-3 px-3 py-3" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(260,70%,55%))" }}>
              <button onClick={() => { setView("chats"); setSelectedContact(null); }} className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/25 transition-all active:scale-95 shrink-0">
                <ChevronLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm border border-white/20" style={{ background: getAvatarGradient(selectedContact.type) }}>
                {getContactIcon(selectedContact.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary-foreground truncate">{selectedContact.label}</p>
                <p className="text-[10px] text-primary-foreground/60 truncate">{selectedContact.type === "teacher" ? selectedContact.email : selectedContact.subtitle}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto px-3 py-2 space-y-1 min-h-[200px] bg-[hsl(var(--muted)/0.3)]">
              {loadingChat ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-9 h-9 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-card rounded-2xl px-5 py-3 shadow-sm border border-border/50">
                    <p className="text-xs text-muted-foreground text-center">Say hello to <span className="font-bold text-foreground">{selectedContact.label}</span> 👋</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_email === user?.email;
                  const prevMsg = messages[i - 1];
                  const showTime = !prevMsg || (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) > 600000;
                  const sameSender = prevMsg && prevMsg.sender_email === msg.sender_email && !showTime;
                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <div className="flex justify-center my-3">
                          <span className="text-[10px] bg-card text-muted-foreground px-3 py-1 rounded-full shadow-sm border border-border/50 font-medium">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-2"}`}>
                        <div
                          className={`relative max-w-[80%] px-3.5 py-2 ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-lg"
                              : "bg-card text-foreground rounded-2xl rounded-bl-lg border border-border/40"
                          }`}
                          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                        >
                          {!msg.file_url && <p className="text-[13px] leading-[1.45] whitespace-pre-wrap break-words">{msg.message}</p>}
                          {renderFileContent(msg)}
                          <div className="flex items-center gap-1 justify-end mt-1 -mb-0.5">
                            <span className={`text-[9px] ${isMe ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                              {new Date(msg.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isMe && (
                              msg.is_read
                                ? <CheckCheck size={13} className="text-sky-300" />
                                : msg.is_delivered
                                  ? <CheckCheck size={13} className="text-primary-foreground/40" />
                                  : <Check size={13} className="text-primary-foreground/40" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-card border-t border-border/50 px-2 py-2">
              {isRecording ? (
                <div className="flex items-center gap-3 px-3 py-2 bg-destructive/5 rounded-2xl border border-destructive/20">
                  <button onClick={cancelRecording} className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors shrink-0">
                    <X size={16} />
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm font-mono font-bold text-destructive">{formatRecTime(recordingTime)}</span>
                    <span className="text-xs text-muted-foreground">Recording...</span>
                  </div>
                  <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity shrink-0 active:scale-95">
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-1.5">
                  {/* Attachment buttons */}
                  <div className="flex gap-0.5 pb-1">
                    <button onClick={() => imageInputRef.current?.click()} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95" title="Send photo">
                      <Image size={18} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95" title="Send document">
                      <Paperclip size={18} />
                    </button>
                  </div>
                  {/* Text input */}
                  <div className="flex-1 bg-muted rounded-2xl px-4 py-1 min-h-[42px] flex items-center">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none border-none resize-none max-h-[100px] py-2.5 leading-5"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 100) + "px"; }}
                    />
                  </div>
                  {/* Send or Mic */}
                  {newMessage.trim() ? (
                    <button
                      onClick={() => handleSend()}
                      disabled={sending}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 mb-0.5"
                    >
                      <Send size={17} className="ml-0.5" />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 hover:opacity-90 transition-all active:scale-95 mb-0.5"
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════ REQUESTS ════════ */}
        {view === "requests" && (
          <>
            <div style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(260,70%,55%))" }}>
              <div className="px-4 pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => setView("chats")} className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/25 transition-all active:scale-95">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-base font-bold text-primary-foreground">My Requests</h2>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {[{ key: "all", label: "All" }, { key: "replied", label: "Replied" }, { key: "feature", label: "Features" }, { key: "problem", label: "Problems" }].map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${filter === f.key ? "bg-primary-foreground text-primary shadow-sm" : "bg-primary-foreground/15 text-primary-foreground/70 hover:bg-primary-foreground/25"}`}
                    >{f.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto space-y-2 p-3 bg-background">
              {loadingReq ? (
                <div className="flex items-center justify-center py-20"><div className="w-9 h-9 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Mail size={36} className="text-muted-foreground/25 mb-2" />
                  <p className="text-sm text-muted-foreground">No requests found</p>
                </div>
              ) : filtered.map((req) => {
                const config = typeConfig[req.type] || typeConfig.feature;
                const Icon = config.icon;
                return (
                  <div key={req.id} className="rounded-2xl border border-border/60 bg-card p-3 hover:shadow-md transition-all">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: config.color + "15", color: config.color }}><Icon size={15} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: config.color + "15", color: config.color }}>{config.label}</span>
                          {req.admin_reply ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 flex items-center gap-0.5"><CheckCheck size={8} /> Replied</span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5"><Clock size={8} /> Pending</span>
                          )}
                          <span className="text-[9px] text-muted-foreground ml-auto">{formatTime(req.created_at)}</span>
                        </div>
                        <p className="font-semibold text-xs text-foreground">{req.subject}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{req.message}</p>
                        {req.admin_reply && (
                          <div className="mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-[9px] font-bold text-primary mb-0.5"><CheckCheck size={8} className="inline mr-1" />Admin Reply</p>
                            <p className="text-xs text-foreground">{req.admin_reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default TeacherInbox;
