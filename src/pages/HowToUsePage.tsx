import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, BookOpen, FileText, Sparkles, AlertTriangle, Mail, Bot, Megaphone, MessagesSquare, UserCircle2, ClipboardList, Search, CheckCheck, Image, Mic, FileDown, Shield } from "lucide-react";

const features = [
{
  icon: GraduationCap,
  title: "Select Your Class",
  gradient: "from-violet-500 to-indigo-600",
  details: [
  "From the main dashboard, you will see colorful class cards (e.g., Class 6, Class 7, Class 8, etc.).",
  "Tap on any class card to enter that class and view all the subjects available for it.",
  "Each class card displays the number of subjects inside, so you can quickly see how much content is available.",
  "The class selection is the starting point for all academic content — chapters, exercises, and the AI chatbot."]

},
{
  icon: BookOpen,
  title: "Browse Subjects & Chapters",
  gradient: "from-emerald-500 to-teal-600",
  details: [
  "After selecting a class, you will see a list of all subjects offered for that class (e.g., English, Math, Science, Urdu, etc.).",
  "Tap on any subject to open the chapter listing. Each chapter shows the chapter number and title.",
  "Open a chapter to read the full content — the text is formatted with headings, paragraphs, and highlighted key points for easy reading.",
  "You can navigate between chapters seamlessly using the back button or the breadcrumb navigation at the top."]

},
{
  icon: FileText,
  title: "Exercises & Practice",
  gradient: "from-orange-500 to-red-500",
  details: [
  "Every chapter includes multiple types of exercises to help you practice and test your understanding.",
  "Exercise types include: Long Questions, Short Questions, Multiple Choice Questions (MCQs), Fill in the Blanks, and True/False.",
  "Each question is displayed clearly, and you can reveal the correct answer by tapping on it.",
  "Use exercises to prepare for exams, review key concepts, and strengthen your understanding of each chapter.",
  "Exercises are organized by chapter, so you can focus on the specific topics you need to study."]

},
{
  icon: Bot,
  title: "AI Teacher Chatbot",
  gradient: "from-cyan-500 to-blue-600",
  details: [
  "Each subject has a built-in AI Teacher Assistant chatbot that you can access from the subject options page.",
  "Ask any question related to the syllabus, and the chatbot will provide an instant, intelligent answer.",
  "The chatbot understands context — you can ask follow-up questions and have a natural conversation.",
  "It is designed to help you understand concepts better, clarify doubts, and get quick explanations without waiting for a teacher.",
  "All conversations are based on the curriculum content, ensuring accurate and relevant answers."]

},
{
  icon: ClipboardList,
  title: "Make a Paper (Question Paper Generator)",
  gradient: "from-pink-500 to-rose-600",
  details: [
  "The 'Make a Paper' feature allows you to generate custom question papers automatically.",
  "Choose between Random Mode (the system picks questions for you) or Manual Mode (you select specific questions).",
  "Select the chapters you want to include, choose question types (MCQs, short questions, long questions, etc.), and set the quantity.",
  "Once generated, you can preview the paper and download it as a PDF — ready to print and use for tests or practice.",
  "This is an extremely powerful tool for teachers who need to quickly create exams or practice sheets."]

},
{
  icon: Mail,
  title: "Inbox & Messaging System",
  gradient: "from-blue-500 to-indigo-600",
  details: [
  "The Inbox is a WhatsApp-style modern messenger built directly into the app for seamless communication.",
  "You can send and receive messages from other teachers, the Admin, and the Principal — all in one place.",
  "The messaging system supports multimedia: send images, documents (PDF, DOC, etc.), and voice recordings.",
  "Messages have a 3-state delivery tracking system with checkmarks:",
  "  ✓  Single grey check — Message has been sent to the server.",
  "  ✓✓  Double grey checks — Message has been delivered to the recipient (they are online).",
  "  ✓✓  Double blue checks — Message has been read/seen by the recipient.",
  "Your full chat history is saved and available every time you open the inbox — no messages are ever lost.",
  "You can start a new conversation with any approved teacher by tapping the new chat button and selecting a contact."]

},
{
  icon: Megaphone,
  title: "Announcements",
  gradient: "from-amber-500 to-yellow-500",
  details: [
  "Stay updated with the latest announcements from the Admin and Principal.",
  "Announcements appear on your dashboard with a badge count showing how many new announcements are available.",
  "Tap the Announcements button to view all active announcements with their titles, messages, and posting dates.",
  "Announcements can have expiry dates — once expired, they are automatically removed from the active list.",
  "This is the primary channel for important school-wide notices, schedule changes, and updates."]

},
{
  icon: MessagesSquare,
  title: "Discussion Room",
  gradient: "from-purple-500 to-fuchsia-600",
  details: [
  "The Discussion Room is an open group chat where all teachers can communicate and collaborate.",
  "Share ideas, teaching resources, strategies, and general knowledge with your colleagues.",
  "The chat supports real-time messaging — messages appear instantly for all participants.",
  "You can reply to specific messages to keep conversations organized and easy to follow.",
  "This is a great space for professional collaboration and building a supportive teaching community."]

},
{
  icon: Sparkles,
  title: "Ask for Features",
  gradient: "from-indigo-500 to-violet-600",
  details: [
  "Have an idea for a new feature? Use the 'Ask for Features' button on the dashboard to submit your request.",
  "Write a clear description of what you'd like to see added or improved in the app.",
  "Your request is sent directly to the Admin, who will review it and respond.",
  "You can track your submitted requests and see the Admin's replies in your inbox.",
  "Your feedback helps shape the future of this app — every suggestion matters!"]

},
{
  icon: AlertTriangle,
  title: "Report a Problem",
  gradient: "from-red-500 to-orange-600",
  details: [
  "If you encounter any bug, error, or issue while using the app, use the 'Report a Problem' button.",
  "Describe the problem clearly — include what you were trying to do, what happened, and what you expected.",
  "Your report is sent directly to the Admin team, who will investigate and fix the issue as soon as possible.",
  "Reporting problems helps us maintain a smooth and reliable experience for everyone."]

},
{
  icon: UserCircle2,
  title: "Teacher Profile",
  gradient: "from-slate-500 to-gray-700",
  details: [
  "Access your personal profile by tapping the 'Profile' button in the top-right corner of the dashboard.",
  "View your account details including your name, email, assigned subjects, and class teacher designation.",
  "Choose and customize your avatar from a selection of preset avatars to personalize your profile.",
  "Your profile information is managed by the Admin — contact them if you need any changes to your account."]

},
{
  icon: Shield,
  title: "Security & Privacy",
  gradient: "from-green-600 to-emerald-700",
  details: [
  "Your account is protected with secure login credentials provided by the Admin.",
  "All messages and data are stored securely in the cloud with encryption.",
  "Only approved and active teacher accounts can access the portal — suspended accounts are automatically blocked.",
  "Your chat history and personal data are private and only visible to you and the intended recipients."]

}];


const HowToUsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-primary/3 blur-[110px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-95">
            
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              How to Use This App
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              A complete guide to every feature & tool
            </p>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-6 sm:pb-10 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4"
          style={{ animation: "slideDown 0.6s ease forwards" }}>
          
          <Search size={13} />
          COMPLETE GUIDE
        </div>
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight"
          style={{ animation: "slideUp 0.7s ease forwards 0.1s", opacity: 0 }}>
          
          Master Every Feature <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Like a Pro
          </span>
        </h2>
        <p
          className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          style={{ animation: "slideUp 0.7s ease forwards 0.25s", opacity: 0 }}>
          
          This guide walks you through every feature of the DPS Teacher Portal step by step.
          Scroll down to explore all the tools and capabilities available to you.
        </p>
      </section>

      {/* Quick stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ animation: "slideUp 0.7s ease forwards 0.35s", opacity: 0 }}>
          
          {[
          { label: "Features", value: `${features.length}+`, color: "from-primary to-primary" },
          { label: "Exercise Types", value: "5", color: "from-orange-500 to-red-500" },
          { label: "Communication Tools", value: "3", color: "from-blue-500 to-indigo-600" },
          { label: "AI Powered", value: "Yes", color: "from-cyan-500 to-blue-600" }].
          map((stat, i) =>
          <div key={i} className="relative rounded-2xl border border-border/60 bg-card p-4 text-center overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature sections */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid gap-5 sm:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group relative rounded-3xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                style={{
                  animation: `slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.4 + i * 0.06}s`,
                  opacity: 0
                }}>
                
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />

                <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Icon + number */}
                  <div className="shrink-0 flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        
                        <Icon size={26} className="text-white drop-shadow-md" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <ul className="space-y-2.5">
                      {feature.details.map((detail, j) =>
                      <li key={j} className="flex items-start gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feature.gradient} mt-[7px] shrink-0`} />
                          <span className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                            {detail}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>);

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
          <span className="text-xs text-muted-foreground font-semibold tracking-wide">​</span>
        </div>
      </footer>
    </div>);

};

export default HowToUsePage;