import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Megaphone, Clock, X, ChevronRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  expires_at: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnnouncementPopup = ({ open, onOpenChange }: Props) => {
  const { user, isTeacher } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [, setTick] = useState(0);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) {
      const active = (data as Announcement[]).filter(
        (a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now()
      );
      setAnnouncements(active);
      if (active.length > 0) {
        const dismissed = sessionStorage.getItem("dps_announcements_dismissed");
        if (!dismissed) {
          setShowLoginPopup(true);
        }
      }
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const ch = supabase
      .channel("teacher-announcements")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => fetchAnnouncements())
      .subscribe();
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => { supabase.removeChannel(ch); clearInterval(timer); };
  }, []);

  // Record view when teacher opens the popup
  const recordView = async () => {
    if (!isTeacher || !user?.email || announcements.length === 0) return;

    // Fetch teacher name
    const { data: teacher } = await supabase
      .from("teacher_accounts")
      .select("first_name, last_name")
      .eq("email", user.email)
      .maybeSingle();

    const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : user.email;

    // Upsert view for each active announcement
    for (const a of announcements) {
      await supabase
        .from("announcement_views")
        .upsert(
          {
            announcement_id: a.id,
            teacher_email: user.email,
            teacher_name: teacherName,
            seen_at: new Date().toISOString(),
          },
          { onConflict: "announcement_id,teacher_email" }
        );
    }
  };

  // When popup becomes visible, record the view
  useEffect(() => {
    const isOpen = open || showLoginPopup;
    if (isOpen && announcements.length > 0) {
      recordView();
    }
  }, [open, showLoginPopup, announcements.length]);

  const getCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expiring...";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const handleDismissLogin = () => {
    setShowLoginPopup(false);
    sessionStorage.setItem("dps_announcements_dismissed", "true");
  };

  const isOpen = open || showLoginPopup;
  const handleClose = (v: boolean) => {
    if (!v) {
      handleDismissLogin();
      onOpenChange(false);
    }
  };

  if (announcements.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/30 shadow-[0_20px_60px_-12px_rgba(245,158,11,0.4)]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-5">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/15" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          </div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center">
              <Megaphone size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black">📢 Announcements</h2>
              <p className="text-xs text-black/70 font-medium">{announcements.length} active announcement{announcements.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={() => handleClose(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-black" />
          </button>
        </div>

        {/* Announcements list */}
        <div className="p-4 space-y-3 max-h-[50vh] overflow-auto">
          {announcements.map((a, i) => (
            <div
              key={a.id}
              className="rounded-2xl border-2 border-yellow-300/50 bg-white/80 dark:bg-black/20 p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ animation: `slideUp 0.5s ease forwards ${i * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <ChevronRight size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground mb-1">{a.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>{new Date(a.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>
                    {a.expires_at && (
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Clock size={10} />
                        {getCountdown(a.expires_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementPopup;
