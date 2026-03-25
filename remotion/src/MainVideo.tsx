import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Features } from "./scenes/Scene2Features";
import { Scene3Communication } from "./scenes/Scene3Communication";
import { Scene4Smart } from "./scenes/Scene4Smart";
import { Scene5Closing } from "./scenes/Scene5Closing";
import { COLORS } from "./constants";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent animated background
  const bgHue = interpolate(frame, [0, 900], [230, 260]);
  const orbX = Math.sin(frame * 0.008) * 200;
  const orbY = Math.cos(frame * 0.006) * 150;
  const orb2X = Math.cos(frame * 0.01) * 300;
  const orb2Y = Math.sin(frame * 0.007) * 200;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.darker }}>
      {/* Persistent gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 80% at 50% 50%, hsl(${bgHue}, 60%, 8%) 0%, ${COLORS.darker} 70%)`,
        }}
      />

      {/* Floating orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}22, transparent 70%)`,
          left: 200 + orbX,
          top: 100 + orbY,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}18, transparent 70%)`,
          right: 100 + orb2X,
          bottom: 50 + orb2Y,
          filter: "blur(50px)",
        }}
      />

      {/* Grid overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
        }}
      />

      {/* Scenes */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene2Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={195}>
          <Scene3Communication />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={195}>
          <Scene4Smart />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
