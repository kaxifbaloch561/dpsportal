import { useState, useMemo } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AvatarSelector from "@/components/AvatarSelector";

const ALL_SUBJECTS = [
  "English", "Mathematics", "اردو", "اسلامیات",
  "General Science", "Science", "Computer", "Pakistan Studies",
];
const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);

interface Props {
  onBack: () => void;
  onCreated: () => void;
}

const AdminCreateTeacher = ({ onBack, onCreated }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarType, setAvatarType] = useState<"avatar" | "photo">("avatar");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const generatedEmail = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return "";
    const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, "");
    return `tutori${clean(firstName)}${clean(middleName)}${clean(lastName)}@dps.portal`;
  }, [firstName, middleName, lastName]);

  const handleSubmit = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) return setError("First and last name required");
    if (!classTeacher) return setError("Select a class");
    if (!password || password.length < 4) return setError("Password must be at least 4 characters");
    if (selectedSubjects.length === 0) return setError("Select at least one subject");

    setSubmitting(true);

    // Check for duplicate email and increment if needed
    let finalEmail = generatedEmail;
    const { data: existing } = await supabase
      .from("teacher_accounts")
      .select("email")
      .ilike("email", `${generatedEmail.split("@")[0]}%@dps.portal`);

    if (existing && existing.length > 0) {
      const taken = new Set(existing.map((e) => e.email));
      if (taken.has(finalEmail)) {
        let counter = 2;
        while (taken.has(`${generatedEmail.split("@")[0]}${counter}@dps.portal`)) counter++;
        finalEmail = `${generatedEmail.split("@")[0]}${counter}@dps.portal`;
      }
    }

    const { error: dbError } = await supabase.from("teacher_accounts").insert({
      first_name: firstName.trim(),
      middle_name: middleName.trim() || null,
      last_name: lastName.trim(),
      email: finalEmail,
      password,
      class_teacher: classTeacher,
      subjects: selectedSubjects,
      avatar_url: avatarUrl || null,
      avatar_type: avatarType,
      status: "approved",
      status_notification: "🎉 Your account was created by admin. Welcome to DPS Portal!",
    } as any);

    setSubmitting(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      toast({ title: "Account Created", description: `${firstName} ${lastName} — ${finalEmail}` });
      onCreated();
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary text-sm";

  return (
    <div className="px-6 pb-6" style={{ animation: "slideUp 0.4s ease forwards" }}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-primary font-semibold mb-4 hover:underline">
        <ArrowLeft size={16} /> Back to Teachers List
      </button>

      <div className="bg-card rounded-3xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-foreground">Create Teacher Account</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name *</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Middle Name</label>
            <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name *</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputClass} />
          </div>
        </div>

        {generatedEmail && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground">Generated Email</p>
            <p className="text-sm font-bold text-primary">{generatedEmail}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Password *</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set password" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Class Teacher *</label>
            <select value={classTeacher} onChange={(e) => setClassTeacher(e.target.value)} className={inputClass}>
              <option value="">Select class</option>
              {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Subjects *</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SUBJECTS.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubjects((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub])}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedSubjects.includes(sub)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Avatar</label>
          <AvatarSelector value={avatarUrl} onChange={(url, type) => { setAvatarUrl(url); setAvatarType(type); }} />
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full rounded-full">
          <UserPlus size={16} />
          {submitting ? "Creating..." : "Create Account (Auto-Approved)"}
        </Button>
      </div>
    </div>
  );
};

export default AdminCreateTeacher;
