/**
 * Business Icons Library
 * Professional SVG icons for PowerPoint presentations
 * Converted to base64 data URIs for embedding in PPTX
 */

export interface IconDefinition {
  svg: string;
  base64: string;
}

// Helper to convert SVG to base64 data URI
function svgToBase64(svg: string): string {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Icon definitions with professional business styling
const ICON_SVGS = {
  // Data & Analytics Icons
  database: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="16" rx="20" ry="8" fill="#7B9CFF" opacity="0.3"/>
    <ellipse cx="32" cy="16" rx="20" ry="8" stroke="#7B9CFF" stroke-width="3"/>
    <path d="M12 16v12c0 4.4 9 8 20 8s20-3.6 20-8V16" stroke="#7B9CFF" stroke-width="3" fill="none"/>
    <path d="M12 28v12c0 4.4 9 8 20 8s20-3.6 20-8V28" stroke="#7B9CFF" stroke-width="3" fill="none"/>
  </svg>`,

  chart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="36" width="10" height="20" fill="#7B9CFF" rx="2"/>
    <rect x="27" y="24" width="10" height="32" fill="#7B9CFF" rx="2"/>
    <rect x="42" y="12" width="10" height="44" fill="#7B9CFF" rx="2"/>
  </svg>`,

  analytics: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="20" cy="44" r="6" fill="#7B9CFF"/>
    <circle cx="32" cy="28" r="6" fill="#7B9CFF"/>
    <circle cx="44" cy="20" r="6" fill="#7B9CFF"/>
    <path d="M24 40l6-10m6-8l6-4" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // Automation Icons
  gear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="10" fill="#7B9CFF"/>
    <path d="M32 8l3 8-3 8-3-8z M56 32l-8 3-8-3 8-3z M32 56l-3-8 3-8 3 8z M8 32l8-3 8 3-8 3z" fill="#7B9CFF"/>
  </svg>`,

  workflow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="24" width="16" height="16" fill="#7B9CFF" rx="3"/>
    <rect x="40" y="24" width="16" height="16" fill="#7B9CFF" rx="3"/>
    <path d="M24 32h16M32 24v16" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  automation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="20" stroke="#7B9CFF" stroke-width="3"/>
    <path d="M32 20v24M20 32h24" stroke="#7B9CFF" stroke-width="3"/>
    <circle cx="32" cy="32" r="6" fill="#7B9CFF"/>
  </svg>`,

  // AI Icons
  brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M20 16c-6 0-8 4-8 8s2 8 8 8c0 6 2 8 8 8h8c6 0 8-2 8-8 6 0 8-4 8-8s-2-8-8-8c0-4-4-8-12-8s-12 4-12 8z" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <circle cx="24" cy="24" r="2" fill="#A78BFF"/>
    <circle cx="40" cy="24" r="2" fill="#A78BFF"/>
  </svg>`,

  robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="20" y="24" width="24" height="28" rx="4" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <circle cx="28" cy="34" r="3" fill="#A78BFF"/>
    <circle cx="36" cy="34" r="3" fill="#A78BFF"/>
    <rect x="30" y="12" width="4" height="8" fill="#A78BFF"/>
    <circle cx="32" cy="12" r="4" fill="#A78BFF"/>
  </svg>`,

  ai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8l8 16-8 16-8-16z M56 32l-16 8-16-8 16-8z M32 56l-8-16 8-16 8 16z M8 32l16-8 16 8-16 8z" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
  </svg>`,

  // People Icons
  people: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="24" cy="20" r="8" fill="#7B9CFF"/>
    <path d="M8 52c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="44" cy="24" r="6" fill="#7B9CFF" opacity="0.6"/>
    <path d="M32 52c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="#7B9CFF" opacity="0.2" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="24" r="12" fill="#7B9CFF"/>
    <path d="M8 56c0-13.2 10.8-24 24-24s24 10.8 24 24" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="3"/>
  </svg>`,

  team: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="20" cy="24" r="6" fill="#7B9CFF"/>
    <circle cx="32" cy="20" r="7" fill="#7B9CFF"/>
    <circle cx="44" cy="24" r="6" fill="#7B9CFF"/>
    <path d="M8 48c0-6.6 5.4-12 12-12s12 5.4 12 12M24 52c0-8.8 7.2-16 16-16s16 7.2 16 16M44 48c0-6.6 5.4-12 12-12" stroke="#7B9CFF" stroke-width="2" fill="none"/>
  </svg>`,

  // UX Icons
  mouse: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="22" y="12" width="20" height="32" rx="10" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="3"/>
    <path d="M32 20v8" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  design: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M12 12h40v40H12z" stroke="#7B9CFF" stroke-width="3" fill="none"/>
    <circle cx="32" cy="32" r="12" fill="#7B9CFF" opacity="0.3"/>
    <path d="M20 32h24M32 20v24" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  palette: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8C18.8 8 8 18.8 8 32c0 8 4 15 10 19.4 2-.8 4-3.4 4-6.4 0-3.6-2.8-6.4-6.4-6.4C14.4 32 8 25.6 8 19.2 8 12.8 14.8 8 32 8s24 4.8 24 11.2S45.2 32 38.6 32c-3.6 0-6.4 2.8-6.4 6.4 0 3 2 5.6 4 6.4 6-4.4 10-11.4 10-19.4C46 18.8 45.2 8 32 8z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="24" cy="24" r="3" fill="#7B9CFF"/>
    <circle cx="40" cy="24" r="3" fill="#7B9CFF"/>
    <circle cx="32" cy="16" r="3" fill="#7B9CFF"/>
  </svg>`,

  // General Icons
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="28" cy="28" r="16" stroke="#7B9CFF" stroke-width="4"/>
    <path d="M40 40l16 16" stroke="#7B9CFF" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="3"/>
    <path d="M32 16v16l12 8" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  lightbulb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8C23.2 8 16 15.2 16 24c0 6 3.4 11.2 8 14v8h16v-8c4.6-2.8 8-8 8-14 0-8.8-7.2-16-16-16z" fill="#FFB800" opacity="0.3" stroke="#FFB800" stroke-width="2"/>
    <rect x="24" y="46" width="16" height="4" rx="2" fill="#FFB800"/>
    <rect x="26" y="50" width="12" height="4" rx="2" fill="#FFB800"/>
  </svg>`,

  target: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="32" cy="32" r="16" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="32" cy="32" r="8" fill="#7B9CFF"/>
  </svg>`,

  checkmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" fill="#7B9CFF" opacity="0.3"/>
    <path d="M20 32l8 8 16-16" stroke="#7B9CFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8c8 0 16 8 16 16v16l-8 8h-16l-8-8V24c0-8 8-16 16-16z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="32" cy="28" r="4" fill="#7B9CFF"/>
    <path d="M24 48l-8 8M40 48l8 8" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // Technology Icons
  cloud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M16 40c-4.4 0-8-3.6-8-8 0-4.2 3.2-7.6 7.4-7.9C16.6 18.6 21.8 14 28 14c4.8 0 9 2.8 10.8 7 .4-.1.8-.1 1.2-.1 5 0 9 4 9 9 0 .8-.1 1.6-.3 2.3 3.4 1.2 5.8 4.4 5.8 8.1 0 4.8-3.9 8.7-8.7 8.7H16z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  server: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="16" width="40" height="12" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <rect x="12" y="32" width="40" height="12" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="18" cy="22" r="2" fill="#7B9CFF"/>
    <circle cx="18" cy="38" r="2" fill="#7B9CFF"/>
    <path d="M26 22h20M26 38h20" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M20 20l-12 12 12 12M44 20l12 12-12 12" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M36 16l-8 32" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  mobile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="20" y="8" width="24" height="48" rx="4" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="32" cy="50" r="2" fill="#7B9CFF"/>
    <path d="M26 14h12" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  laptop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="12" width="40" height="28" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M8 40h48l-4 8H12z" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  // Business Process Icons
  document: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M16 8h24l12 12v36H16V8z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M40 8v12h12" stroke="#7B9CFF" stroke-width="2" stroke-linejoin="round"/>
    <path d="M24 28h16M24 36h16M24 44h12" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 16h18l6 6h24v32H8V16z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="16" width="40" height="40" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M12 24h40M20 12v8M44 12v8" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="24" cy="36" r="2" fill="#7B9CFF"/>
    <circle cx="32" cy="36" r="2" fill="#7B9CFF"/>
    <circle cx="40" cy="36" r="2" fill="#7B9CFF"/>
  </svg>`,

  mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="16" width="48" height="32" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M8 16l24 16 24-16" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Communication & Collaboration
  message: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 16h48v32H20L8 56V16z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M20 28h24M20 36h16" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  presentation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="12" width="40" height="28" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M32 40v12M24 52h16" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <path d="M20 20l8 12 6-8 10 8" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  video: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="20" width="36" height="24" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M44 26l12-6v24l-12-6z" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  // Finance & Metrics
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M32 16v4m0 24v4M24 26c0-4.4 3.6-6 8-6s8 1.6 8 6c0 3.2-2.4 4.8-6 5.6l-4 1.2c-3.6.8-6 2.4-6 5.6 0 4.4 3.6 6 8 6s8-1.6 8-6" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  graph: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 56h48M8 8v48" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 40l10-12 8 8 12-16 10 12" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="16" cy="40" r="3" fill="#7B9CFF"/>
    <circle cx="26" cy="28" r="3" fill="#7B9CFF"/>
    <circle cx="34" cy="36" r="3" fill="#7B9CFF"/>
    <circle cx="46" cy="20" r="3" fill="#7B9CFF"/>
    <circle cx="56" cy="32" r="3" fill="#7B9CFF"/>
  </svg>`,

  trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M20 12h24v12c0 6.6-5.4 12-12 12s-12-5.4-12-12V12z" fill="#FFB800" opacity="0.3" stroke="#FFB800" stroke-width="2"/>
    <path d="M44 12h8v8c0 4.4-3.6 8-8 8M20 12h-8v8c0 4.4 3.6 8 8 8" stroke="#FFB800" stroke-width="2"/>
    <path d="M32 36v8M24 52h16v-8H24z" fill="#FFB800" opacity="0.5" stroke="#FFB800" stroke-width="2"/>
  </svg>`,

  // Security & Governance
  shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8l-20 8v16c0 12.4 8.4 23.6 20 28 11.6-4.4 20-15.6 20-28V16L32 8z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M24 32l6 6 12-12" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  lock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="16" y="28" width="32" height="24" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M24 28V20c0-4.4 3.6-8 8-8s8 3.6 8 8v8" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="40" r="3" fill="#7B9CFF"/>
  </svg>`,

  key: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="44" cy="20" r="12" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M36 28L12 52l4 4 6-6 4 4 6-6 4 4 6-6z" stroke="#7B9CFF" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="44" cy="20" r="4" fill="#7B9CFF"/>
  </svg>`,

  // Additional Business Icons
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8l6 18h19l-15 11 6 19-16-12-16 12 6-19-15-11h19z" fill="#FFB800" opacity="0.3" stroke="#FFB800" stroke-width="2"/>
  </svg>`,

  flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M12 8v48" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 8h36c0 8-4 12-12 12s12 4 12 12H12V8z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  bell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8c-8 0-12 6-12 14v8l-4 12h32l-4-12v-8c0-8-4-14-12-14z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M26 42c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="8" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M32 12v4m0 32v4m20-20h-4m-32 0h-4m14.1-14.1l2.8 2.8m14.2 14.2l2.8 2.8m0-28.2l-2.8 2.8m-14.2 14.2l-2.8 2.8" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 12v32m-12-12l12 12 12-12" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 48v4h40v-4" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  upload: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 44V12m-12 12l12-12 12 12" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 48v4h40v-4" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // White outlined versions for use on colored backgrounds
  searchWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="28" cy="28" r="16" stroke="#FFFFFF" stroke-width="4"/>
    <path d="M40 40l16 16" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  chartWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="36" width="10" height="20" fill="#FFFFFF" rx="2"/>
    <rect x="27" y="24" width="10" height="32" fill="#FFFFFF" rx="2"/>
    <rect x="42" y="12" width="10" height="44" fill="#FFFFFF" rx="2"/>
  </svg>`,

  clockWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" stroke="#FFFFFF" stroke-width="3"/>
    <path d="M32 16v16l12 8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // White technology icons for colored backgrounds
  cloudWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M16 40c-4.4 0-8-3.6-8-8 0-4.2 3.2-7.6 7.4-7.9C16.6 18.6 21.8 14 28 14c4.8 0 9 2.8 10.8 7 .4-.1.8-.1 1.2-.1 5 0 9 4 9 9 0 .8-.1 1.6-.3 2.3 3.4 1.2 5.8 4.4 5.8 8.1 0 4.8-3.9 8.7-8.7 8.7H16z" fill="#FFFFFF" opacity="0.3" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`,

  gearWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="10" fill="#FFFFFF"/>
    <path d="M32 8l3 8-3 8-3-8z M56 32l-8 3-8-3 8-3z M32 56l-3-8 3-8 3 8z M8 32l8-3 8 3-8 3z" fill="#FFFFFF"/>
  </svg>`,

  analyticsWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="20" cy="44" r="6" fill="#FFFFFF"/>
    <circle cx="32" cy="28" r="6" fill="#FFFFFF"/>
    <circle cx="44" cy="20" r="6" fill="#FFFFFF"/>
    <path d="M24 40l6-10m6-8l6-4" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  databaseWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="16" rx="20" ry="8" fill="#FFFFFF" opacity="0.3"/>
    <ellipse cx="32" cy="16" rx="20" ry="8" stroke="#FFFFFF" stroke-width="3"/>
    <path d="M12 16v12c0 4.4 9 8 20 8s20-3.6 20-8V16" stroke="#FFFFFF" stroke-width="3" fill="none"/>
    <path d="M12 28v12c0 4.4 9 8 20 8s20-3.6 20-8V28" stroke="#FFFFFF" stroke-width="3" fill="none"/>
  </svg>`,

  codeWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M20 20l-12 12 12 12M44 20l12 12-12 12" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M36 16l-8 32" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // User Experience Icons
  cursor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M12 8l8 32 8-4 8 16 6-3-8-16 10-2z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="48" cy="20" r="8" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  touch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M28 16v16m0 0v16l12 8 8-12-8-8V20c0-2.2-1.8-4-4-4s-4 1.8-4 4v12z" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <path d="M28 20c0-2.2-1.8-4-4-4s-4 1.8-4 4v12m8 0c0-2.2 1.8-4 4-4s4 1.8 4 4v0" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="12" r="3" fill="#7B9CFF"/>
  </svg>`,

  interface: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="12" width="48" height="40" rx="2" fill="#7B9CFF" opacity="0.1" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M8 20h48" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="16" cy="16" r="2" fill="#7B9CFF"/>
    <circle cx="22" cy="16" r="2" fill="#7B9CFF"/>
    <circle cx="28" cy="16" r="2" fill="#7B9CFF"/>
    <rect x="16" y="28" width="16" height="3" rx="1.5" fill="#7B9CFF"/>
    <rect x="16" y="36" width="24" height="3" rx="1.5" fill="#7B9CFF" opacity="0.5"/>
    <rect x="16" y="42" width="20" height="3" rx="1.5" fill="#7B9CFF" opacity="0.5"/>
    <circle cx="48" cy="36" r="6" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  smile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" fill="#FFB800" opacity="0.2" stroke="#FFB800" stroke-width="2"/>
    <circle cx="24" cy="26" r="3" fill="#FFB800"/>
    <circle cx="40" cy="26" r="3" fill="#FFB800"/>
    <path d="M20 38c2 6 6 8 12 8s10-2 12-8" stroke="#FFB800" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // Additional Communication & Management Icons
  megaphone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 24l32-8v32L8 40V24z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M40 16v32l8-4V20z" fill="#7B9CFF" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="48" cy="28" r="8" stroke="#7B9CFF" stroke-width="2" fill="none"/>
    <path d="M12 40l-4 8h8l-4-8z" fill="#7B9CFF" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  handshake: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 28l8-8 8 4 8-4 8 4 8-4 8 8-16 16-16-16z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 20v-8h8v8M40 20v-8h8v8" stroke="#7B9CFF" stroke-width="2"/>
  </svg>`,

  certificate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="8" width="40" height="32" rx="2" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M20 20h24M20 26h24M20 32h16" stroke="#7B9CFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="48" r="8" fill="#FFB800" opacity="0.3" stroke="#FFB800" stroke-width="2"/>
    <path d="M32 40v-4M28 52l4 12 4-12" stroke="#FFB800" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  growth: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 56V32c0-8 4-12 12-12h8c8 0 12 4 12 12v24" stroke="#7B9CFF" stroke-width="3" fill="none"/>
    <path d="M40 12h16v16" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M56 12L32 36" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="36" r="4" fill="#7B9CFF"/>
  </svg>`,

  education: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 16l24 8-24 8-24-8z" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 24v12c0 4 10.8 8 24 8s24-4 24-8V24" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M56 28v12l-4 8h-8l-4-8V28" stroke="#7B9CFF" stroke-width="2" fill="none"/>
  </svg>`,

  leadership: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="20" r="8" fill="#FFB800" opacity="0.3" stroke="#FFB800" stroke-width="2"/>
    <path d="M16 52c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#FFB800" stroke-width="2"/>
    <circle cx="20" cy="32" r="6" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="44" cy="32" r="6" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M8 48c0-6.6 5.4-12 12-12M56 48c0-6.6-5.4-12-12-12" stroke="#7B9CFF" stroke-width="2" fill="none"/>
  </svg>`,

  // Success Metrics Icons
  speedometer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 40c0-13.3 10.7-24 24-24s24 10.7 24 24" stroke="#7B9CFF" stroke-width="3" fill="none"/>
    <circle cx="32" cy="40" r="4" fill="#7B9CFF"/>
    <path d="M32 40L44 24" stroke="#7B9CFF" stroke-width="3" stroke-linecap="round"/>
    <circle cx="16" cy="44" r="2" fill="#7B9CFF"/>
    <circle cx="32" cy="20" r="2" fill="#7B9CFF"/>
    <circle cx="48" cy="44" r="2" fill="#7B9CFF"/>
  </svg>`,

  money: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="20" width="48" height="24" rx="4" fill="#4CAF50" opacity="0.3" stroke="#4CAF50" stroke-width="2"/>
    <circle cx="32" cy="32" r="8" stroke="#4CAF50" stroke-width="2" fill="none"/>
    <path d="M32 28v8M28 32h8" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
    <circle cx="14" cy="26" r="2" fill="#4CAF50"/>
    <circle cx="50" cy="38" r="2" fill="#4CAF50"/>
  </svg>`,

  trendUp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 48L20 36L32 44L56 12" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M44 12h12v12" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="20" cy="36" r="3" fill="#4CAF50"/>
    <circle cx="32" cy="44" r="3" fill="#4CAF50"/>
    <circle cx="56" cy="12" r="3" fill="#4CAF50"/>
  </svg>`,

  users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="20" r="8" fill="#7B9CFF" opacity="0.3" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="16" cy="24" r="6" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
    <circle cx="48" cy="24" r="6" fill="#7B9CFF" opacity="0.5" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M16 52c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#7B9CFF" stroke-width="2"/>
    <path d="M4 48c0-6.6 5.4-12 12-12M60 48c0-6.6-5.4-12-12-12" stroke="#7B9CFF" stroke-width="2" fill="none"/>
  </svg>`,

  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 52L12 32c-4-4-4-10 0-14s10-4 14 0l6 6 6-6c4-4 10-4 14 0s4 10 0 14L32 52z" fill="#FF4081" opacity="0.3" stroke="#FF4081" stroke-width="2"/>
  </svg>`,

  bulb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="28" r="16" fill="#FFB800" opacity="0.2" stroke="#FFB800" stroke-width="2"/>
    <path d="M24 40v4c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-4" stroke="#FFB800" stroke-width="2"/>
    <rect x="28" y="48" width="8" height="4" rx="2" fill="#FFB800"/>
    <path d="M32 12v4M16 20l2.8 2.8M12 32h4M48 20l-2.8 2.8M52 32h-4" stroke="#FFB800" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // White Action Icons for Next Steps
  handshakeWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M8 28l8-8 8 4 8-4 8 4 8-4 8 8-16 16-16-16z" fill="#FFFFFF" opacity="0.3" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 20v-8h8v8M40 20v-8h8v8" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`,

  teamWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="20" cy="24" r="6" fill="#FFFFFF"/>
    <circle cx="32" cy="20" r="7" fill="#FFFFFF"/>
    <circle cx="44" cy="24" r="6" fill="#FFFFFF"/>
    <path d="M8 48c0-6.6 5.4-12 12-12s12 5.4 12 12M24 52c0-8.8 7.2-16 16-16s16 7.2 16 16M44 48c0-6.6 5.4-12 12-12" stroke="#FFFFFF" stroke-width="2" fill="none"/>
  </svg>`,

  rocketWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path d="M32 8c8 0 16 8 16 16v16l-8 8h-16l-8-8V24c0-8 8-16 16-16z" fill="#FFFFFF" opacity="0.3" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="32" cy="28" r="4" fill="#FFFFFF"/>
    <path d="M24 48l-8 8M40 48l8 8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  userWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="24" r="12" fill="#FFFFFF"/>
    <path d="M8 56c0-13.2 10.8-24 24-24s24 10.8 24 24" stroke="#FFFFFF" stroke-width="3"/>
  </svg>`,

  targetWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="32" cy="32" r="16" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="32" cy="32" r="8" fill="#FFFFFF"/>
  </svg>`,

  kanbanWhite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="12" width="14" height="40" rx="2" stroke="#FFFFFF" stroke-width="2" fill="none"/>
    <rect x="25" y="12" width="14" height="40" rx="2" stroke="#FFFFFF" stroke-width="2" fill="none"/>
    <rect x="42" y="12" width="14" height="40" rx="2" stroke="#FFFFFF" stroke-width="2" fill="none"/>
    <rect x="11" y="18" width="8" height="6" rx="1" fill="#FFFFFF"/>
    <rect x="11" y="28" width="8" height="6" rx="1" fill="#FFFFFF"/>
    <rect x="28" y="18" width="8" height="6" rx="1" fill="#FFFFFF"/>
    <rect x="45" y="18" width="8" height="6" rx="1" fill="#FFFFFF"/>
  </svg>`,

  // Additional AI/ML Icons
  neuralNetwork: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="12" r="4" fill="#A78BFF"/>
    <circle cx="16" cy="32" r="4" fill="#A78BFF"/>
    <circle cx="32" cy="32" r="4" fill="#A78BFF"/>
    <circle cx="48" cy="32" r="4" fill="#A78BFF"/>
    <circle cx="16" cy="52" r="4" fill="#A78BFF"/>
    <circle cx="32" cy="52" r="4" fill="#A78BFF"/>
    <circle cx="48" cy="52" r="4" fill="#A78BFF"/>
    <path d="M32 16L16 28M32 16L32 28M32 16L48 28M16 36L16 48M32 36L16 48M32 36L32 48M32 36L48 48M48 36L48 48" stroke="#A78BFF" stroke-width="2" opacity="0.5"/>
  </svg>`,

  chatbot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="16" y="16" width="32" height="28" rx="4" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <path d="M28 44l-4 8 4-2 4 2z" fill="#A78BFF" stroke="#A78BFF" stroke-width="2"/>
    <circle cx="28" cy="28" r="3" fill="#A78BFF"/>
    <circle cx="36" cy="28" r="3" fill="#A78BFF"/>
    <path d="M24 36c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="#A78BFF" stroke-width="2" fill="none"/>
  </svg>`,

  model: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="12" width="40" height="12" rx="2" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <rect x="12" y="28" width="40" height="12" rx="2" fill="#A78BFF" opacity="0.5" stroke="#A78BFF" stroke-width="2"/>
    <rect x="12" y="44" width="40" height="12" rx="2" fill="#A78BFF" opacity="0.7" stroke="#A78BFF" stroke-width="2"/>
    <circle cx="20" cy="18" r="2" fill="#A78BFF"/>
    <circle cx="20" cy="34" r="2" fill="#A78BFF"/>
    <circle cx="20" cy="50" r="2" fill="#A78BFF"/>
  </svg>`,

  automation2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="16" stroke="#A78BFF" stroke-width="2" fill="none"/>
    <path d="M32 16v8M48 32h-8M32 48v-8M16 32h8" stroke="#A78BFF" stroke-width="2"/>
    <circle cx="32" cy="32" r="6" fill="#A78BFF"/>
    <path d="M44 20l-4 4M44 44l-4-4M20 20l4 4M20 44l4-4" stroke="#A78BFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  pipeline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="24" width="12" height="16" rx="2" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <rect x="26" y="24" width="12" height="16" rx="2" fill="#A78BFF" opacity="0.5" stroke="#A78BFF" stroke-width="2"/>
    <rect x="44" y="24" width="12" height="16" rx="2" fill="#A78BFF" opacity="0.7" stroke="#A78BFF" stroke-width="2"/>
    <path d="M20 32h6M38 32h6" stroke="#A78BFF" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  prediction: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="20" stroke="#A78BFF" stroke-width="2" fill="none"/>
    <path d="M32 12v8M32 44v8M12 32h8M44 32h8" stroke="#A78BFF" stroke-width="2"/>
    <path d="M20 20l4 4M44 20l-4 4M20 44l4-4M44 44l-4-4" stroke="#A78BFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="8" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <path d="M32 28v8l4-4" stroke="#A78BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  chip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect x="20" y="20" width="24" height="24" rx="2" fill="#A78BFF" opacity="0.3" stroke="#A78BFF" stroke-width="2"/>
    <rect x="26" y="26" width="12" height="12" fill="#A78BFF"/>
    <path d="M28 20v-8M32 20v-8M36 20v-8M28 44v8M32 44v8M36 44v8M20 28h-8M20 32h-8M20 36h-8M44 28h8M44 32h8M44 36h8" stroke="#A78BFF" stroke-width="2"/>
  </svg>`,
};

// Create icon library with base64 encoded versions
export const BUSINESS_ICONS: Record<string, IconDefinition> = Object.entries(ICON_SVGS).reduce(
  (acc, [key, svg]) => {
    acc[key] = {
      svg,
      base64: svgToBase64(svg),
    };
    return acc;
  },
  {} as Record<string, IconDefinition>
);

// Icon mapping for different slide types
export const ICON_MAPPING = {
  // Pillar icons
  data_strategy: 'database',
  automation: 'automation',
  ai_integration: 'ai',
  people_culture: 'people',
  user_experience: 'smile',

  // Sub-category icons
  quality: 'checkmark',
  integration: 'workflow',
  analytics: 'analytics',
  culture: 'team',
  process: 'gear',
  workflow: 'workflow',
  orchestration: 'automation',
  governance: 'target',
  skills: 'user',
  change: 'people',
  innovation: 'lightbulb',
  leadership: 'target',
  aiAnalytics: 'analytics',
  genAI: 'brain',
  aiAgents: 'chatbot',
  mlOps: 'pipeline',
  neural: 'neuralNetwork',
  network: 'neuralNetwork',
  model: 'model',
  prediction: 'prediction',
  predictive: 'prediction',
  chip: 'chip',
  hardware: 'chip',
  bot: 'chatbot',
  conversation: 'chatbot',
  training: 'model',
  inference: 'model',
  research: 'search',
  design: 'design',
  onboarding: 'user',
  accessibility: 'palette',

  // Opportunity icons
  search: 'search',
  chart: 'chart',
  timer: 'clock',
};
