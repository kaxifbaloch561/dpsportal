import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AvatarSelector from "./AvatarSelector";
import schoolLogo from "@/assets/school-logo.png";
import { toast } from "@/hooks/use-toast";

const ALL_SUBJECTS = [
  "English", "Mathematics", "اردو", "اسلامیات",
  "General Science", "Science", "Computer",
  "Pakistan Studies",
];

const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);

type Step = "info" | "avatar" | "subjects" | "done";

const TeacherRegistration = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarType, setAvatarType] = useState<"avatar" | "photo">("avatar");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<"pending" | "rejected" | null>(null);

  const generatedEmail = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return "";
    const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, "");
    return `tutor${clean(firstName)}${clean(middleName)}${clean(lastName)}@dps.portal`;
  }, [firstName, middleName, lastName]);

  const handleInfoNext = () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }
    if (!classTeacher) {
      setError("Please select which class you teach");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setStep("avatar");
  };

  const handleAvatarNext = () => {
    if (!avatarUrl) {
      setError("Please select an avatar or upload a photo");
      return;
    }
    setError("");
    setStep("subjects");
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Check for duplicate email
      const { data: existing } = await supabase
        .from("teacher_accounts")
        .select("email")
        .eq("email", generatedEmail)
        .maybeSingle();

      let finalEmail = generatedEmail;
      if (existing) {
        // Add number suffix
        let counter = 2;
        while (true) {
          const candidateEmail = generatedEmail.replace("@dps.portal", `${counter}@dps.portal`);
          const { data: dup } = await supabase
            .from("teacher_accounts")
            .select("email")
            .eq("email", candidateEmail)
            .maybeSingle();
          if (!dup) {
            finalEmail = candidateEmail;
            break;
          }
          counter++;
          if (counter > 20) break;
        }
      }

      const { error: insertError } = await supabase.from("teacher_accounts").insert({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        last_name: lastName.trim(),
        email: finalEmail,
        password: password,
        class_teacher: classTeacher,
        avatar_url: avatarUrl,
        avatar_type: avatarType,
        subjects: selectedSubjects,
        status: "pending",
      });

      if (insertError) throw insertError;

      // Also send a notification to admin
      await supabase.from("teacher_requests").insert({
        teacher_email: finalEmail,
        type: "account_approval",
        subject: "New Teacher Account Registration",
        message: `${firstName} ${lastName} has registered as a teacher for ${classTeacher}. Subjects: ${selectedSubjects.join(", ")}. Please review and approve.`,
      });

      setStep("done");
      toast({
        title: "Registration Submitted!",
        description: `Your email is: ${finalEmail}. Waiting for admin approval.`,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-3 sm:p-5" style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}>
        <div className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 text-center" style={{
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
        }}>
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-2">
            Your account is pending admin approval.
          </p>
          <div className="bg-muted rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-muted-foreground mb-1">Your login email:</p>
            <p className="text-sm font-bold text-foreground break-all">{generatedEmail}</p>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            You will be able to login once the admin approves your account.
          </p>
          <Button onClick={onBack} className="w-full rounded-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-2 sm:p-5" style={{
      background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
      backgroundSize: "400% 400%",
      animation: "gradientBG 15s ease infinite",
    }}>
      <div className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-60 hidden sm:block" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
      <div className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-60 hidden sm:block" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />

      <div className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] p-5 sm:p-8 relative overflow-hidden max-h-[calc(100dvh-16px)] sm:max-h-none overflow-y-auto" style={{
        boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
        animation: "containerSpring 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      }}>
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <img src={schoolLogo} alt="DPS SIBI" className="w-16 h-16 mb-2" />
          <h1 className="text-xl font-bold text-foreground">Create Teacher Account</h1>
          <p className="text-muted-foreground text-xs">Divisional Public School, SIBI</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(["info", "avatar", "subjects"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? "bg-primary text-primary-foreground scale-110" :
                (["info", "avatar", "subjects"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-muted text-muted-foreground")
              }`}>
                {["info", "avatar", "subjects"].indexOf(step) > i ? <Check size={14} /> : i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-border" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Info */}
        {step === "info" && (
          <div className="space-y-3" style={{ animation: "slideUp 0.5s ease forwards" }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">First Name *</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Kaxif"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Middle Name</label>
                <input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Last Name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Gull"
                className="w-full px-3 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Auto-generated email */}
            {generatedEmail && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-[10px] text-muted-foreground mb-0.5">Your auto-generated email:</p>
                <p className="text-sm font-bold text-primary break-all">{generatedEmail}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Class Teacher *</label>
              <select
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground text-sm focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Select your class</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2.5 rounded-xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onBack} className="flex-1 rounded-full">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={handleInfoNext} className="flex-1 rounded-full">
                Next <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Avatar */}
        {step === "avatar" && (
          <div className="space-y-4" style={{ animation: "slideUp 0.5s ease forwards" }}>
            <AvatarSelector
              value={avatarUrl}
              onChange={(url, type) => {
                setAvatarUrl(url);
                setAvatarType(type);
              }}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("info")} className="flex-1 rounded-full">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={handleAvatarNext} className="flex-1 rounded-full">
                Next <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Subjects */}
        {step === "subjects" && (
          <div className="space-y-4" style={{ animation: "slideUp 0.5s ease forwards" }}>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Select Your Subjects</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_SUBJECTS.map((sub) => {
                  const selected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-muted text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedSubjects.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedSubjects.join(", ")}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("avatar")} className="flex-1 rounded-full">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-full">
                {submitting ? "Submitting..." : "Submit"} <Check size={14} />
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          DPS SIBI
        </p>
      </div>
    </div>
  );
};

export default TeacherRegistration;
