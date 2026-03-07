import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Megaphone, Clock, X, ChevronRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  expires_at: string | null;
  created_at: string;
}

const AnnouncementPopup = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showCornerBtn, setShowCornerBtn] = useState(false);
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
          setShowPopup(true);
        }
        setShowCornerBtn(true);
      } else {
        setShowCornerBtn(false);
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

  const getCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expiring...";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleDismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem("dps_announcements_dismissed", "true");
  };

  if (announcements.length === 0) return null;

  return (
    <>
      {/* Corner button */}
      {showCornerBtn && !showPopup && (
        <button
          onClick={() => setShowPopup(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-black flex items-center justify-center shadow-[0_8px_32px_-4px_rgba(245,158,11,0.5)] hover:scale-110 hover:shadow-[0_12px_40px_-4px_rgba(245,158,11,0.7)] transition-all duration-300 animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          <Megaphone size={22} />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {announcements.length}
          </span>
        </button>
      )}

      {/* Popup */}
      <Dialog open={showPopup} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
        <DialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/30 shadow-[0_20px_60px_-12px_rgba(245,158,11,0.4)]">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-5">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/15" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
            </div>
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center">
                <Megaphone size={24} className="text-black" />
              </div>
              <div>
                <h2 className="text-lg font-black text-black">📢 Announcements</h2>
                <p className="text-xs text-black/70 font-medium">{announcements.length} active announcement{announcements.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
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
    </>
  );
};

export default AnnouncementPopup;
