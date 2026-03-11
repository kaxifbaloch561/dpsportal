import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, PenLine, BookOpen, Send, Clock, CheckCircle2, XCircle, Bell, Shield, Sparkles, Info, ImageIcon } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

const steps = [
  {
    icon: UserPlus,
    color: "hsl(235,78%,58%)",
    titleEn: "Go to Create Account",
    titleUr: "اکاؤنٹ بنائیں پر جائیں",
    pointsEn: [
      "Open the DPS Portal Login page.",
      "Tap the \"Create Teacher Account\" button at the bottom.",
    ],
    pointsUr: [
      "DPS پورٹل کا لاگ ان پیج کھولیں۔",
      "نیچے \"Create Teacher Account\" بٹن دبائیں۔",
    ],
  },
  {
    icon: PenLine,
    color: "hsl(340,80%,55%)",
    titleEn: "Fill in Your Details",
    titleUr: "اپنی معلومات بھریں",
    pointsEn: [
      "Enter your First Name, Middle Name (optional), and Last Name.",
      "Your email will be auto-generated (e.g. tutorkashifgul@dps.portal).",
      "Select the class you teach (Class 1–10).",
      "Create a password (minimum 6 characters) and confirm it.",
      "Tap \"Next\" to continue.",
    ],
    pointsUr: [
      "اپنا پہلا نام، درمیانی نام (اختیاری)، اور آخری نام لکھیں۔",
      "آپ کی ای میل خودکار بنے گی (مثلاً tutorkashifgul@dps.portal)۔",
      "اپنی کلاس منتخب کریں (کلاس 1 سے 10)۔",
      "پاسورڈ بنائیں (کم از کم 6 حروف) اور دوبارہ لکھیں۔",
      "آگے بڑھنے کے لیے \"Next\" دبائیں۔",
    ],
  },
  {
    icon: ImageIcon,
    color: "hsl(270,72%,55%)",
    titleEn: "Choose Your Profile Picture",
    titleUr: "اپنی پروفائل تصویر لگائیں",
    pointsEn: [
      "Select one from ready-made avatars.",
      "Or take a photo with your camera.",
      "Or upload an image from your gallery.",
      "Tap \"Next\" to continue.",
    ],
    pointsUr: [
      "بنے بنائے اوتاروں میں سے ایک منتخب کریں۔",
      "یا کیمرے سے تصویر لیں۔",
      "یا اپنی گیلری سے تصویر اپ لوڈ کریں۔",
      "آگے بڑھنے کے لیے \"Next\" دبائیں۔",
    ],
  },
  {
    icon: BookOpen,
    color: "hsl(160,60%,38%)",
    titleEn: "Select Your Subjects",
    titleUr: "اپنے مضامین منتخب کریں",
    pointsEn: [
      "Choose the subjects you teach (e.g. English, Mathematics, اردو, Science).",
      "Tap each subject to select or deselect it.",
      "You can select multiple subjects.",
      "Tap \"Submit\" to finish registration.",
    ],
    pointsUr: [
      "وہ مضامین منتخب کریں جو آپ پڑھاتے ہیں (مثلاً انگریزی، ریاضی، اردو، سائنس)۔",
      "ہر مضمون پر ٹیپ کریں تاکہ منتخب یا غیر منتخب ہو۔",
      "آپ ایک سے زیادہ مضامین منتخب کر سکتے ہیں۔",
      "رجسٹریشن مکمل کرنے کے لیے \"Submit\" دبائیں۔",
    ],
  },
  {
    icon: Send,
    color: "hsl(200,85%,50%)",
    titleEn: "Registration Complete!",
    titleUr: "رجسٹریشن مکمل!",
    pointsEn: [
      "You'll see a confirmation screen with your email.",
      "Save your email — you need it to log in!",
      "Your account will be \"Pending\" until admin reviews it.",
    ],
    pointsUr: [
      "آپ کو تصدیقی اسکرین نظر آئے گی جس میں آپ کی ای میل ہوگی۔",
      "اپنی ای میل محفوظ کریں — لاگ ان کے لیے ضرورت ہوگی!",
      "آپ کا اکاؤنٹ \"زیرِ غور\" ہوگا جب تک ایڈمن جائزہ نہ لے۔",
    ],
  },
  {
    icon: Clock,
    color: "hsl(45,95%,45%)",
    titleEn: "Wait for Admin Approval",
    titleUr: "ایڈمن کی منظوری کا انتظار کریں",
    pointsEn: [
      "The school admin will review your registration.",
      "This may take some time — please be patient.",
    ],
    pointsUr: [
      "اسکول کا ایڈمن آپ کی رجسٹریشن کا جائزہ لے گا۔",
      "اس میں کچھ وقت لگ سکتا ہے — براہ کرم صبر کریں۔",
    ],
  },
];

