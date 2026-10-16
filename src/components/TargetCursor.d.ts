import React from "react";

export interface TargetCursorProps {
  targetSelector?: string;
  cursorColor?: string;
  cursorColorOnTarget?: string;
  spinDuration?: number;
  hoverDuration?: number;
  parallaxOn?: boolean;
  hideDefaultCursor?: boolean;
  size?: number;
  cornerSize?: number;
  thickness?: number;
  padding?: number;
  matchRadius?: boolean;
  dotSize?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  showLabel?: boolean;
  clickEffect?: boolean;
  container?: React.RefObject<HTMLElement | null> | HTMLElement | null;
}

declare const TargetCursor: React.FC<TargetCursorProps>;
export default TargetCursor;
