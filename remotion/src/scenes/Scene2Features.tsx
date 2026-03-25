import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../constants";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });

const features = [
  { icon: "📚", title: "Digital Chapters", desc: "Access textbooks instantly", color: COLORS.primary },
  { icon: "📝", title: "Exercises & MCQs", desc: "Interactive assessments", color: COLORS.green },
  { icon: "📅", title: "Lesson Planner", desc: "Weekly & monthly schedules", color: COLORS.cyan },
  { icon: "🔔", title: "Notifications", desc: "Real-time push alerts", color: COLORS.accent },
  { icon: "📢", title: "Announcements", desc: "School-wide updates", color: COLORS.accentWarm },
  { icon: "🛡️", title: "Role-Based Access", desc: "Teacher • Admin • Principal", color: COLORS.rose },
];

export const Scene2Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Section title
  const titleSpring = spring({ frame, fps, config: { damping: 15 } });
  const titleX = interpolate(titleSpring, [0, 1], [-200, 0]);

  // Accent bar
  const barWidth = interpolate(frame, [10, 50], [0, 120], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily, padding: 80 }}>
      {/* Section label */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          transform: `translateX(${titleX}px)`,
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
        }}
      >
        <div style={{ width: barWidth, height: 4, background: COLORS.accent, borderRadius: 2, marginBottom: 16 }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.accent, letterSpacing: 4, textTransform: "uppercase" }}>
          Core Features
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 100,
          opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [15, 35], [20, 0], { extrapolateRight: "clamp" })}px)`,
        }}
      >
        <span style={{ fontSize: 56, fontWeight: 800, color: "white", lineHeight: 1.1 }}>
          Everything Teachers
          <br />
          <span style={{ color: COLORS.primaryLight }}>Need in One Place</span>
        </span>
      </div>

      {/* Feature cards - 3x2 grid */}
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 100,
          right: 100,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        {features.map((f, i) => {
          const delay = 30 + i * 12;
          const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
          const cardScale = interpolate(s, [0, 1], [0.7, 1]);
          const cardOpacity = interpolate(s, [0, 1], [0, 1]);

          // Subtle float
          const floatY = Math.sin((frame - delay) * 0.04 + i) * 3;

          return (
            <div
              key={i}
              style={{
                background: `linear-gradient(135deg, ${COLORS.mid}, rgba(30,41,59,0.8))`,
                borderRadius: 20,
                padding: "32px 28px",
                border: `1px solid rgba(255,255,255,0.06)`,
                transform: `scale(${cardScale}) translateY(${floatY}px)`,
                opacity: cardOpacity,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `${f.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: 16,
                  border: `1px solid ${f.color}30`,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.muted }}>{f.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