const statusCards = [
  {
    icon: CheckCircle2,
    emoji: "✅",
    color: "hsl(145,72%,40%)",
    titleEn: "Approved — You Can Log In!",
    titleUr: "منظور — آپ لاگ ان کر سکتے ہیں!",
    descEn: "Log in with your email and password. Full access to dashboard, subjects & discussion room.",
    descUr: "اپنی ای میل اور پاسورڈ سے لاگ ان کریں۔ ڈیش بورڈ، مضامین اور ڈسکشن روم تک مکمل رسائی۔",
  },
  {
    icon: XCircle,
    emoji: "❌",
    color: "hsl(0,75%,50%)",
    titleEn: "Rejected — Not Approved",
    titleUr: "مسترد — منظور نہیں ہوا",
    descEn: "A notification will explain the reason when you try to log in. Contact admin or re-register.",
    descUr: "لاگ ان کرنے پر اطلاع میں وجہ بتائی جائے گی۔ ایڈمن سے رابطہ کریں یا دوبارہ رجسٹر کریں۔",
  },
  {
    icon: Bell,
    emoji: "⏸️",
    color: "hsl(35,90%,48%)",
    titleEn: "Paused — Temporarily Suspended",
    titleUr: "معطل — عارضی طور پر بند",
    descEn: "Your access is temporarily restricted. Contact the admin for details.",
    descUr: "آپ کی رسائی عارضی طور پر محدود ہے۔ تفصیلات کے لیے ایڈمن سے رابطہ کریں۔",
  },
];

const notes = [
  {
    en: "Your email is auto-generated from your name. Always remember it for login.",
    ur: "آپ کی ای میل آپ کے نام سے خودکار بنتی ہے۔ لاگ ان کے لیے اسے یاد رکھیں۔",
  },
  {
    en: "If someone with the same name already exists, a number will be added (e.g. tutorkashifgul2@dps.portal).",
    ur: "اگر آپ کے نام سے پہلے کوئی رجسٹرڈ ہے تو نمبر شامل ہوگا (مثلاً tutorkashifgul2@dps.portal)۔",
  },
  {
    en: "You can change your password later from your Teacher Profile.",
    ur: "آپ بعد میں اپنے ٹیچر پروفائل سے پاسورڈ تبدیل کر سکتے ہیں۔",
  },
  {
    en: "Only the school admin can approve, reject, or pause your account.",
    ur: "صرف اسکول کا ایڈمن آپ کا اکاؤنٹ منظور، مسترد، یا معطل کر سکتا ہے۔",
  },
];

