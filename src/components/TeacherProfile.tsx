import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Mail, BookOpen, Shield, LogOut, Eye, EyeOff, X, KeyRound, Check, Fingerprint, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface TeacherData {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  password: string;
  class_teacher: string | null;
  avatar_url: string | null;
  subjects: string[];
}

interface TeacherProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeacherProfile = ({ open, onOpenChange }: TeacherProfileProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user?.email) {
      supabase
        .from("teacher_accounts")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setTeacher(data as unknown as TeacherData);
        });
    }
    if (!open) {
      setChangingPassword(false);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    }
  }, [open, user?.email]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!teacher) return;
    if (!currentPass || !newPass || !confirmPass) {
      toast({ title: "تمام فیلڈز پُر کریں", variant: "destructive" });
      return;
    }
    if (currentPass !== teacher.password) {
      toast({ title: "موجودہ پاسورڈ غلط ہے", variant: "destructive" });
      return;
    }
    if (newPass.length < 6) {
      toast({ title: "نیا پاسورڈ کم از کم 6 حروف کا ہونا چاہیے", variant: "destructive" });
      return;
    }
    if (newPass === currentPass) {
      toast({ title: "نیا پاسورڈ پرانے سے مختلف ہونا چاہیے", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "نیا پاسورڈ میچ نہیں ہو رہا", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("teacher_accounts")
      .update({ password: newPass, updated_at: new Date().toISOString() })
      .eq("id", teacher.id);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ پاسورڈ کامیابی سے تبدیل ہو گیا!" });
      setTeacher({ ...teacher, password: newPass });
      setChangingPassword(false);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div
        className="w-full max-w-sm bg-card/95 backdrop-blur-2xl rounded-[28px] relative overflow-hidden max-h-[90vh] overflow-y-auto border border-border/30"
        style={{
          boxShadow: "0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
          animation: "containerSpring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Premium gradient header */}
        <div className="relative h-28 overflow-hidden" style={{ background: "linear-gradient(145deg, hsl(var(--primary)), hsl(255,75%,48%), hsl(280,65%,45%))" }}>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 30% 60%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl" />
          
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all active:scale-95 border border-white/10"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          
          <div className="absolute top-3.5 left-4 flex items-center gap-2">
            <Sparkles size={12} className="text-white/40" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em]">Teacher Profile</span>
          </div>
        </div>

        {teacher ? (
          <div className="px-5 pb-5">
            {/* Avatar - overlapping the header */}
            <div className="flex flex-col items-center -mt-12 mb-3">
              <div className="relative">
                <div className="w-[88px] h-[88px] rounded-2xl border-[3px] border-card overflow-hidden bg-muted flex items-center justify-center shadow-xl shadow-black/15 ring-2 ring-primary/20">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Fingerprint size={36} className="text-muted-foreground/30" />
                  )}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg border-2 border-card" style={{ background: "linear-gradient(135deg, hsl(145,72%,46%), hsl(160,80%,40%))" }}>
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h2 className="text-lg font-extrabold text-foreground tracking-tight mt-2.5 leading-tight">
                {teacher.first_name} {teacher.middle_name || ""} {teacher.last_name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Crown size={11} className="text-primary/60" />
                <p className="text-[11px] text-muted-foreground font-semibold">{teacher.class_teacher || "Teacher"}</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-2 mb-3">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(255,75%,55%))" }}>
                  <Mail size={15} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Email</p>
                  <p className="text-xs font-semibold text-foreground break-all leading-snug">{teacher.email}</p>
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, hsl(270,60%,50%), hsl(290,55%,55%))" }}>
                  <Shield size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground font-mono tracking-wider">
                      {showPassword ? teacher.password : "••••••••"}
                    </p>
                    <button onClick={() => setShowPassword(!showPassword)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm" style={{ background: "linear-gradient(135deg, hsl(160,55%,38%), hsl(140,60%,45%))" }}>
                  <BookOpen size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Subjects</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(teacher.subjects || []).map((sub) => (
                      <span key={sub} className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-primary/15 shadow-sm" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            {!changingPassword ? (
              <Button
                variant="outline"
                className="w-full rounded-2xl text-xs h-10 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => setChangingPassword(true)}
              >
                <KeyRound size={14} /> Change Password
              </Button>
            ) : (
              <div className="space-y-2.5 bg-muted/50 rounded-2xl p-4 border border-border/30" style={{ animation: "slideUp 0.3s ease forwards" }}>
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <KeyRound size={14} className="text-primary" /> Change Password
                </p>
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
                <Input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="flex-1 rounded-xl h-9 text-xs"
                  >
                    <Check size={13} /> {saving ? "Saving..." : "Update"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setChangingPassword(false); setCurrentPass(""); setNewPass(""); setConfirmPass(""); }}
                    className="rounded-xl h-9 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full rounded-2xl h-11 text-xs font-bold mt-3 shadow-lg shadow-destructive/20"
              style={{ background: "linear-gradient(135deg, hsl(0,75%,55%), hsl(15,85%,50%))" }}
            >
              <LogOut size={14} /> Logout
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 px-5">
            <Fingerprint size={40} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground text-xs">Profile not available</p>
            <Button onClick={handleLogout} variant="outline" className="mt-4 rounded-xl text-xs h-9">
              <LogOut size={14} /> Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProfile;