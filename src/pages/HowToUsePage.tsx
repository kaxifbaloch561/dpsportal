import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, BookOpen, FileText, MessageSquare, Sparkles, AlertTriangle, Lightbulb, Mail, Bot, Megaphone, MessagesSquare, UserCircle2, ClipboardList, Download, Mic, Image, Shield, CheckCheck, Search } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Select Your Class",
    gradient: "from-violet-500 to-indigo-600",
    glow: "violet",
    details: [
      "Dashboard se apni class ka card tap karein (Class 6, 7, 8…)",
      "Har class ke andar alag alag subjects available hain",
      "Cards colorful gradient design mein hain — aasani se identify karein",
    ],
  },
  {
    icon: BookOpen,
    title: "Browse Subjects & Chapters",
    gradient: "from-emerald-500 to-teal-600",
    glow: "emerald",
    details: [
      "Class select karne ke baad apna subject choose karein",
      "Har subject ke andar chapters ki list milegi",
      "Chapter tap karein aur detailed content padhein",
    ],
  },
  {
    icon: FileText,
    title: "Exercises & Practice",
    gradient: "from-orange-500 to-red-500",
    glow: "orange",
    details: [
      "Har chapter mein multiple exercise types hain",
      "Long Questions, Short Questions, MCQs, Fill in the Blanks, True/False",
      "Answers ke sath practice karein aur khud ko test karein",
    ],
  },
  {
    icon: Bot,
    title: "AI Teacher Chatbot",
    gradient: "from-cyan-500 to-blue-600",
    glow: "cyan",
    details: [
      "Har subject mein AI Teacher Assistant chatbot available hai",
      "Syllabus se related koi bhi sawaal puchhein",
      "Instant, intelligent answers milte hain real-time mein",
    ],
  },
  {
    icon: ClipboardList,
    title: "Make a Paper",
    gradient: "from-pink-500 to-rose-600",
    glow: "pink",
    details: [
      "Automatic question paper generate karein",
      "Random ya Manual mode choose karein",
      "Chapters aur question types select karein, phir PDF download karein",
    ],
  },
  {
    icon: Mail,
    title: "Inbox & Messaging",
    gradient: "from-blue-500 to-indigo-600",
    glow: "blue",
    details: [
      "WhatsApp-style modern messenger built-in hai",
      "Teachers, Admin, aur Principal ko directly message karein",
      "Images, documents, aur voice messages bhi bhej sakte hain",
      "3-state checkmarks: ✓ Sent, ✓✓ Delivered, ✓✓ Read (blue)",
    ],
  },
  {
    icon: Megaphone,
    title: "Announcements",
    gradient: "from-amber-500 to-yellow-500",
    glow: "amber",
    details: [
      "Admin aur Principal ki announcements yahan dikhti hain",
      "Important updates aur notices real-time mein milte hain",
      "Badge count se pata chalta hai kitni nayi announcements hain",
    ],
  },
  {
    icon: MessagesSquare,
    title: "Discussion Room",
    gradient: "from-purple-500 to-fuchsia-600",
    glow: "purple",
    details: [
      "Sab teachers ke liye open group discussion room",
      "Ideas, resources, aur knowledge share karein",
      "Real-time chat with reply support",
    ],
  },
  {
    icon: Sparkles,
    title: "Ask for Features",
    gradient: "from-indigo-500 to-violet-600",
    glow: "indigo",
    details: [
      "Koi nayi feature chahiye? Direct request bhejein",
      "Admin ko instantly notification milta hai",
      "Aapki request track hoti hai aur reply bhi milta hai",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Report a Problem",
    gradient: "from-red-500 to-orange-600",
    glow: "red",
    details: [
      "Koi issue ya bug face ho raha hai? Report karein",
      "Problem describe karein aur submit karein",
      "Admin team jaldi se resolve karti hai",
    ],
  },
  {
    icon: Lightbulb,
    title: "Suggestions",
    gradient: "from-teal-500 to-green-600",
    glow: "teal",
    details: [
      "App ko behtar banane ke liye ideas share karein",
      "Dashboard se suggestion submit karein",
      "Aapki feedback valuable hai — hum suntay hain!",
    ],
  },
  {
    icon: UserCircle2,
    title: "Teacher Profile",
    gradient: "from-slate-500 to-gray-700",
    glow: "slate",
    details: [
      "Apna profile dekhen aur manage karein",
      "Avatar choose karein ya customize karein",
      "Account details aur assigned subjects yahan dikhte hain",
    ],
  },
];

const HowToUsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-primary/3 blur-[110px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              How to Use This App
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              Complete guide to all features & tools
            </p>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-6 sm:pb-10 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4"
          style={{ animation: "slideDown 0.6s ease forwards" }}
        >
          <Search size={13} />
          COMPLETE GUIDE
        </div>
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight"
          style={{ animation: "slideUp 0.7s ease forwards 0.1s", opacity: 0 }}
        >
          Master Every Feature <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Like a Pro
          </span>
        </h2>
        <p
          className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          style={{ animation: "slideUp 0.7s ease forwards 0.25s", opacity: 0 }}
        >
          Yeh guide aapko har feature step-by-step samjhayega. Neeche scroll karein aur explore karein!
        </p>
      </section>

      {/* Feature sections */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid gap-5 sm:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                style={{
                  animation: `slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.3 + i * 0.06}s`,
                  opacity: 0,
                }}
              >
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />

                <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Icon */}
                  <div className="shrink-0">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                    >
                      <Icon size={26} className="text-white drop-shadow-md" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground mb-2 tracking-tight">
                      {feature.title}
                    </h3>
                    <ul className="space-y-2">
                      {feature.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feature.gradient} mt-1.5 shrink-0`} />
                          <span className="text-sm text-muted-foreground leading-relaxed">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer credit */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 text-center">
        <div className="inline-flex flex-col items-center gap-1 px-8 py-5 rounded-2xl bg-card border border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Developed by</span>
          <span className="text-lg font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Kaxif Gull
          </span>
          <span className="text-xs text-muted-foreground font-semibold tracking-wide">DPS SIBI</span>
        </div>
      </footer>
    </div>
  );
};

export default HowToUsePage;