const TeacherGuide = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs */}
      <div className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-40 hidden sm:block" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
      <div className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-40 hidden sm:block" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold mb-5 transition-all px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft size={15} /> Back to Login
        </button>

        {/* Hero Header */}
        <div
          className="bg-card/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 mb-6 text-center relative overflow-hidden"
          style={{
            boxShadow: "0 30px 60px rgba(0,0,0,0.12), inset 0 0 0 1.5px rgba(255,255,255,0.5)",
            animation: "containerSpring 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

          <img
            src={schoolLogo}
            alt="DPS SIBI"
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 drop-shadow-md"
            style={{ animation: "slideDown 0.6s ease forwards 0.2s", opacity: 0 }}
          />
          <div style={{ animation: "slideUp 0.6s ease forwards 0.3s", opacity: 0 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase mb-3 border border-primary/15">
              <Sparkles size={10} /> Step-by-Step Guide
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight mb-1">
              How to Create a Teacher Account
            </h1>
            <p className="font-urdu text-base sm:text-lg font-bold text-primary/80 leading-relaxed" dir="rtl">
              ٹیچر اکاؤنٹ کیسے بنائیں
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">Divisional Public School, SIBI</p>
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="relative mb-8">
          {/* Vertical timeline */}
          <div className="absolute left-[18px] sm:left-[22px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent rounded-full" />

          <div className="space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative pl-12 sm:pl-14"
                  style={{ animation: `slideUp 0.5s ease forwards ${0.3 + i * 0.07}s`, opacity: 0 }}
                >
                  {/* Timeline circle */}
                  <div
                    className="absolute left-0 sm:left-1 top-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg z-10 border-[3px] border-card"
                    style={{ background: step.color }}
                  >
                    <span className="text-[10px] font-black text-white">{i + 1}</span>
                  </div>

                  {/* Card */}
                  <div
                    className="bg-card/95 backdrop-blur-xl rounded-[22px] p-4 sm:p-5 relative overflow-hidden group"
                    style={{
                      boxShadow: "0 8px 28px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.45)",
                    }}
                  >
                    <div className="absolute top-0 left-5 right-5 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${step.color}30, transparent)` }} />

                    {/* Title */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: step.color }}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-[13px] sm:text-sm font-bold text-foreground leading-tight">{step.titleEn}</h3>
                        <p className="font-urdu text-xs font-semibold text-primary/70" dir="rtl">{step.titleUr}</p>
                      </div>
                    </div>

                    {/* English points */}
                    <ul className="space-y-1.5 mb-3">
                      {step.pointsEn.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: step.color, opacity: 0.6 }} />
                          {p}
                        </li>
                      ))}
                    </ul>

                    {/* Urdu points */}
                    <div className="rounded-xl p-3 bg-muted/50 border border-border/40">
                      <ul className="space-y-1" dir="rtl">
                        {step.pointsUr.map((p, j) => (
                          <li key={j} className="flex items-start gap-2 font-urdu text-xs text-foreground/60 leading-[2] text-right">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-3 bg-primary/30" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Status */}
        <div
          className="bg-card/95 backdrop-blur-xl rounded-[28px] p-5 sm:p-7 mb-6 relative overflow-hidden"
          style={{
            boxShadow: "0 20px 50px rgba(0,0,0,0.08), inset 0 0 0 1.5px rgba(255,255,255,0.45)",
            animation: `slideUp 0.5s ease forwards ${0.3 + steps.length * 0.07 + 0.05}s`,
            opacity: 0,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase mb-2 border border-primary/10">
              <Shield size={10} /> After Registration
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground">What Happens Next?</h2>
            <p className="font-urdu text-sm font-bold text-primary/60 mt-0.5" dir="rtl">رجسٹریشن کے بعد کیا ہوگا؟</p>
          </div>

          <div className="space-y-3">
            {statusCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 bg-muted/40 border border-border/40 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: card.color }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-foreground mb-0.5">{card.emoji} {card.titleEn}</h4>
                    <p className="font-urdu text-[11px] font-semibold text-primary/60 mb-2" dir="rtl">{card.titleUr}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-1">{card.descEn}</p>
                    <p className="font-urdu text-[11px] text-foreground/50 leading-[1.8] text-right" dir="rtl">{card.descUr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div
          className="bg-card/95 backdrop-blur-xl rounded-[28px] p-5 sm:p-7 mb-6 relative overflow-hidden"
          style={{
            boxShadow: "0 20px 50px rgba(0,0,0,0.08), inset 0 0 0 1.5px rgba(255,255,255,0.45)",
            animation: `slideUp 0.5s ease forwards ${0.3 + steps.length * 0.07 + 0.12}s`,
            opacity: 0,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Info size={14} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">Important Notes</h2>
              <p className="font-urdu text-xs font-bold text-primary/60" dir="rtl">اہم ہدایات</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {notes.map((note, i) => (
              <div key={i} className="rounded-xl p-3 bg-muted/40 border border-border/40 flex items-start gap-2.5">
                <span className="text-[10px] font-black shrink-0 w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center mt-px">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[11px] sm:text-xs text-foreground/80 leading-relaxed">{note.en}</p>
                  <p className="font-urdu text-[11px] text-foreground/50 leading-[1.8] text-right mt-1" dir="rtl">{note.ur}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="text-center pb-8"
          style={{ animation: `slideUp 0.5s ease forwards ${0.3 + steps.length * 0.07 + 0.18}s`, opacity: 0 }}
        >
          <button
            onClick={() => navigate("/")}
            className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-foreground font-bold text-sm shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
          >
            <UserPlus size={15} />
            Go to Registration
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
