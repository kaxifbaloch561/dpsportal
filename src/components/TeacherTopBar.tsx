import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Send, Fingerprint, ArrowLeft } from "lucide-react";
import TeacherInbox from "@/components/TeacherInbox";
import TeacherProfile from "@/components/TeacherProfile";

const TeacherTopBar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showInbox, setShowInbox] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadInbox, setUnreadInbox] = useState(0);

  const isDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    if (user?.role !== "teacher" || !user.email) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from("admin_messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_email", user.email!)
        .eq("is_read", false);
      setUnreadInbox(count ?? 0);
    };

    const markDelivered = async () => {
      await supabase
        .from("admin_messages")
        .update({ is_delivered: true } as any)
        .eq("recipient_email", user.email!)
        .eq("is_delivered", false);
    };

    fetchUnread();
    markDelivered();

    const ch = supabase
      .channel("global-inbox-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_messages" }, () => {
        fetchUnread();
        markDelivered();
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user?.email, user?.role]);

  if (user?.role !== "teacher") return null;

  return (
    <>
      <div className="absolute top-3 sm:top-4 left-3 sm:left-6 right-3 sm:right-6 z-[100] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isDashboard && (
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card border border-border/50 text-foreground hover:border-primary/40 hover:shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.2)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          )}
          <button
            id="tour-inbox"
            onClick={() => setShowInbox(true)}
            className="group relative flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-card border border-border/50 text-foreground hover:border-primary/40 hover:shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.2)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
          >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
            <Send size={13} strokeWidth={2.5} className="rotate-[-30deg]" />
            {unreadInbox > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center border-[1.5px] border-card animate-pulse">
                {unreadInbox > 9 ? "9+" : unreadInbox}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-muted-foreground group-hover:text-foreground transition-colors">Inbox</span>
          </button>
        </div>

        <button
          id="tour-profile"
          onClick={() => setShowProfile(true)}
          className="pointer-events-auto group relative flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 text-foreground hover:border-primary/40 hover:shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.2)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
        >
          <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-muted-foreground group-hover:text-foreground transition-colors">Profile</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all duration-300">
            <Fingerprint size={14} strokeWidth={2.5} />
          </div>
        </button>
      </div>

      <TeacherInbox open={showInbox} onOpenChange={setShowInbox} />
      <TeacherProfile open={showProfile} onOpenChange={setShowProfile} />
    </>
  );
};

export default TeacherTopBar;
