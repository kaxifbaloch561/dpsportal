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
  MicOff,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Play,
  Pause,
  X,
  Users,
  Clock,
  Download,
  Trash2,
  Square,
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
  created_at: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const { error } = await supabase.from("discussion_messages").insert({
      sender_email: senderEmail,
      sender_name: senderName,
      sender_type: senderType,
      message: newMessage.trim(),
      message_type: "text",
    });
    if (error) toast.error("Failed to send");
    else setNewMessage("");
    setSending(false);
  };

  // Voice recording
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
          const { error } = await supabase.from("discussion_messages").insert({
            sender_email: senderEmail,
            sender_name: senderName,
            sender_type: senderType,
            message: `Voice clip (${recordingTime}s)`,
            message_type: "voice",
            file_url: base64,
            file_name: `voice-${Date.now()}.webm`,
            file_type: "audio/webm",
          });
          if (error) toast.error("Failed to send voice clip");
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

  // File upload
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
      const { error } = await supabase.from("discussion_messages").insert({
        sender_email: senderEmail,
        sender_name: senderName,
        sender_type: senderType,
        message: file.name,
        message_type: msgType,
        file_url: base64,
        file_name: file.name,
        file_type: file.type,
      });
      if (error) toast.error("Failed to upload file");
      else toast.success("File sent!");
      setSending(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("discussion_messages").delete().eq("id", id);
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

  const renderMessage = (msg: DiscussionMessage) => {
    const isMine = msg.sender_email === senderEmail;

    return (
      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group mb-2`}>
        <div className={`relative max-w-[85%] rounded-2xl p-3 ${
          isMine
            ? msg.sender_type === "admin"
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md"
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

          {/* Sender name */}
          {!isMine && (
            <p className={`text-[10px] font-bold mb-1 ${msg.sender_type === "admin" ? "text-primary" : "text-emerald-600 dark:text-emerald-400"}`}>
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold">Live</span>
              </div>
            </div>
          </SheetHeader>

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
                {/* Attachment button */}
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

                {/* Voice button */}
                <button
                  onClick={startRecording}
                  className="p-2.5 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Mic size={18} />
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                    className="rounded-2xl pr-12 h-11 text-sm bg-muted border-0"
                  />
                </div>

                {/* Send button */}
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
