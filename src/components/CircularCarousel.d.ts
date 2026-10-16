import React from 'react';

export interface CircularCarouselItem {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  [key: string]: any;
}

export interface CircularCarouselApi {
  focusIndex: (index: number) => void;
  stepBy: (delta: number) => void;
}

export interface CircularCarouselProps {
  items?: CircularCarouselItem[];
  preset?: 'cylinder' | 'orbit' | 'wheel' | 'panorama';
  intro?: 'assemble' | 'rise' | 'spin' | 'none';
  cardWidth?: number;
  aspectRatio?: number;
  gap?: number;
  curve?: number;
  tilt?: number;
  perspective?: number;
  autoplay?: 'drift' | 'step' | 'off';
  speed?: number;
  interval?: number;
  direction?: 'left' | 'right';
  draggable?: boolean;
  momentum?: number;
  snap?: boolean;
  pauseOnHover?: boolean;
  focusOnClick?: boolean;
  parallax?: number;
  stretch?: number;
  depthFade?: number;
  fadeColor?: string;
  innerShade?: number;
  cornerRadius?: number;
  captions?: boolean;
  onChange?: (index: number) => void;
  onItemClick?: (item: any, index: number, wasActive?: boolean) => void;
  apiRef?: React.MutableRefObject<CircularCarouselApi | null>;
  className?: string;
  style?: React.CSSProperties;
}

declare const CircularCarousel: React.FC<CircularCarouselProps>;

export default CircularCarousel;
