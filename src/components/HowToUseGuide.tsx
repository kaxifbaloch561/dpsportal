import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, GraduationCap, MessageSquare, FileText, Sparkles, AlertTriangle, Lightbulb, Info } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  {
    icon: GraduationCap,
    title: "Select Your Class",
    desc: "From the dashboard, tap on any class card (e.g., Class 6, Class 7) to view available subjects for that class.",
  },
  {
    icon: BookOpen,
    title: "Browse Subjects & Chapters",
    desc: "After selecting a class, choose a subject. You can then browse chapters, read content, and access exercises.",
  },
  {
    icon: FileText,
    title: "Exercises & Questions",
    desc: "Each chapter has different exercise types — Long Questions, Short Questions, MCQs, Fill in the Blanks, and True/False. Practice and review answers.",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    desc: "Use the AI Teacher Assistant chatbot available in each subject. Ask questions about the syllabus and get instant answers.",
  },
  {
    icon: FileText,
    title: "Make a Paper",
    desc: "Generate question papers automatically! Choose random or manual mode, select chapters and question types, then download as PDF.",
  },
  {
    icon: Sparkles,
    title: "Ask for Features",
    desc: "Want something new? Use the 'Ask for Features' button on the dashboard to request new features directly from the admin.",
  },
  {
    icon: AlertTriangle,
    title: "Report a Problem",
    desc: "Facing any issue? Click 'Report a Problem' to describe it. The admin will be notified instantly.",
  },
  {
    icon: Lightbulb,
    title: "Suggestions",
    desc: "Have ideas to improve the app? Submit suggestions through the 'Suggestions' button on the dashboard.",
  },
];

const HowToUseGuide = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <Info size={18} />
            </div>
            How to Use This Web App
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}

          {/* Developer credit */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">Developed by</p>
            <p className="text-sm font-bold text-primary mt-0.5">Kaxif Gull</p>
            <p className="text-xs text-muted-foreground mt-1">DPS SIBI — Learning is Light</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToUseGuide;
