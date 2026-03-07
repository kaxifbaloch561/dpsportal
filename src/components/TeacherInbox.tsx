import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Sparkles, AlertTriangle, Lightbulb, CheckCheck, Clock, MessageSquare, Send, ChevronLeft, ShieldCheck, GraduationCap } from "lucide-react";
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

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  feature: { icon: Sparkles, label: "Feature Request", color: "hsl(235,78%,62%)" },
  problem: { icon: AlertTriangle, label: "Problem Report", color: "hsl(0,72%,55%)" },
  suggestion: { icon: Lightbulb, label: "Suggestion", color: "hsl(45,90%,50%)" },
};

interface Contact {
  id: string;
  label: string;
  email: string;
  icon: any;
  color: string;
}

const CONTACTS: Contact[] = [
  { id: "admin", label: "Admin", email: "admin", icon: ShieldCheck, color: "hsl(235,78%,62%)" },
  { id: "principal", label: "Principal", email: "principal.access@dps.portal", icon: GraduationCap, color: "hsl(270,60%,55%)" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeacherInbox = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "chat">("requests");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // === Requests state ===
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // === Chat state ===
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadPerContact, setUnreadPerContact] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const fetchUnreadCounts = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("admin_messages")
      .select("sender_email, sender_type")
      .eq("recipient_email", user.email)
      .eq("is_read", false);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((m: any) => {
        // Map sender to contact id
        if (m.sender_type === "admin") counts["admin"] = (counts["admin"] || 0) + 1;
        else if (m.sender_type === "principal") counts["principal"] = (counts["principal"] || 0) + 1;
      });
      setUnreadPerContact(counts);
    }
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
    fetchUnreadCounts();
  };

  useEffect(() => {
    if (open) {
      setLoadingReq(true);
      fetchRequests();
      fetchUnreadCounts();

      const ch1 = supabase
        .channel("teacher-inbox-requests")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "teacher_requests" }, () => fetchRequests())
        .subscribe();
      const ch2 = supabase
        .channel("teacher-inbox-dm")
        .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => {
          fetchUnreadCounts();
          if (selectedContact) fetchMessages(selectedContact);
        })
        .subscribe();

      return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
    }
  }, [open, user?.email, selectedContact]);

  useEffect(() => {
    if (selectedContact) fetchMessages(selectedContact);
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user?.email || !selectedContact || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from("admin_messages").insert({
      sender_type: "teacher",
      sender_email: user.email,
      recipient_email: selectedContact.email,
      subject: newSubject.trim() || `Message from Teacher`,
      message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    else { setNewMessage(""); setNewSubject(""); toast.success("Sent!"); }
    setSending(false);
  };

  const repliedCount = requests.filter((r) => r.admin_reply).length;
  const totalUnread = Object.values(unreadPerContact).reduce((a, b) => a + b, 0);
  const filtered = filter === "all" ? requests : filter === "replied" ? requests.filter((r) => r.admin_reply) : requests.filter((r) => r.type === filter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <Mail size={18} />
            </div>
            Inbox
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="px-4 flex gap-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Mail size={14} /> Requests
            {repliedCount > 0 && (
              <span className="bg-green-500/20 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{repliedCount}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab("chat"); setSelectedContact(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <MessageSquare size={14} /> Messages
            {totalUnread > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{totalUnread}</span>
            )}
          </button>
        </div>

        {/* === Requests Tab === */}
        {activeTab === "requests" && (
          <>
            <div className="px-4 pt-3 flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "replied", label: "Replied" },
                { key: "feature", label: "Features" },
                { key: "problem", label: "Problems" },
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

            <div className="flex-1 overflow-auto space-y-3 p-4">
              {loadingReq ? (
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
          </>
        )}

        {/* === Chat Tab — Contact List === */}
        {activeTab === "chat" && !selectedContact && (
          <div className="flex-1 overflow-auto p-4 space-y-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Select who to message:</p>
            {CONTACTS.map((contact) => {
              const Icon = contact.icon;
              const unread = unreadPerContact[contact.id] || 0;
              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card hover:bg-accent hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/25 transition-all duration-300"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: contact.color + "20", color: contact.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-foreground">{contact.label}</p>
                    <p className="text-[10px] text-muted-foreground">Tap to chat</p>
                  </div>
                  {unread > 0 && (
                    <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-destructive text-destructive-foreground text-[11px] font-bold rounded-full px-1.5 animate-pulse shadow-lg">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* === Chat Tab — Conversation === */}
        {activeTab === "chat" && selectedContact && (
          <>
            {/* Chat header */}
            <div className="px-4 py-2 flex items-center gap-3 border-b border-border">
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: selectedContact.color + "20", color: selectedContact.color }}
              >
                {(() => { const Icon = selectedContact.icon; return <Icon size={18} />; })()}
              </div>
              <p className="text-sm font-bold text-foreground">{selectedContact.label}</p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3 min-h-[200px]">
              {loadingChat ? (
                <p className="text-center text-muted-foreground py-12">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">No messages yet. Start a conversation!</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_email === user?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3 ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        <p className="text-[10px] font-bold mb-1 opacity-75">{msg.subject}</p>
                        <p className="text-sm">{msg.message}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Clock size={10} className="opacity-50" />
                          <span className="text-[9px] opacity-50">
                            {new Date(msg.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && <CheckCheck size={10} className={msg.is_read ? "text-green-300" : "opacity-50"} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
                  placeholder={`Message ${selectedContact.label}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="rounded-xl text-sm min-h-[50px] resize-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button size="icon" onClick={handleSend} disabled={sending || !newMessage.trim()} className="rounded-xl h-auto self-end">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherInbox;
