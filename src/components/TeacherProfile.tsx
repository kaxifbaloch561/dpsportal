import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, BookOpen, Shield, LogOut, Eye, EyeOff, X, KeyRound, Check, Fingerprint } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-sm bg-card/95 backdrop-blur-xl rounded-[24px] p-5 relative overflow-hidden max-h-[90vh] overflow-y-auto border border-border/50"
        style={{
          boxShadow: "0 32px 64px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "containerSpring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Decorative top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-accent" />

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-muted/80 flex items-center justify-center hover:bg-accent transition-colors"
        >
          <X size={14} />
        </button>

        {teacher ? (
          <div className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center pt-1">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl border-2 border-primary/20 overflow-hidden bg-muted flex items-center justify-center shadow-lg shadow-primary/10">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Fingerprint size={32} className="text-muted-foreground/40" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                {teacher.first_name} {teacher.middle_name || ""} {teacher.last_name}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{teacher.class_teacher || "Teacher"}</p>
            </div>

            {/* Details */}
            <div className="space-y-2.5 bg-muted/40 rounded-2xl p-3.5 border border-border/30">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Email</p>
                  <p className="text-xs font-semibold text-foreground break-all">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      {showPassword ? teacher.password : "••••••••"}
                    </p>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-primary hover:text-primary/70 transition-colors">
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Subjects</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(teacher.subjects || []).map((sub) => (
                      <span key={sub} className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/15">
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
                className="w-full rounded-xl text-xs h-9"
                onClick={() => setChangingPassword(true)}
              >
                <KeyRound size={14} /> Change Password
              </Button>
            ) : (
              <div className="space-y-2.5 bg-muted/40 rounded-2xl p-3.5 border border-border/30" style={{ animation: "slideUp 0.3s ease forwards" }}>
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
              className="w-full rounded-xl h-9 text-xs"
            >
              <LogOut size={14} /> Logout
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
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
