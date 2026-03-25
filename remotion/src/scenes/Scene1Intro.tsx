import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { COLORS } from "../constants";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo circle
  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const logoRotate = interpolate(frame, [0, 60], [180, 0], { extrapolateRight: "clamp" });

  // Ring pulse
  const ringScale = interpolate(frame, [20, 50], [0.6, 1.2], { extrapolateRight: "clamp" });
  const ringOpacity = interpolate(frame, [20, 50, 70], [0, 0.6, 0], { extrapolateRight: "clamp" });

  // Title
  const titleY = spring({ frame: frame - 30, fps, config: { damping: 15, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  // Subtitle
  const subY = spring({ frame: frame - 50, fps, config: { damping: 15, stiffness: 80 } });
  const subOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });

  // Tagline
  const tagOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });
  const tagWidth = interpolate(frame, [80, 120], [0, 600], { extrapolateRight: "clamp" });

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const delay = i * 3;
    const dist = interpolate(frame - delay, [0, 40], [0, 300 + i * 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pOpacity = interpolate(frame - delay, [0, 20, 40], [0, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: pOpacity, size: 3 + (i % 3) * 2 };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 2 === 0 ? COLORS.primary : COLORS.accent,
            left: 960 + p.x,
            top: 440 + p.y,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Ring pulse */}
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: `3px solid ${COLORS.primaryLight}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />

      {/* Logo circle */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
          boxShadow: `0 0 60px ${COLORS.primary}66, 0 20px 40px rgba(0,0,0,0.4)`,
        }}
      >
        <span style={{ fontSize: 64, fontWeight: 900, color: "white", letterSpacing: -2 }}>
          DPS
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 560,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            letterSpacing: -2,
          }}
        >
          DPS{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentWarm})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Portal
          </span>
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 650,
          textAlign: "center",
          opacity: subOpacity,
          transform: `translateY(${interpolate(subY, [0, 1], [30, 0])}px)`,
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 600, color: COLORS.muted, letterSpacing: 6, textTransform: "uppercase" }}>
          Divisional Public School • SIBI
        </span>
      </div>

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          top: 710,
          height: 3,
          width: tagWidth,
          background: `linear-gradient(90deg, transparent, ${COLORS.primary}, ${COLORS.accent}, transparent)`,
          opacity: tagOpacity,
          borderRadius: 2,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: 740,
          textAlign: "center",
          opacity: tagOpacity,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 600, color: COLORS.muted }}>
          Empowering Education Through Technology
        </span>
      </div>
    </AbsoluteFill>
  );
};
