import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Play,
  Pause,
  X,
  Users,
  Clock,
  Download,
  Square,
  Reply,
  ChevronRight,
  Circle,
} from "lucide-react";
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

interface DiscussionMessage {
  id: string;
  sender_email: string;
  sender_name: string;
  sender_type: string;
  message: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  reply_to_id: string | null;
  reply_to_name: string | null;
  reply_to_text: string | null;
  created_at: string;
}

interface OnlineMember {
  user_email: string;
  user_name: string;
  user_type: string;
  last_seen: string;
}

interface DiscussionRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DiscussionRoom = ({ open, onOpenChange }: DiscussionRoomProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<DiscussionMessage | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [swipeState, setSwipeState] = useState<{ id: string; x: number } | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; id: string } | null>(null);

  const senderEmail = user?.role === "admin" ? "admin" : (user?.email || "");
  const [senderName, setSenderName] = useState(user?.role === "admin" ? "Admin" : "Teacher");
  const senderType = user?.role === "admin" ? "admin" : "teacher";
  const isAdmin = user?.role === "admin";

  // Fetch teacher name
  useEffect(() => {
    if (user?.role === "teacher" && user?.email) {
      supabase
        .from("teacher_accounts")
        .select("first_name, last_name")
        .eq("email", user.email)
        .single()
        .then(({ data }) => {
          if (data) setSenderName(`${data.first_name} ${data.last_name}`);
        });
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("discussion_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as DiscussionMessage[]);
  }, []);

  // Presence heartbeat
  useEffect(() => {
    if (!open || !senderEmail) return;

    const updatePresence = async () => {
      await (supabase as any)
        .from("discussion_presence")
        .upsert(
          { user_email: senderEmail, user_name: senderName, user_type: senderType, last_seen: new Date().toISOString(), is_typing: false },
          { onConflict: "user_email" }
        );
    };

    updatePresence();
    const interval = setInterval(updatePresence, 15000);

    // Cleanup: set is_typing false on close
    return () => {
      clearInterval(interval);
      (supabase as any).from("discussion_presence").update({ is_typing: false }).eq("user_email", senderEmail).then(() => {});
    };
  }, [open, senderEmail, senderName, senderType]);

  // Set typing status
  const setTypingStatus = useCallback(async (typing: boolean) => {
    await (supabase as any)
      .from("discussion_presence")
      .update({ is_typing: typing })
      .eq("user_email", senderEmail);
  }, [senderEmail]);

  const handleTyping = useCallback(() => {
    setTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTypingStatus(false), 2500);
  }, [setTypingStatus]);

  // Fetch who's typing (poll every 2s)
  useEffect(() => {
    if (!open) return;
    const fetchTyping = async () => {
      const { data } = await (supabase as any)
        .from("discussion_presence")
        .select("user_name, user_email")
        .eq("is_typing", true)
        .neq("user_email", senderEmail);
      if (data) setTypingUsers((data as any[]).map((d: any) => d.user_name));
      else setTypingUsers([]);
    };
    fetchTyping();
    const interval = setInterval(fetchTyping, 2000);
    return () => clearInterval(interval);
  }, [open, senderEmail]);

  // Fetch online members (admin only)
  const fetchOnlineMembers = useCallback(async () => {
    if (!isAdmin) return;
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data } = await (supabase as any)
      .from("discussion_presence")
      .select("*")
      .gte("last_seen", fiveMinAgo)
      .order("last_seen", { ascending: false });
    if (data) setOnlineMembers(data as OnlineMember[]);
  }, [isAdmin]);

  useEffect(() => {
    if (open && isAdmin) {
      fetchOnlineMembers();
      const interval = setInterval(fetchOnlineMembers, 10000);
      return () => clearInterval(interval);
    }
  }, [open, isAdmin, fetchOnlineMembers]);

  useEffect(() => {
    if (open) {
      fetchMessages();
      const ch = supabase
        .channel("discussion-room")
        .on("postgres_changes", { event: "*", schema: "public", table: "discussion_messages" }, () => fetchMessages())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [open, fetchMessages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, open]);

  const handleSendText = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const payload: any = {
      sender_email: senderEmail,
      sender_name: senderName,
      sender_type: senderType,
      message: newMessage.trim(),
      message_type: "text",
    };
    if (replyTo) {
      payload.reply_to_id = replyTo.id;
      payload.reply_to_name = replyTo.sender_name;
      payload.reply_to_text = replyTo.message_type === "text"
        ? (replyTo.message || "").slice(0, 100)
        : replyTo.message_type === "voice" ? "🎤 Voice clip" : `📎 ${replyTo.file_name || "File"}`;
    }
    const { error } = await (supabase as any).from("discussion_messages").insert(payload);
    if (error) toast.error("Failed to send");
    else { setNewMessage(""); setReplyTo(null); }
    setSending(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setSending(true);
          const payload: any = {
            sender_email: senderEmail,
            sender_name: senderName,
            sender_type: senderType,
            message: `Voice clip (${recordingTime}s)`,
            message_type: "voice",
            file_url: base64,
            file_name: `voice-${Date.now()}.webm`,
            file_type: "audio/webm",
          };
          if (replyTo) {
            payload.reply_to_id = replyTo.id;
            payload.reply_to_name = replyTo.sender_name;
            payload.reply_to_text = replyTo.message_type === "text" ? (replyTo.message || "").slice(0, 100) : "📎 File";
          }
          const { error } = await (supabase as any).from("discussion_messages").insert(payload);
          if (error) toast.error("Failed to send voice clip");
          else setReplyTo(null);
          setSending(false);
          setRecordingTime(0);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      let msgType = "file";
      if (file.type.startsWith("image/")) msgType = "image";
      else if (file.type.startsWith("audio/")) msgType = "voice";

      setSending(true);
      const payload: any = {
        sender_email: senderEmail,
        sender_name: senderName,
        sender_type: senderType,
        message: file.name,
        message_type: msgType,
        file_url: base64,
        file_name: file.name,
        file_type: file.type,
      };
      if (replyTo) {
        payload.reply_to_id = replyTo.id;
        payload.reply_to_name = replyTo.sender_name;
        payload.reply_to_text = replyTo.message_type === "text" ? (replyTo.message || "").slice(0, 100) : "📎 File";
      }
      const { error } = await (supabase as any).from("discussion_messages").insert(payload);
      if (error) toast.error("Failed to upload file");
      else { toast.success("File sent!"); setReplyTo(null); }
      setSending(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("discussion_messages").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else toast.success("Message deleted");
    setDeleteTarget(null);
  };

  const playAudio = (url: string, id: string) => {
    if (playingAudio === id) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingAudio(id);
    audio.onended = () => setPlayingAudio(null);
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText size={20} />;
    if (fileType.startsWith("image/")) return <ImageIcon size={20} />;
    return <FileText size={20} />;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Touch handlers for swipe-to-reply
  const handleTouchStart = (e: React.TouchEvent, msgId: string) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, id: msgId };
  };

  const handleTouchMove = (e: React.TouchEvent, msgId: string) => {
    if (!touchStartRef.current || touchStartRef.current.id !== msgId) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
    if (dy > 30) { touchStartRef.current = null; setSwipeState(null); return; }
    if (dx > 10) {
      setSwipeState({ id: msgId, x: Math.min(dx, 80) });
    }
  };

  const handleTouchEnd = (msgId: string) => {
    if (swipeState && swipeState.id === msgId && swipeState.x >= 60) {
      const msg = messages.find((m) => m.id === msgId);
      if (msg) {
        setReplyTo(msg);
        inputRef.current?.focus();
      }
    }
    setSwipeState(null);
    touchStartRef.current = null;
  };

  const handleReplyClick = (msg: DiscussionMessage) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary/50");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary/50"), 2000);
    }
  };

  const renderMessage = (msg: DiscussionMessage) => {
    const isMine = msg.sender_email === senderEmail;
    const swipeX = swipeState?.id === msg.id ? swipeState.x : 0;

    return (
      <div
        key={msg.id}
        id={`msg-${msg.id}`}
        className={`flex ${isMine ? "justify-end" : "justify-start"} group mb-2 transition-all duration-150`}
        onTouchStart={(e) => handleTouchStart(e, msg.id)}
        onTouchMove={(e) => handleTouchMove(e, msg.id)}
        onTouchEnd={() => handleTouchEnd(msg.id)}
        style={{ transform: `translateX(${swipeX}px)` }}
      >
        {/* Swipe reply indicator */}
        {swipeX > 20 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-primary opacity-70">
            <Reply size={18} />
          </div>
        )}

        <div className={`relative max-w-[80%] rounded-2xl p-3 ${
          isMine
            ? msg.sender_type === "admin"
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md"
              : "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-br-md"
            : msg.sender_type === "admin"
              ? "bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-foreground rounded-bl-md"
              : "bg-muted text-foreground rounded-bl-md"
        }`}>
          {/* Delete button for admin */}
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(msg.id)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
            >
              <X size={10} />
            </button>
          )}

          {/* Reply button (desktop - on hover) */}
          <button
            onClick={() => handleReplyClick(msg)}
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          >
            <Reply size={12} />
          </button>

          {/* Reply-to preview */}
          {msg.reply_to_id && msg.reply_to_name && (
            <button
              onClick={() => msg.reply_to_id && scrollToMessage(msg.reply_to_id)}
              className={`flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-xl text-left w-full transition-colors ${
                isMine ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
              }`}
            >
              <div className={`w-0.5 h-8 rounded-full shrink-0 ${isMine ? "bg-white/50" : "bg-primary/50"}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] font-bold truncate ${isMine ? "text-white/80" : "text-primary/80"}`}>
                  {msg.reply_to_name}
                </p>
                <p className={`text-[11px] truncate ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                  {msg.reply_to_text}
                </p>
              </div>
            </button>
          )}

          {/* Sender name */}
          {!isMine && (
            <p className={`text-[10px] font-bold mb-1 ${msg.sender_type === "admin" ? "text-primary" : "text-accent-foreground/70"}`}>
              {msg.sender_name} {msg.sender_type === "admin" && "👑"}
            </p>
          )}

          {/* Content based on type */}
          {msg.message_type === "text" && (
            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
          )}

          {msg.message_type === "voice" && msg.file_url && (
            <div className="flex items-center gap-3 min-w-[180px]">
              <button
                onClick={() => playAudio(msg.file_url!, msg.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isMine ? "bg-white/20 hover:bg-white/30" : "bg-primary/10 hover:bg-primary/20 text-primary"
                }`}
              >
                {playingAudio === msg.id ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="flex-1">
                <div className="flex gap-[2px] items-end h-6">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-[3px] rounded-full ${isMine ? "bg-white/40" : "bg-primary/30"}`}
                      style={{ height: `${Math.random() * 100}%`, minHeight: 3 }}
                    />
                  ))}
                </div>
                <p className="text-[10px] opacity-60 mt-0.5">{msg.message}</p>
              </div>
            </div>
          )}

          {msg.message_type === "image" && msg.file_url && (
            <div>
              <img
                src={msg.file_url}
                alt={msg.file_name || "Image"}
                className="rounded-xl max-w-full max-h-[300px] object-cover cursor-pointer"
                onClick={() => window.open(msg.file_url!, "_blank")}
              />
              {msg.file_name && <p className="text-[10px] opacity-60 mt-1">{msg.file_name}</p>}
            </div>
          )}

          {msg.message_type === "file" && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-white/5 min-w-[200px]">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isMine ? "bg-white/20" : "bg-primary/10 text-primary"
              }`}>
                {getFileIcon(msg.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{msg.file_name}</p>
                <p className="text-[10px] opacity-60">{msg.file_type}</p>
              </div>
              {msg.file_url && (
                <a href={msg.file_url} download={msg.file_name || "file"} className={`p-1.5 rounded-lg transition-colors ${isMine ? "hover:bg-white/20" : "hover:bg-primary/10"}`}>
                  <Download size={14} />
                </a>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 mt-1.5 justify-end">
            <Clock size={9} className="opacity-40" />
            <span className="text-[9px] opacity-40">
              {new Date(msg.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="p-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-base font-bold">Discussion Room</SheetTitle>
                <p className="text-[11px] text-muted-foreground">Teachers & Admin Group Chat</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Online members button - admin only */}
                {isAdmin && (
                  <button
                    onClick={() => { fetchOnlineMembers(); setShowMembers(!showMembers); }}
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Users size={14} />
                    <span className="text-[10px] font-bold">{onlineMembers.length}</span>
                  </button>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold">Live</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Users size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs">Start the discussion!</p>
                </div>
              )}
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Online Members Sidebar - admin only */}
            {isAdmin && showMembers && (
              <div className="w-56 border-l border-border bg-card/50 flex flex-col shrink-0">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Online Members</h4>
                  <button onClick={() => setShowMembers(false)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                    <ChevronRight size={14} />
                  </button>
                </div>
                <ScrollArea className="flex-1 p-2">
                  {onlineMembers.length === 0 && (
                    <p className="text-center text-muted-foreground py-6 text-[11px]">No one online</p>
                  )}
                  {onlineMembers.map((m) => {
                    const isOnlineNow = Date.now() - new Date(m.last_seen).getTime() < 2 * 60 * 1000;
                    return (
                      <div key={m.user_email} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-accent/50 transition-colors mb-1">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            m.user_type === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {m.user_name.charAt(0).toUpperCase()}
                          </div>
                          <Circle
                            size={8}
                            fill={isOnlineNow ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                            className={`absolute -bottom-0.5 -right-0.5 ${isOnlineNow ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-foreground truncate">
                            {m.user_name} {m.user_type === "admin" && "👑"}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {isOnlineNow ? "Online now" : `${Math.floor((Date.now() - new Date(m.last_seen).getTime()) / 60000)}m ago`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-1.5 flex items-center gap-2">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-[11px] text-muted-foreground italic">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : typingUsers.length === 2
                    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                    : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`}
              </span>
            </div>
          )}

          {/* Reply preview bar */}
          {replyTo && (
            <div className="px-3 py-2 bg-primary/5 border-t border-primary/10 flex items-center gap-2">
              <Reply size={14} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-primary truncate">{replyTo.sender_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {replyTo.message_type === "text" ? replyTo.message : replyTo.message_type === "voice" ? "🎤 Voice clip" : `📎 ${replyTo.file_name || "File"}`}
                </p>
              </div>
              <button onClick={() => setReplyTo(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-semibold text-destructive">Recording... {formatTime(recordingTime)}</span>
              <div className="flex-1" />
              <Button size="sm" variant="destructive" onClick={stopRecording} className="rounded-xl gap-1.5 h-8">
                <Square size={12} /> Stop & Send
              </Button>
            </div>
          )}

          {/* Input area */}
          {!isRecording && (
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={startRecording}
                  className="p-2.5 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Mic size={18} />
                </button>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                    className="rounded-2xl pr-12 h-11 text-sm bg-muted border-0"
                  />
                </div>
                <Button
                  size="icon"
                  onClick={handleSendText}
                  disabled={sending || !newMessage.trim()}
                  className="rounded-xl h-11 w-11 shrink-0 bg-primary hover:bg-primary/90"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>This message will be permanently deleted for everyone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget)} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DiscussionRoom;
