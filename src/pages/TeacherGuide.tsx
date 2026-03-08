import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, PenLine, Camera, BookOpen, Send, Clock, CheckCircle2, XCircle, Bell, Shield, Sparkles, ChevronRight } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

const steps = [
  {
    icon: UserPlus,
    color: "hsl(235,78%,58%)",
    titleEn: "Go to Create Account",
    titleUr: "اکاؤنٹ بنائیں پر جائیں",
    descEn: "On the Login page, tap the \"Create Teacher Account\" button at the bottom to start the registration process.",
    descUr: "لاگ ان پیج پر نیچے \"Create Teacher Account\" بٹن دبائیں تاکہ رجسٹریشن شروع ہو۔",
  },
  {
    icon: PenLine,
    color: "hsl(340,80%,55%)",
    titleEn: "Fill in Your Details (Step 1)",
    titleUr: "اپنی معلومات بھریں (مرحلہ 1)",
    descEn: "Enter your First Name, Middle Name (optional), and Last Name. Your email will be auto-generated like tutorkashifgul@dps.portal. Select the class you teach (Class 1–10). Create a password (minimum 6 characters) and confirm it. Then tap \"Next\".",
    descUr: "اپنا پہلا نام، درمیانی نام (اختیاری)، اور آخری نام لکھیں۔ آپ کی ای میل خودکار بنے گی جیسے tutorkashifgul@dps.portal۔ اپنی کلاس منتخب کریں (کلاس 1 سے 10)۔ پاسورڈ بنائیں (کم از کم 6 حروف) اور دوبارہ لکھیں۔ پھر \"Next\" دبائیں۔",
  },
  {
    icon: Camera,
    color: "hsl(270,72%,55%)",
    titleEn: "Choose Your Avatar (Step 2)",
    titleUr: "اپنا اوتار منتخب کریں (مرحلہ 2)",
    descEn: "Pick a profile picture: select one from the ready-made avatars, take a photo with your camera, or upload an image from your gallery. Then tap \"Next\".",
    descUr: "اپنی پروفائل تصویر لگائیں: بنے بنائے اوتاروں میں سے ایک منتخب کریں، کیمرے سے تصویر لیں، یا اپنی گیلری سے تصویر اپ لوڈ کریں۔ پھر \"Next\" دبائیں۔",
  },
  {
    icon: BookOpen,
    color: "hsl(160,60%,38%)",
    titleEn: "Select Your Subjects (Step 3)",
    titleUr: "اپنے مضامین منتخب کریں (مرحلہ 3)",
    descEn: "Choose one or more subjects you teach — English, Mathematics, اردو, اسلامیات, Science, Computer, General Science, Pakistan Studies. Tap each subject to select/deselect. Then tap \"Submit\".",
    descUr: "ایک یا زیادہ مضامین منتخب کریں جو آپ پڑھاتے ہیں — انگریزی، ریاضی، اردو، اسلامیات، سائنس، کمپیوٹر، جنرل سائنس، پاکستان اسٹڈیز۔ ہر مضمون پر ٹیپ کریں۔ پھر \"Submit\" دبائیں۔",
  },
  {
    icon: Send,
    color: "hsl(200,85%,50%)",
    titleEn: "Submit Your Registration",
    titleUr: "اپنی رجسٹریشن جمع کروائیں",
    descEn: "After submitting, you'll see a confirmation screen with your auto-generated email. Save this email — you'll need it to log in! Your account status will be \"Pending\" until the admin reviews it.",
    descUr: "جمع کروانے کے بعد آپ کو تصدیقی اسکرین نظر آئے گی جس میں آپ کی خودکار ای میل ہوگی۔ یہ ای میل محفوظ کریں — لاگ ان کے لیے ضرورت ہوگی! آپ کا اکاؤنٹ \"زیرِ غور\" ہوگا جب تک ایڈمن جائزہ نہ لے۔",
  },
  {
    icon: Clock,
    color: "hsl(45,95%,45%)",
    titleEn: "Wait for Admin Approval",
    titleUr: "ایڈمن کی منظوری کا انتظار کریں",
    descEn: "The school admin will review your registration. This may take some time. Please be patient while your account is being reviewed.",
    descUr: "اسکول کا ایڈمن آپ کی رجسٹریشن کا جائزہ لے گا۔ اس میں کچھ وقت لگ سکتا ہے۔ براہ کرم صبر کریں جب تک آپ کے اکاؤنٹ کا جائزہ لیا جا رہا ہے۔",
  },
];

