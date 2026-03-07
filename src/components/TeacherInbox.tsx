import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, Sparkles, AlertTriangle, Lightbulb, CheckCheck, Clock,
  MessageSquare, Send, ChevronLeft, ShieldCheck, GraduationCap,
  Search, User, Plus, ArrowLeft, Users
} from "lucide-react";
import { toast } from "sonner";

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

interface DirectMessage {
  id: string;
  sender_type: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Contact {
  id: string;
  label: string;
  email: string;
  type: "admin" | "principal" | "teacher";
  subtitle?: string;
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
  const [view, setView] = useState<"chats" | "requests" | "conversation" | "new-chat">("chats");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");

  // Requests
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Chat
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadPerContact, setUnreadPerContact] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, DirectMessage>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all contacts (admin, principal, teachers)
  const fetchContacts = async () => {
    const { data: teachers } = await supabase
      .from("teacher_accounts")
      .select("email, first_name, last_name")
      .eq("status", "approved");

    const allContacts: Contact[] = [
      { id: "admin", label: "Admin", email: "admin", type: "admin", subtitle: "School Administrator" },
      { id: "principal", label: "Principal", email: "principal.access@dps.portal", type: "principal", subtitle: "School Principal" },
    ];

    teachers?.forEach((t) => {
      if (t.email !== user?.email) {
        allContacts.push({
          id: t.email,
          label: `${t.first_name} ${t.last_name}`,
          email: t.email,
          type: "teacher",
          subtitle: t.email,
        });
      }
    });

    setContacts(allContacts);
  };

  // Fetch unread counts and last messages
  const fetchUnreadAndLast = async () => {
    if (!user?.email) return;

    const { data: unreadData } = await supabase
      .from("admin_messages")
      .select("sender_email")
      .eq("recipient_email", user.email)
      .eq("is_read", false);

    if (unreadData) {
      const counts: Record<string, number> = {};
      unreadData.forEach((m: any) => {
        counts[m.sender_email] = (counts[m.sender_email] || 0) + 1;
      });
      setUnreadPerContact(counts);
    }

    // Fetch all messages involving this user to get last message per conversation
    const { data: allMsgs } = await supabase
      .from("admin_messages")
      .select("*")
      .or(`sender_email.eq.${user.email},recipient_email.eq.${user.email}`)
      .order("created_at", { ascending: false });

    if (allMsgs) {
      const lasts: Record<string, DirectMessage> = {};
      allMsgs.forEach((m: any) => {
        const otherEmail = m.sender_email === user.email ? m.recipient_email : m.sender_email;
        if (!lasts[otherEmail]) lasts[otherEmail] = m;
      });
      setLastMessages(lasts);
    }
  };

