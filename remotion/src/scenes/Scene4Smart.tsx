import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../constants";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });

const smartFeatures = [
  { icon: "🤖", title: "AI Chatbot", desc: "Instant answers from your textbook content", color: COLORS.purple },
  { icon: "📲", title: "Android App", desc: "Install directly on your phone as APK", color: COLORS.cyan },
  { icon: "🎨", title: "Dark & Light Mode", desc: "Beautiful themes for every preference", color: COLORS.accentWarm },
  { icon: "⚡", title: "Real-time Sync", desc: "Live updates across all devices", color: COLORS.green },
];

export const Scene4Smart = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* Right side text */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 160,
          width: 650,
          textAlign: "right",
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(titleSpring, [0, 1], [60, 0])}px)`,
        }}
      >
        <div style={{ width: 80, height: 4, background: COLORS.purple, borderRadius: 2, marginBottom: 20, marginLeft: "auto" }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.purple, letterSpacing: 4, textTransform: "uppercase" }}>
          Smart & Modern
        </span>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.15 }}>
            AI-Powered
            <br />
            <span style={{ color: COLORS.muted }}>Education Tools</span>
          </span>
        </div>
      </div>

      {/* Left side - stacked cards */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 130,
          width: 600,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {smartFeatures.map((f, i) => {
          const delay = 20 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
          const x = interpolate(s, [0, 1], [-300, 0]);
          const opacity = interpolate(s, [0, 1], [0, 1]);
          const floatY = Math.sin((frame - delay) * 0.03 + i * 2) * 4;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "28px 32px",
                background: `linear-gradient(135deg, ${COLORS.mid}, rgba(30,41,59,0.6))`,
                borderRadius: 24,
                border: `1px solid ${f.color}15`,
                transform: `translateX(${x}px) translateY(${floatY}px)`,
                opacity,
                boxShadow: `0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.muted }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