const statusCards = [
  {
    icon: CheckCircle2,
    color: "hsl(145,72%,46%)",
    bg: "hsl(145,72%,46%,0.08)",
    border: "hsl(145,72%,46%,0.2)",
    titleEn: "✅ Approved — Account Active!",
    titleUr: "✅ منظور — اکاؤنٹ فعال!",
    descEn: "When your account is approved, you can log in with your auto-generated email and password. You'll have full access to the teacher dashboard, subjects, and discussion room.",
    descUr: "جب آپ کا اکاؤنٹ منظور ہو جائے تو اپنی خودکار ای میل اور پاسورڈ سے لاگ ان کریں۔ آپ کو ٹیچر ڈیش بورڈ، مضامین، اور ڈسکشن روم تک مکمل رسائی ملے گی۔",
  },
  {
    icon: XCircle,
    color: "hsl(0,75%,55%)",
    bg: "hsl(0,75%,55%,0.08)",
    border: "hsl(0,75%,55%,0.2)",
    titleEn: "❌ Rejected — Account Not Approved",
    titleUr: "❌ مسترد — اکاؤنٹ منظور نہیں ہوا",
    descEn: "If your account is rejected, you'll see a notification banner when you try to log in explaining the reason. You may contact the admin or re-register with correct information.",
    descUr: "اگر آپ کا اکاؤنٹ مسترد ہو جائے تو لاگ ان کرنے پر آپ کو ایک اطلاعی بینر نظر آئے گا جس میں وجہ بتائی جائے گی۔ آپ ایڈمن سے رابطہ کر سکتے ہیں یا صحیح معلومات سے دوبارہ رجسٹر کر سکتے ہیں۔",
  },
  {
    icon: Bell,
    color: "hsl(35,90%,50%)",
    bg: "hsl(35,90%,50%,0.08)",
    border: "hsl(35,90%,50%,0.2)",
    titleEn: "⏸️ Paused — Account Temporarily Suspended",
    titleUr: "⏸️ معطل — اکاؤنٹ عارضی طور پر بند",
    descEn: "If your account is paused by the admin, you'll see a notification when trying to log in. Your access is temporarily restricted. Contact the admin for more details.",
    descUr: "اگر ایڈمن نے آپ کا اکاؤنٹ روک دیا ہے تو لاگ ان پر اطلاع نظر آئے گی۔ آپ کی رسائی عارضی طور پر محدود ہے۔ مزید تفصیلات کے لیے ایڈمن سے رابطہ کریں۔",
  },
];

