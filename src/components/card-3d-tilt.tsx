import Tilt from "react-parallax-tilt";
import type { ReactNode } from "react";

interface Card3DTiltProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  scale?: number;
  tiltMaxAngle?: number;
}

export function Card3DTilt({
  children,
  disabled = false,
  className,
  scale = 1.05,
  tiltMaxAngle = 12,
}: Card3DTiltProps) {
  if (disabled) return <div className={className}>{children}</div>;

  return (
    <Tilt
      tiltMaxAngleX={tiltMaxAngle}
      tiltMaxAngleY={tiltMaxAngle}
      scale={scale}
      perspective={1000}
      transitionSpeed={300}
      glareEnable={false}
      className={className}
      style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
    >
      {children}
    </Tilt>
  );
}
