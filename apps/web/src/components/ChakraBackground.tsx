import React from 'react';

/**
 * Fixed background Ashoka Chakra watermark component.
 * Rendered within React so that it never flashes unstyled during initial HTML parse.
 * Controlled by the `past-hero` class on document.documentElement:
 * - Hidden (opacity: 0) at the top of the home page hero
 * - Fades in (transition: opacity .9s ease) when scrolled past the hero or on other routes
 * - Rotates slowly (animation: chakra-spin 240s linear infinite)
 */
export const ChakraBackground: React.FC = () => {
  return (
    <svg
      className="chakra-bg"
      viewBox="-120 -120 240 240"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <circle r="114" strokeWidth="4" />
      <g>
        <circle cx="13.84" cy="-105.09" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="40.56" cy="-97.93" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="64.53" cy="-84.10" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="84.10" cy="-64.53" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="97.93" cy="-40.56" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="105.09" cy="-13.84" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="105.09" cy="13.84" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="97.93" cy="40.56" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="84.10" cy="64.53" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="64.53" cy="84.10" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="40.56" cy="97.93" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="13.84" cy="105.09" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-13.84" cy="105.09" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-40.56" cy="97.93" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-64.53" cy="84.10" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-84.10" cy="64.53" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-97.93" cy="40.56" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-105.09" cy="13.84" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-105.09" cy="-13.84" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-97.93" cy="-40.56" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-84.10" cy="-64.53" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-64.53" cy="-84.10" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-40.56" cy="-97.93" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="-13.84" cy="-105.09" r="2.4" fill="currentColor" stroke="none" />
      </g>
      <g strokeWidth="2.6">
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(0)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(15)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(30)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(45)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(60)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(75)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(90)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(105)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(120)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(135)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(150)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(165)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(180)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(195)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(210)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(225)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(240)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(255)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(270)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(285)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(300)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(315)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(330)" />
        <line x1="0" y1="-24" x2="0" y2="-98" transform="rotate(345)" />
      </g>
      <circle r="19" strokeWidth="4" />
      <circle r="7" fill="currentColor" stroke="none" />
    </svg>
  );
};