const TeacherGuide = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs */}
      <div className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-40 hidden sm:block" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
      <div className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-40 hidden sm:block" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-5 transition-colors backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/15"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        {/* Header Card */}
        <div
          className="bg-card/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 mb-6 text-center relative overflow-hidden"
          style={{
            boxShadow: "0 30px 60px rgba(0,0,0,0.15), inset 0 0 0 1.5px rgba(255,255,255,0.4)",
            animation: "containerSpring 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

          <img src={schoolLogo} alt="DPS SIBI" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3" style={{ animation: "slideDown 0.6s ease forwards 0.2s", opacity: 0 }} />
          
          <div style={{ animation: "slideUp 0.6s ease forwards 0.3s", opacity: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold mb-3">
              <Sparkles size={11} /> COMPLETE GUIDE
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight mb-1">
              How to Create a Teacher Account
            </h1>
            <p className="font-urdu text-base sm:text-lg font-bold text-foreground/80 leading-relaxed" dir="rtl">
              ٹیچر اکاؤنٹ کیسے بنائیں
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Divisional Public School, SIBI — DPS Portal
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="bg-card/95 backdrop-blur-xl rounded-[22px] p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  boxShadow: "0 12px 32px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.35)",
                  animation: `slideUp 0.6s ease forwards ${0.3 + i * 0.08}s`,
                  opacity: 0,
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${step.color}40, transparent)` }} />

                {/* Step number + icon */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg relative"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}
                    >
                      <Icon size={22} className="text-white" />
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-card border-2 border-card flex items-center justify-center shadow">
                        <span className="text-[10px] font-black text-foreground">{i + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-0.5 flex items-center gap-2">
                      {step.titleEn}
                    </h3>
                    <p className="font-urdu text-sm font-semibold text-primary/80 mb-2.5" dir="rtl">{step.titleUr}</p>
                    
                    {/* English description */}
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed mb-2">
                      {step.descEn}
                    </p>
                    {/* Urdu description */}
                    <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
                      <p className="font-urdu text-xs sm:text-sm text-foreground/75 leading-[2] text-right" dir="rtl">
                        {step.descUr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connector line to next step */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-4 left-9 sm:left-10 w-0.5 h-4 bg-border/50" />
                )}
              </div>
            );
          })}
        </div>

        {/* What Happens After? Section */}
        <div
          className="bg-card/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 mb-6 relative overflow-hidden"
          style={{
            boxShadow: "0 20px 50px rgba(0,0,0,0.1), inset 0 0 0 1.5px rgba(255,255,255,0.35)",
            animation: `slideUp 0.6s ease forwards ${0.3 + steps.length * 0.08 + 0.1}s`,
            opacity: 0,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-[10px] font-bold mb-2">
              <Shield size={11} /> ACCOUNT STATUS
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground">What Happens After Registration?</h2>
            <p className="font-urdu text-sm sm:text-base font-bold text-foreground/70 mt-0.5" dir="rtl">رجسٹریشن کے بعد کیا ہوگا؟</p>
          </div>

          <div className="space-y-3">
            {statusCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 border transition-all"
                  style={{ background: card.bg, borderColor: card.border }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: `${card.color}` }}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground mb-0.5">{card.titleEn}</h4>
                      <p className="font-urdu text-xs font-semibold text-foreground/60 mb-2" dir="rtl">{card.titleUr}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{card.descEn}</p>
                      <p className="font-urdu text-xs text-foreground/60 leading-[2] text-right" dir="rtl">{card.descUr}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div
          className="bg-card/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 mb-6 relative overflow-hidden"
          style={{
            boxShadow: "0 20px 50px rgba(0,0,0,0.1), inset 0 0 0 1.5px rgba(255,255,255,0.35)",
            animation: `slideUp 0.6s ease forwards ${0.3 + steps.length * 0.08 + 0.2}s`,
            opacity: 0,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="text-center mb-4">
            <h2 className="text-lg font-extrabold text-foreground">📌 Important Notes</h2>
            <p className="font-urdu text-sm font-bold text-foreground/70 mt-0.5" dir="rtl">📌 اہم ہدایات</p>
          </div>

          <div className="space-y-3">
            {[
              {
                en: "Your email is auto-generated from your name. Always remember it for login.",
                ur: "آپ کی ای میل آپ کے نام سے خودکار بنتی ہے۔ لاگ ان کے لیے اسے ہمیشہ یاد رکھیں۔",
              },
              {
                en: "If someone with the same name already registered, a number will be added to your email (e.g. tutorkashifgul2@dps.portal).",
                ur: "اگر آپ کے نام سے پہلے کوئی رجسٹرڈ ہے تو آپ کی ای میل میں نمبر شامل ہوگا (مثلاً tutorkashifgul2@dps.portal)۔",
              },
              {
                en: "You can change your password later from your Teacher Profile after logging in.",
                ur: "لاگ ان کے بعد اپنے ٹیچر پروفائل سے آپ پاسورڈ تبدیل کر سکتے ہیں۔",
              },
              {
                en: "Only the school admin can approve, reject, or pause your account.",
                ur: "صرف اسکول کا ایڈمن آپ کا اکاؤنٹ منظور، مسترد، یا معطل کر سکتا ہے۔",
              },
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/30">
                <ChevronRight size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-[13px] text-foreground font-medium leading-relaxed">{note.en}</p>
                  <p className="font-urdu text-xs text-foreground/60 leading-[2] text-right mt-1" dir="rtl">{note.ur}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center pb-8" style={{ animation: `slideUp 0.6s ease forwards ${0.3 + steps.length * 0.08 + 0.3}s`, opacity: 0 }}>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-foreground font-bold text-sm shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
          >
            <UserPlus size={16} />
            Go to Registration Page
            <span
              className="absolute top-0 w-1/2 h-full"
              style={{
                background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0))",
                transform: "skewX(-25deg)",
                animation: "shine 4s infinite",
              }}
            />
          </button>
          <p className="font-urdu text-sm text-white/70 mt-3 font-semibold" dir="rtl">رجسٹریشن پیج پر جائیں</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherGuide;
