import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, BookOpen, Shield, LogOut, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherData {
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
  }, [open, user?.email]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-card rounded-[32px] p-6 relative overflow-hidden"
        style={{
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.3)",
          animation: "containerSpring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <X size={16} />
        </button>

        {teacher ? (
          <div className="space-y-5">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center mb-3">
                {teacher.avatar_url ? (
                  <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-muted-foreground" />
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {teacher.first_name} {teacher.middle_name || ""} {teacher.last_name}
              </h2>
              <p className="text-xs text-muted-foreground">{teacher.class_teacher || "Teacher"}</p>
            </div>

            {/* Details */}
            <div className="space-y-3 bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground break-all">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={16} className="text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">Password</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {showPassword ? teacher.password : "••••••••"}
                    </p>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-primary">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <BookOpen size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Subjects</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(teacher.subjects || []).map((sub) => (
                      <span key={sub} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full rounded-full"
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Profile not available</p>
            <Button onClick={handleLogout} variant="outline" className="mt-4 rounded-full">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProfile;
