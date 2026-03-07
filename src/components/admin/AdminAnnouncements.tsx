import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Plus, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data as Announcement[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
    const ch = supabase
      .channel("admin-announcements")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => fetchAnnouncements())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    setCreating(true);
    const payload: any = { title: title.trim(), message: message.trim(), is_active: true };
    if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();
    const { error } = await supabase.from("announcements").insert(payload);
    if (error) toast.error("Failed to create");
    else { setTitle(""); setMessage(""); setExpiresAt(""); toast.success("Announcement created!"); }
    setCreating(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("announcements").update({ is_active: !active }).eq("id", id);
    toast.success(active ? "Deactivated" : "Activated");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Deleted");
  };

  const getCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Countdown timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-yellow-600">
          <Megaphone size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Announcements</h3>
          <p className="text-xs text-muted-foreground">Create announcements for all teachers</p>
        </div>
      </div>

      {/* Create form */}
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Plus size={16} className="text-yellow-600" />
          <span className="text-sm font-bold text-foreground">New Announcement</span>
        </div>
        <Input
          placeholder="Announcement title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl"
        />
        <Textarea
          placeholder="Announcement message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-xl min-h-[80px] resize-none"
        />
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
              Expiry Date & Time (optional)
            </label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>
          <Button onClick={handleCreate} disabled={creating} className="rounded-xl mt-5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
            <Megaphone size={16} /> Publish
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : announcements.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">No announcements yet</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const isExpired = a.expires_at && new Date(a.expires_at).getTime() < Date.now();
            const isActive = a.is_active && !isExpired;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isActive
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : "border-border bg-card opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-foreground">{a.title}</span>
                      {isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                          <XCircle size={10} /> {isExpired ? "Expired" : "Inactive"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{a.message}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>Created: {new Date(a.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {a.expires_at && (
                        <span className={`flex items-center gap-1 font-bold ${isExpired ? "text-destructive" : "text-yellow-600"}`}>
                          <Clock size={10} />
                          {isExpired ? "Expired" : getCountdown(a.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(a.id, a.is_active)}
                      className="rounded-xl text-xs h-8"
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(a.id)}
                      className="rounded-xl h-8"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
