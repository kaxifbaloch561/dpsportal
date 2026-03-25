import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../constants";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });

export const Scene5Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Converging lines
  const lineProgress = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });

  // Logo
  const logoSpring = spring({ frame: frame - 20, fps, config: { damping: 10, stiffness: 80 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1]);

  // Title
  const titleSpring = spring({ frame: frame - 40, fps, config: { damping: 14 } });

  // URL
  const urlOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" });

  // Tagline
  const tagSpring = spring({ frame: frame - 55, fps, config: { damping: 15 } });

  // Pulsing glow
  const glowIntensity = 0.3 + Math.sin(frame * 0.06) * 0.15;

  // Dev credit
  const creditOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily, justifyContent: "center", alignItems: "center" }}>
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")}, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Converging horizontal lines */}
      {[-1, 1].map((dir) => (
        <div
          key={dir}
          style={{
            position: "absolute",
            top: "50%",
            left: dir === -1 ? 0 : undefined,
            right: dir === 1 ? 0 : undefined,
            width: interpolate(lineProgress, [0, 1], [0, 500]),
            height: 2,
            background: `linear-gradient(${dir === -1 ? "90deg" : "270deg"}, transparent, ${COLORS.primary}60)`,
          }}
        />
      ))}

      {/* Logo */}
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 80px ${COLORS.primary}55, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        <span style={{ fontSize: 52, fontWeight: 900, color: "white" }}>DPS</span>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 600,
          textAlign: "center",
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        <span style={{ fontSize: 64, fontWeight: 900, color: "white" }}>
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

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: 685,
          textAlign: "center",
          opacity: interpolate(tagSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(tagSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 600, color: COLORS.muted }}>
          The Future of School Management
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          top: 750,
          opacity: urlOpacity,
          padding: "12px 36px",
          borderRadius: 40,
          background: `${COLORS.primary}18`,
          border: `1px solid ${COLORS.primary}30`,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.primaryLight, letterSpacing: 1 }}>
          dpsportal.lovable.app
        </span>
      </div>

      {/* Dev credit */}
      <div style={{ position: "absolute", bottom: 60, opacity: creditOpacity, textAlign: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase" }}>
          Developed by Kashif Gull ❤️
        </span>
      </div>
    </AbsoluteFill>
  );
};
