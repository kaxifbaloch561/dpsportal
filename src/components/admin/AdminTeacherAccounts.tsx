import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, Pause, Trash2, ArrowLeft, User, Mail, BookOpen, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TeacherAccount {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  password: string;
  class_teacher: string | null;
  avatar_url: string | null;
  avatar_type: string | null;
  subjects: string[];
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  paused: "bg-orange-100 text-orange-800 border-orange-200",
  removed: "bg-gray-100 text-gray-800 border-gray-200",
};

const AdminTeacherAccounts = () => {
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTeachers(data as unknown as TeacherAccount[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("teacher_accounts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Teacher status updated to ${status}` });
      fetchTeachers();
      if (selectedTeacher?.id === id) {
        setSelectedTeacher((prev) => prev ? { ...prev, status } : null);
      }
    }
  };

  const removeTeacher = async (id: string) => {
    const { error } = await supabase
      .from("teacher_accounts")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Removed", description: "Teacher account has been removed" });
      setSelectedTeacher(null);
      fetchTeachers();
    }
  };

  const filteredTeachers = filter === "all" ? teachers : teachers.filter((t) => t.status === filter);

  if (selectedTeacher) {
    return (
      <div className="px-6 pb-6" style={{ animation: "slideUp 0.4s ease forwards" }}>
        <button
          onClick={() => { setSelectedTeacher(null); setShowPassword(false); }}
          className="flex items-center gap-2 text-sm text-primary font-semibold mb-4 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Teachers List
        </button>

        <div className="bg-card rounded-3xl border border-border p-6 space-y-5">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
              {selectedTeacher.avatar_url ? (
                <img src={selectedTeacher.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {selectedTeacher.first_name} {selectedTeacher.middle_name || ""} {selectedTeacher.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{selectedTeacher.email}</p>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border mt-1 ${statusColors[selectedTeacher.status] || "bg-muted"}`}>
                {selectedTeacher.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground break-all">{selectedTeacher.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Password:</span>
                <span className="font-medium text-foreground">
                  {showPassword ? selectedTeacher.password : "••••••••"}
                </span>
                <button onClick={() => setShowPassword(!showPassword)} className="text-primary">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Class:</span>
                <span className="font-medium text-foreground">{selectedTeacher.class_teacher || "N/A"}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Subjects:</p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedTeacher.subjects || []).map((sub) => (
                  <span key={sub} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {selectedTeacher.status === "pending" && (
              <>
                <Button size="sm" onClick={() => updateStatus(selectedTeacher.id, "approved")} className="rounded-full bg-green-600 hover:bg-green-700">
                  <Check size={14} /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus(selectedTeacher.id, "rejected")} className="rounded-full">
                  <X size={14} /> Reject
                </Button>
              </>
            )}
            {selectedTeacher.status === "approved" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(selectedTeacher.id, "paused")} className="rounded-full text-orange-600 border-orange-300">
                <Pause size={14} /> Pause Account
              </Button>
            )}
            {selectedTeacher.status === "paused" && (
              <Button size="sm" onClick={() => updateStatus(selectedTeacher.id, "approved")} className="rounded-full bg-green-600 hover:bg-green-700">
                <Check size={14} /> Reactivate
              </Button>
            )}
            {selectedTeacher.status === "rejected" && (
              <Button size="sm" onClick={() => updateStatus(selectedTeacher.id, "approved")} className="rounded-full bg-green-600 hover:bg-green-700">
                <Check size={14} /> Approve
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => removeTeacher(selectedTeacher.id)} className="rounded-full">
              <Trash2 size={14} /> Remove Permanently
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Teacher Accounts</h3>
        <span className="text-xs text-muted-foreground">{teachers.length} total</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["all", "pending", "approved", "paused", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-1 opacity-70">({teachers.filter((t) => t.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No teachers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeachers.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => setSelectedTeacher(teacher)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                {teacher.avatar_url ? (
                  <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {teacher.first_name} {teacher.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                <p className="text-[10px] text-muted-foreground">{teacher.class_teacher}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${statusColors[teacher.status] || "bg-muted"}`}>
                {teacher.status.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeacherAccounts;
