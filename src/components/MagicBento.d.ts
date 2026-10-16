import React from 'react';

export interface MagicBentoItem {
  title: string;
  description?: string;
  visual?: string | React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  tag?: string;
  badge?: string;
  icon?: any;
  href?: string;
  [key: string]: any;
}

export interface MagicBentoProps {
  items?: MagicBentoItem[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  radius?: number;
  theme?: 'dark' | 'light';
  glowColor?: string;
  textAutoHide?: boolean;
  enableBorderGlow?: boolean;
  enableSpotlight?: boolean;
  spotlightRadius?: number;
  enableStars?: boolean;
  particleCount?: number;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  intro?: boolean;
  disableAnimations?: boolean;
  onItemClick?: (item: MagicBentoItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

declare const MagicBento: React.FC<MagicBentoProps>;
export default MagicBento;
