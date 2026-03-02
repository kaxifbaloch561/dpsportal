import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";

const typeConfig = {
  feature: { icon: Sparkles, label: "Ask for a Feature", color: "hsl(235,78%,62%)", placeholder: "Describe the feature you'd like..." },
  problem: { icon: AlertTriangle, label: "Report a Problem", color: "hsl(0,72%,55%)", placeholder: "Describe the problem you're facing..." },
  suggestion: { icon: Lightbulb, label: "Submit a Suggestion", color: "hsl(45,90%,50%)", placeholder: "Share your suggestion..." },
};

interface Props {
  type: "feature" | "problem" | "suggestion";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeacherRequestForm = ({ type, open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("teacher_requests").insert({
      type,
      subject: subject.trim(),
      message: message.trim(),
      teacher_email: user?.email || "unknown",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Submitted successfully!", description: "Admin will be notified instantly." });
      setSubject("");
      setMessage("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: config.color + "22", color: config.color }}>
              <Icon size={18} />
            </div>
            {config.label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
            <Input
              placeholder="Brief title..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Details</label>
            <Textarea
              placeholder={config.placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl min-h-[120px]"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full"
            style={{ background: config.color }}
          >
            <Send size={16} /> {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherRequestForm;
