import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../constants";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });

const chatMessages = [
  { name: "Mr. Ahmed", msg: "Tomorrow's PTM is at 10 AM", align: "left" as const, color: COLORS.primary },
  { name: "Ms. Fatima", msg: "Chapter 5 exercises uploaded ✓", align: "right" as const, color: COLORS.green },
  { name: "Principal", msg: "Great progress this semester! 🎉", align: "left" as const, color: COLORS.accent },
];

export const Scene3Communication = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* Left side - text */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 160,
          width: 700,
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(titleSpring, [0, 1], [-60, 0])}px)`,
        }}
      >
        <div style={{ width: 80, height: 4, background: COLORS.green, borderRadius: 2, marginBottom: 20 }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.green, letterSpacing: 4, textTransform: "uppercase" }}>
          Stay Connected
        </span>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.15 }}>
            Discussion Room
            <br />
            <span style={{ color: COLORS.muted }}>& Messaging</span>
          </span>
        </div>
        <div style={{ marginTop: 24 }}>
          <span style={{ fontSize: 20, fontWeight: 500, color: COLORS.muted, lineHeight: 1.6 }}>
            Real-time group chat • Voice clips • File sharing
            <br />
            Typing indicators • Read receipts • Reply threads
          </span>
        </div>
      </div>

      {/* Right side - chat mockup */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 140,
          width: 520,
          height: 700,
          background: `linear-gradient(180deg, ${COLORS.mid}, rgba(15,23,42,0.95))`,
          borderRadius: 32,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 28px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${COLORS.primary}15`,
          overflow: "hidden",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 24,
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${COLORS.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            💬
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "white" }}>Discussion Room</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.green }}>● 8 teachers online</div>
          </div>
        </div>

        {/* Messages */}
        {chatMessages.map((m, i) => {
          const delay = 30 + i * 25;
          const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
          const msgOpacity = interpolate(s, [0, 1], [0, 1]);
          const msgY = interpolate(s, [0, 1], [30, 0]);
          const isLeft = m.align === "left";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isLeft ? "flex-start" : "flex-end",
                marginBottom: 16,
                opacity: msgOpacity,
                transform: `translateY(${msgY}px)`,
              }}
            >
              <div
                style={{
                  maxWidth: 360,
                  padding: "14px 18px",
                  borderRadius: 18,
                  borderTopLeftRadius: isLeft ? 4 : 18,
                  borderTopRightRadius: isLeft ? 18 : 4,
                  background: isLeft ? `${m.color}18` : `${m.color}25`,
                  border: `1px solid ${m.color}20`,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "white", lineHeight: 1.4 }}>{m.msg}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, textAlign: "right", marginTop: 6 }}>
                  {isLeft ? "✓✓" : "✓✓"} 2:3{i} PM
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        <div
          style={{
            opacity: interpolate(frame, [100, 115], [0, 1], { extrapolateRight: "clamp" }),
            display: "flex",
            gap: 4,
            marginTop: 10,
            marginLeft: 8,
          }}
        >
          {[0, 1, 2].map((d) => (
            <div
              key={d}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.muted,
                opacity: 0.3 + Math.sin((frame * 0.15) + d * 1.2) * 0.4,
              }}
            />
          ))}
          <span style={{ fontSize: 12, color: COLORS.muted, marginLeft: 8 }}>typing...</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
