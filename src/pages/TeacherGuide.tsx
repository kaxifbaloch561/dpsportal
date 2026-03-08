import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, PenLine, Camera, BookOpen, Send, Clock, CheckCircle2, XCircle, Bell, Shield, Sparkles, Info, ImageIcon } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

const steps = [
  {
    icon: UserPlus,
    gradient: "linear-gradient(135deg, hsl(235,78%,58%), hsl(260,70%,60%))",
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
    gradient: "linear-gradient(135deg, hsl(340,80%,55%), hsl(320,70%,58%))",
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
    gradient: "linear-gradient(135deg, hsl(270,72%,55%), hsl(290,65%,55%))",
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
    gradient: "linear-gradient(135deg, hsl(160,60%,38%), hsl(170,55%,42%))",
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
    gradient: "linear-gradient(135deg, hsl(200,85%,50%), hsl(210,80%,55%))",
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
    gradient: "linear-gradient(135deg, hsl(45,95%,45%), hsl(35,90%,48%))",
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
    gradient: "linear-gradient(135deg, hsl(145,72%,46%), hsl(155,65%,42%))",
    bg: "hsl(145,50%,96%)",
    titleEn: "Approved — You Can Log In!",
    titleUr: "منظور — آپ لاگ ان کر سکتے ہیں!",
    descEn: "Log in with your email and password. Full access to dashboard, subjects & discussion room.",
    descUr: "اپنی ای میل اور پاسورڈ سے لاگ ان کریں۔ ڈیش بورڈ، مضامین اور ڈسکشن روم تک مکمل رسائی۔",
  },
  {
    icon: XCircle,
    emoji: "❌",
    gradient: "linear-gradient(135deg, hsl(0,75%,55%), hsl(10,70%,52%))",
    bg: "hsl(0,50%,96%)",
    titleEn: "Rejected — Not Approved",
    titleUr: "مسترد — منظور نہیں ہوا",
    descEn: "A notification will explain the reason when you try to log in. Contact admin or re-register.",
    descUr: "لاگ ان کرنے پر اطلاع میں وجہ بتائی جائے گی۔ ایڈمن سے رابطہ کریں یا دوبارہ رجسٹر کریں۔",
  },
  {
    icon: Bell,
    emoji: "⏸️",
    gradient: "linear-gradient(135deg, hsl(35,90%,50%), hsl(25,85%,48%))",
    bg: "hsl(35,60%,96%)",
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
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, hsl(230,25%,12%) 0%, hsl(235,30%,18%) 40%, hsl(240,20%,14%) 100%)",
      }}
    >
      {/* Subtle glow orbs */}
      <div className="fixed top-[10%] left-[5%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-20" style={{ background: "hsl(235,78%,58%)" }} />
      <div className="fixed bottom-[10%] right-[5%] w-[250px] h-[250px] rounded-full blur-[100px] opacity-15" style={{ background: "hsl(340,80%,55%)" }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>

        {/* Hero Header */}
        <div
          className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(235,50%,22%) 0%, hsl(240,40%,18%) 100%)",
            border: "1px solid hsl(235,40%,30%)",
            animation: "containerSpring 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: "hsl(235,78%,58%)" }} />

          <div className="relative text-center">
            <img
              src={schoolLogo}
              alt="DPS SIBI"
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 drop-shadow-lg"
              style={{ animation: "slideDown 0.6s ease forwards 0.2s", opacity: 0 }}
            />
            <div style={{ animation: "slideUp 0.6s ease forwards 0.3s", opacity: 0 }}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3"
                style={{ background: "hsl(235,78%,58%,0.15)", color: "hsl(235,78%,72%)", border: "1px solid hsl(235,78%,58%,0.2)" }}>
                <Sparkles size={10} /> Step-by-Step Guide
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1.5">
                How to Create a Teacher Account
              </h1>
              <p className="font-urdu text-base sm:text-lg font-bold leading-relaxed" dir="rtl" style={{ color: "hsl(235,78%,78%)" }}>
                ٹیچر اکاؤنٹ کیسے بنائیں
              </p>
              <p className="text-[11px] mt-3" style={{ color: "hsl(235,20%,55%)" }}>
                Divisional Public School, SIBI
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="relative mb-10">
          {/* Vertical timeline line */}
          <div className="absolute left-5 sm:left-6 top-8 bottom-8 w-px" style={{ background: "linear-gradient(180deg, hsl(235,78%,58%,0.3), hsl(340,80%,55%,0.3), hsl(160,60%,38%,0.3), transparent)" }} />

          <div className="space-y-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative pl-14 sm:pl-16"
                  style={{
                    animation: `slideUp 0.5s ease forwards ${0.35 + i * 0.07}s`,
                    opacity: 0,
                  }}
                >
                  {/* Step circle on timeline */}
                  <div
                    className="absolute left-1.5 sm:left-2.5 top-0 w-7 h-7 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-lg z-10"
                    style={{ background: step.gradient }}
                  >
                    <span className="text-[10px] font-black text-white">{i + 1}</span>
                  </div>

                  {/* Card */}
                  <div
                    className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
                    style={{
                      background: "hsl(235,30%,16%)",
                      border: "1px solid hsl(235,25%,24%)",
                    }}
                  >
                    <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, hsl(0,0%,100%,0.06), transparent)` }} />

                    {/* Title row */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: step.gradient }}>
                        <Icon size={15} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-[13px] sm:text-sm font-bold text-white leading-tight">{step.titleEn}</h3>
                        <p className="font-urdu text-xs font-semibold text-right" dir="rtl" style={{ color: "hsl(235,60%,72%)" }}>{step.titleUr}</p>
                      </div>
                    </div>

                    {/* English bullet points */}
                    <ul className="space-y-1.5 mb-3">
                      {step.pointsEn.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "hsl(235,15%,65%)" }}>
                          <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: "hsl(235,78%,58%)" }} />
                          {p}
                        </li>
                      ))}
                    </ul>

                    {/* Urdu section */}
                    <div className="rounded-xl p-3" style={{ background: "hsl(235,25%,13%)", border: "1px solid hsl(235,20%,20%)" }}>
                      <ul className="space-y-1.5" dir="rtl">
                        {step.pointsUr.map((p, j) => (
                          <li key={j} className="flex items-start gap-2 font-urdu text-xs leading-[2] text-right" style={{ color: "hsl(235,20%,58%)" }}>
                            <span className="w-1 h-1 rounded-full shrink-0 mt-3" style={{ background: "hsl(235,60%,50%)" }} />
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

        {/* Account Status Section */}
        <div
          className="rounded-3xl p-5 sm:p-7 mb-8 relative overflow-hidden"
          style={{
            background: "hsl(235,30%,16%)",
            border: "1px solid hsl(235,25%,24%)",
            animation: `slideUp 0.5s ease forwards ${0.35 + steps.length * 0.07 + 0.05}s`,
            opacity: 0,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2"
              style={{ background: "hsl(200,85%,50%,0.12)", color: "hsl(200,85%,65%)", border: "1px solid hsl(200,85%,50%,0.15)" }}>
              <Shield size={10} /> After Registration
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">What Happens Next?</h2>
            <p className="font-urdu text-sm font-bold mt-0.5" dir="rtl" style={{ color: "hsl(235,60%,72%)" }}>رجسٹریشن کے بعد کیا ہوگا؟</p>
          </div>

          <div className="space-y-3">
            {statusCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: "hsl(235,25%,13%)", border: "1px solid hsl(235,20%,20%)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: card.gradient }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-white mb-0.5">{card.emoji} {card.titleEn}</h4>
                    <p className="font-urdu text-[11px] font-semibold text-right mb-2" dir="rtl" style={{ color: "hsl(235,60%,72%)" }}>{card.titleUr}</p>
                    <p className="text-[11px] leading-relaxed mb-1" style={{ color: "hsl(235,15%,60%)" }}>{card.descEn}</p>
                    <p className="font-urdu text-[11px] leading-[1.8] text-right" dir="rtl" style={{ color: "hsl(235,20%,52%)" }}>{card.descUr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div
          className="rounded-3xl p-5 sm:p-7 mb-8 relative overflow-hidden"
          style={{
            background: "hsl(235,30%,16%)",
            border: "1px solid hsl(235,25%,24%)",
            animation: `slideUp 0.5s ease forwards ${0.35 + steps.length * 0.07 + 0.12}s`,
            opacity: 0,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(45,95%,45%,0.15)" }}>
              <Info size={14} style={{ color: "hsl(45,95%,55%)" }} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Important Notes</h2>
              <p className="font-urdu text-xs font-bold" dir="rtl" style={{ color: "hsl(235,60%,72%)" }}>اہم ہدایات</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {notes.map((note, i) => (
              <div
                key={i}
                className="rounded-xl p-3 flex items-start gap-2.5"
                style={{ background: "hsl(235,25%,13%)", border: "1px solid hsl(235,20%,20%)" }}
              >
                <span className="text-[11px] font-black shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-px"
                  style={{ background: "hsl(235,78%,58%,0.12)", color: "hsl(235,78%,68%)" }}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed">{note.en}</p>
                  <p className="font-urdu text-[11px] leading-[1.8] text-right mt-1" dir="rtl" style={{ color: "hsl(235,20%,50%)" }}>{note.ur}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="text-center pb-10"
          style={{ animation: `slideUp 0.5s ease forwards ${0.35 + steps.length * 0.07 + 0.18}s`, opacity: 0 }}
        >
          <button
            onClick={() => navigate("/")}
            className="relative inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(235,78%,58%), hsl(260,70%,55%))",
              boxShadow: "0 8px 32px hsl(235,78%,58%,0.3), inset 0 1px 0 hsl(0,0%,100%,0.1)",
            }}
          >
            <UserPlus size={15} />
            Go to Registration
            <span
              className="absolute top-0 w-1/3 h-full"
              style={{
                background: "linear-gradient(to right, transparent, hsl(0,0%,100%,0.15), transparent)",
                transform: "skewX(-25deg)",
                animation: "shine 4s infinite",
              }}
            />
          </button>
          <p className="font-urdu text-xs mt-3 font-semibold" dir="rtl" style={{ color: "hsl(235,20%,45%)" }}>
            رجسٹریشن پیج پر جائیں
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherGuide;
