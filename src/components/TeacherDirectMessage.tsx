import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Clock, CheckCheck } from "lucide-react";
import { toast } from "sonner";

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeacherDirectMessage = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("admin_messages")
      .select("*")
      .or(`sender_email.eq.${user.email},recipient_email.eq.${user.email}`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    setLoading(false);

    // Mark admin messages as read
    await supabase
      .from("admin_messages")
      .update({ is_read: true })
      .eq("recipient_email", user.email)
      .eq("sender_type", "admin")
      .eq("is_read", false);
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchMessages();
      const ch = supabase
        .channel("teacher-dm")
        .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => fetchMessages())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [open, user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user?.email || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from("admin_messages").insert({
      sender_type: "teacher",
      sender_email: user.email,
      recipient_email: "admin",
      subject: newSubject.trim() || "Message from Teacher",
      message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    else { setNewMessage(""); setNewSubject(""); toast.success("Message sent!"); }
    setSending(false);
  };

  const unreadFromAdmin = messages.filter((m) => m.sender_type === "admin" && !m.is_read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <MessageSquare size={18} />
            </div>
            Chat with Admin
            {unreadFromAdmin > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unreadFromAdmin} new
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3 min-h-[300px]">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No messages yet. Start a conversation with admin!</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_type === "teacher";
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

        {/* Input */}
        <div className="p-3 border-t border-border space-y-2">
          <Input
            placeholder="Subject (optional)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="rounded-xl text-sm h-9"
          />
          <div className="flex gap-2">
            <Textarea
              placeholder="Type a message to admin..."
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
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDirectMessage;