  const fetchRequests = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("teacher_requests")
      .select("*")
      .eq("teacher_email", user.email)
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoadingReq(false);
  };

  const fetchMessages = async (contact: Contact) => {
    if (!user?.email) return;
    setLoadingChat(true);
    const { data } = await supabase
      .from("admin_messages")
      .select("*")
      .or(
        `and(sender_email.eq.${user.email},recipient_email.eq.${contact.email}),and(sender_email.eq.${contact.email},recipient_email.eq.${user.email})`
      )
      .order("created_at", { ascending: true });
    if (data) setMessages(data as DirectMessage[]);
    setLoadingChat(false);

    // Mark as read
    await supabase
      .from("admin_messages")
      .update({ is_read: true })
      .eq("recipient_email", user.email)
      .eq("sender_email", contact.email)
      .eq("is_read", false);
    fetchUnreadAndLast();
  };

  useEffect(() => {
    if (open) {
      setView("chats");
      fetchContacts();
      fetchUnreadAndLast();
      setLoadingReq(true);
      fetchRequests();

      const ch = supabase
        .channel("teacher-inbox-all")
        .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => {
          fetchUnreadAndLast();
          if (selectedContact) fetchMessages(selectedContact);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "teacher_requests" }, () => fetchRequests())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [open, user?.email]);

  useEffect(() => {
    if (selectedContact && view === "conversation") fetchMessages(selectedContact);
  }, [selectedContact, view]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user?.email || !selectedContact || !newMessage.trim()) return;
    setSending(true);
    const senderType = user.role === "admin" ? "admin" : user.role === "principal" ? "principal" : "teacher";
    const { error } = await supabase.from("admin_messages").insert({
      sender_type: senderType,
      sender_email: user.email,
      recipient_email: selectedContact.email,
      subject: "Direct Message",
      message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    else { setNewMessage(""); }
    setSending(false);
  };

  const openConversation = (contact: Contact) => {
    setSelectedContact(contact);
    setView("conversation");
  };

  // Contacts with conversations (sorted by last message time)
  const activeChats = useMemo(() => {
    const chatContacts = contacts.filter((c) => lastMessages[c.email]);
    chatContacts.sort((a, b) => {
      const aTime = new Date(lastMessages[a.email]?.created_at || 0).getTime();
      const bTime = new Date(lastMessages[b.email]?.created_at || 0).getTime();
      return bTime - aTime;
    });
    return chatContacts;
  }, [contacts, lastMessages]);

  const filteredNewContacts = contacts.filter(
    (c) => c.label.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const repliedCount = requests.filter((r) => r.admin_reply).length;
  const totalUnread = Object.values(unreadPerContact).reduce((a, b) => a + b, 0);
  const filtered = filter === "all" ? requests : filter === "replied" ? requests.filter((r) => r.admin_reply) : requests.filter((r) => r.type === filter);

  const getContactIcon = (type: string) => {
    if (type === "admin") return <ShieldCheck size={18} />;
    if (type === "principal") return <GraduationCap size={18} />;
    return <User size={18} />;
  };

  const getContactColor = (type: string) => {
    if (type === "admin") return "hsl(235,78%,62%)";
    if (type === "principal") return "hsl(270,60%,55%)";
    return "hsl(160,60%,40%)";
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl">

        {/* ===== CHATS LIST VIEW ===== */}
        {view === "chats" && (
          <>
            {/* WhatsApp-like header */}
            <div className="bg-primary text-primary-foreground px-4 pt-5 pb-3 rounded-t-3xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold tracking-wide">Inbox</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setView("new-chat")}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              {/* Tab bar */}
              <div className="flex gap-1">
                <button
                  onClick={() => setView("chats")}
                  className="flex-1 py-1.5 text-xs font-bold rounded-full bg-primary-foreground/20 text-primary-foreground text-center"
                >
                  Chats {totalUnread > 0 && `(${totalUnread})`}
                </button>
                <button
                  onClick={() => setView("requests")}
                  className="flex-1 py-1.5 text-xs font-bold rounded-full hover:bg-primary-foreground/10 text-primary-foreground/70 text-center transition-colors"
                >
                  Requests {repliedCount > 0 && `(${repliedCount})`}
                </button>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-auto bg-background">
              {activeChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MessageSquare size={28} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 text-center">Tap the + button to start a new chat</p>
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
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/50 text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ background: getContactColor(contact.type) }}
                      >
                        {getContactIcon(contact.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground truncate">{contact.label}</p>
                          <span className={`text-[10px] shrink-0 ml-2 ${unread > 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {lastMsg && formatTime(lastMsg.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate pr-2">
                            {isLastMine && <span className="text-primary mr-1">You:</span>}
                            {lastMsg?.message || "No messages"}
                          </p>
                          {unread > 0 && (
                            <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 shrink-0">
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

        {/* ===== NEW CHAT VIEW ===== */}
        {view === "new-chat" && (
          <>
            <div className="bg-primary text-primary-foreground px-4 pt-5 pb-4 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setView("chats")} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-base font-bold">New Chat</h2>
              </div>
              <div className="mt-3 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/40 text-sm outline-none border-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-background">
              {filteredNewContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => openConversation(contact)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/50 text-left"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ background: getContactColor(contact.type) }}
                  >
                    {getContactIcon(contact.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{contact.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {contact.type === "admin" ? "Administrator" : contact.type === "principal" ? "Principal" : contact.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-muted">
                    {contact.type}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ===== CONVERSATION VIEW ===== */}
        {view === "conversation" && selectedContact && (
          <>
            {/* Chat header */}
            <div className="bg-primary text-primary-foreground px-3 py-3 rounded-t-3xl flex items-center gap-3">
              <button
                onClick={() => { setView("chats"); setSelectedContact(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-foreground/10 transition-colors shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white border-2 border-primary-foreground/20"
                style={{ background: getContactColor(selectedContact.type) }}
              >
                {getContactIcon(selectedContact.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{selectedContact.label}</p>
                <p className="text-[10px] opacity-70 truncate">{selectedContact.subtitle || selectedContact.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-auto p-3 space-y-1.5 min-h-[250px]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {loadingChat ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-muted/80 rounded-2xl px-4 py-2 text-xs text-muted-foreground text-center">
                    No messages yet. Say hello! 👋
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_email === user?.email;
                    const showTime = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime()) > 300000;
                    return (
                      <div key={msg.id}>
                        {showTime && (
                          <div className="flex justify-center my-2">
                            <span className="text-[10px] bg-muted/80 text-muted-foreground px-3 py-1 rounded-full">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`relative max-w-[78%] px-3 py-2 ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                                : "bg-card text-foreground rounded-2xl rounded-bl-md border border-border/50"
                            }`}
                            style={{
                              boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
                            }}
                          >
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5 -mb-0.5">
                              <span className={`text-[9px] ${isMe ? "opacity-60" : "text-muted-foreground"}`}>
                                {new Date(msg.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMe && <CheckCheck size={12} className={msg.is_read ? "text-sky-300" : "opacity-50"} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div className="p-2 bg-card border-t border-border/50 flex items-end gap-2">
              <div className="flex-1 bg-muted rounded-3xl px-4 py-1 min-h-[42px] flex items-center">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none resize-none max-h-[100px] py-2 leading-5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 100) + "px";
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/30"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </>
        )}

        {/* ===== REQUESTS VIEW ===== */}
        {view === "requests" && (
          <>
            <div className="bg-primary text-primary-foreground px-4 pt-5 pb-3 rounded-t-3xl">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setView("chats")} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-base font-bold">My Requests</h2>
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {[
                  { key: "all", label: "All" },
                  { key: "replied", label: "Replied" },
                  { key: "feature", label: "Features" },
                  { key: "problem", label: "Problems" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                      filter === f.key
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary-foreground/15 text-primary-foreground/70 hover:bg-primary-foreground/25"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-2.5 p-3 bg-background">
              {loadingReq ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Mail size={36} className="text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No requests yet</p>
                </div>
              ) : (
                filtered.map((req) => {
                  const config = typeConfig[req.type] || typeConfig.feature;
                  const Icon = config.icon;
                  return (
                    <div key={req.id} className="rounded-2xl border border-border bg-card p-3 transition-all hover:shadow-md">
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: config.color + "18", color: config.color }}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: config.color + "18", color: config.color }}>
                              {config.label}
                            </span>
                            {req.admin_reply ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 flex items-center gap-0.5">
                                <CheckCheck size={8} /> Replied
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                                <Clock size={8} /> Pending
                              </span>
                            )}
                            <span className="text-[9px] text-muted-foreground ml-auto">
                              {formatTime(req.created_at)}
                            </span>
                          </div>
                          <p className="font-semibold text-xs text-foreground">{req.subject}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{req.message}</p>
                          {req.admin_reply && (
                            <div className="mt-2 p-2 rounded-xl bg-primary/8 border border-primary/15">
                              <p className="text-[9px] font-bold text-primary mb-0.5 flex items-center gap-1">
                                <CheckCheck size={8} /> Admin Reply
                              </p>
                              <p className="text-xs text-foreground">{req.admin_reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default TeacherInbox;
