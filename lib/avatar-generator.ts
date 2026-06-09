/**
 * Professional SVG-based Avatar Generator
 *
 * Generates deterministic, professional avatar SVGs from a person's name.
 * No external API keys required — pure string-template SVG generation.
 */

type AvatarStyle = "corporate" | "creative" | "tech";

interface AvatarOptions {
  name: string;
  style?: AvatarStyle;
  size?: number;
}

// ── Color Palettes ──────────────────────────────────────────────────────────

const PALETTES: Record<AvatarStyle, string[]> = {
  corporate: [
    "#1e3a5f", // navy
    "#2d3748", // charcoal
    "#1a365d", // deep blue
    "#276749", // forest green
    "#4a5568", // slate
    "#2c5282", // steel blue
  ],
  creative: [
    "#e76f51", // coral
    "#7c3aed", // purple
    "#0d9488", // teal
    "#d97706", // amber
    "#db2777", // pink
    "#6d28d9", // violet
  ],
  tech: [
    "#2563eb", // electric blue
    "#10b981", // neon green
    "#06b6d4", // cyan
    "#7c3aed", // violet
    "#0ea5e9", // sky
    "#14b8a6", // teal-cyan
  ],
};

// Secondary (lighter) accent for gradients — derived per palette entry
const GRADIENT_STOPS: Record<AvatarStyle, string[]> = {
  corporate: [
    "#3b82f6",
    "#4a5568",
    "#2b6cb0",
    "#48bb78",
    "#718096",
    "#3182ce",
  ],
  creative: [
    "#f97316",
    "#a78bfa",
    "#2dd4bf",
    "#fbbf24",
    "#f472b6",
    "#8b5cf6",
  ],
  tech: [
    "#60a5fa",
    "#34d399",
    "#22d3ee",
    "#a78bfa",
    "#38bdf8",
    "#2dd4bf",
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Simple deterministic hash from a string.
 * Returns a non-negative integer.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Extract up to 2 initials from a full name.
 * "John Doe" → "JD", "Madonna" → "M", "Mary Jane Watson" → "MW"
 */
function extractInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── SVG Builders ────────────────────────────────────────────────────────────

function buildCorporateSvg(
  initials: string,
  size: number,
  primary: string,
  secondary: string
): string {
  const id = `corp-${hashString(initials + primary)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="${id}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <linearGradient id="${id}-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${secondary}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="url(#${id}-bg)"/>
  <!-- Decorative outer ring -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.38}" fill="none" stroke="url(#${id}-ring)" stroke-width="${Math.max(1, size * 0.015)}"/>
  <!-- Decorative inner ring -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.28}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="${Math.max(1, size * 0.008)}"/>
  <!-- Initials -->
  <text x="${size / 2}" y="${size / 2}" font-family="'Segoe UI',system-ui,-apple-system,sans-serif" font-size="${Math.round(size * 0.32)}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central" letter-spacing="${Math.round(size * 0.02)}">${initials}</text>
</svg>`;
}

function buildCreativeSvg(
  initials: string,
  size: number,
  primary: string,
  secondary: string
): string {
  const id = `crtv-${hashString(initials + primary)}`;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Geometric decorative shapes
  const shapes = [
    // Top-right diamond
    `<rect x="${cx + r * 0.6}" y="${cy - r * 0.8}" width="${size * 0.08}" height="${size * 0.08}" rx="2" transform="rotate(45 ${cx + r * 0.6 + size * 0.04} ${cy - r * 0.8 + size * 0.04})" fill="rgba(255,255,255,0.15)"/>`,
    // Bottom-left circle
    `<circle cx="${cx - r * 0.55}" cy="${cy + r * 0.6}" r="${size * 0.035}" fill="rgba(255,255,255,0.12)"/>`,
    // Top-left small triangle
    `<polygon points="${cx - r * 0.7},${cy - r * 0.5} ${cx - r * 0.5},${cy - r * 0.5} ${cx - r * 0.6},${cy - r * 0.72}" fill="rgba(255,255,255,0.1)"/>`,
  ].join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="${id}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#${id}-bg)"/>
  <!-- Soft glow overlay -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#${id}-glow)"/>
  <!-- Decorative shapes -->
  ${shapes}
  <!-- Decorative ring -->
  <circle cx="${cx}" cy="${cy}" r="${size * 0.34}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="${Math.max(1, size * 0.012)}" stroke-dasharray="${Math.round(size * 0.06)} ${Math.round(size * 0.04)}"/>
  <!-- Initials -->
  <text x="${cx}" y="${cy}" font-family="'Segoe UI',system-ui,-apple-system,sans-serif" font-size="${Math.round(size * 0.34)}" font-weight="800" fill="white" text-anchor="middle" dominant-baseline="central" letter-spacing="${Math.round(size * 0.015)}">${initials}</text>
</svg>`;
}

function buildTechSvg(
  initials: string,
  size: number,
  primary: string,
  secondary: string
): string {
  const id = `tech-${hashString(initials + primary)}`;
  const cx = size / 2;
  const cy = size / 2;

  // Circuit-like decorative lines
  const lineStroke = `rgba(255,255,255,0.08)`;
  const lineWidth = Math.max(1, size * 0.006);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="${id}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <radialGradient id="${id}-center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="url(#${id}-bg)"/>
  <!-- Center glow -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="url(#${id}-center)"/>
  <!-- Circuit lines - top -->
  <line x1="${cx - size * 0.15}" y1="${size * 0.1}" x2="${cx + size * 0.15}" y2="${size * 0.1}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <line x1="${cx}" y1="${size * 0.1}" x2="${cx}" y2="${size * 0.18}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <!-- Circuit lines - bottom -->
  <line x1="${cx - size * 0.15}" y1="${size * 0.9}" x2="${cx + size * 0.15}" y2="${size * 0.9}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <line x1="${cx}" y1="${size * 0.82}" x2="${cx}" y2="${size * 0.9}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <!-- Circuit lines - left -->
  <line x1="${size * 0.1}" y1="${cy - size * 0.1}" x2="${size * 0.1}" y2="${cy + size * 0.1}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <line x1="${size * 0.1}" y1="${cy}" x2="${size * 0.18}" y2="${cy}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <!-- Circuit lines - right -->
  <line x1="${size * 0.9}" y1="${cy - size * 0.1}" x2="${size * 0.9}" y2="${cy + size * 0.1}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <line x1="${size * 0.82}" y1="${cy}" x2="${size * 0.9}" y2="${cy}" stroke="${lineStroke}" stroke-width="${lineWidth}"/>
  <!-- Corner nodes -->
  <circle cx="${cx - size * 0.15}" cy="${size * 0.1}" r="${Math.max(1.5, size * 0.012)}" fill="rgba(255,255,255,0.15)"/>
  <circle cx="${cx + size * 0.15}" cy="${size * 0.1}" r="${Math.max(1.5, size * 0.012)}" fill="rgba(255,255,255,0.15)"/>
  <circle cx="${cx - size * 0.15}" cy="${size * 0.9}" r="${Math.max(1.5, size * 0.012)}" fill="rgba(255,255,255,0.15)"/>
  <circle cx="${cx + size * 0.15}" cy="${size * 0.9}" r="${Math.max(1.5, size * 0.012)}" fill="rgba(255,255,255,0.15)"/>
  <!-- Decorative hexagonal ring -->
  <polygon points="${cx},${cy - size * 0.36} ${cx + size * 0.31},${cy - size * 0.18} ${cx + size * 0.31},${cy + size * 0.18} ${cx},${cy + size * 0.36} ${cx - size * 0.31},${cy + size * 0.18} ${cx - size * 0.31},${cy - size * 0.18}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="${Math.max(1, size * 0.01)}"/>
  <!-- Inner circle -->
  <circle cx="${cx}" cy="${cy}" r="${size * 0.22}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${Math.max(1, size * 0.008)}"/>
  <!-- Initials -->
  <text x="${cx}" y="${cy}" font-family="'SF Mono','Cascadia Code','Consolas',monospace" font-size="${Math.round(size * 0.3)}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central" letter-spacing="${Math.round(size * 0.03)}">${initials}</text>
</svg>`;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a professional SVG avatar from a person's name.
 *
 * @param opts - Configuration options
 * @param opts.name  - Full name to derive initials from
 * @param opts.style - Visual style: 'corporate' | 'creative' | 'tech'
 * @param opts.size  - Output SVG dimensions in pixels (default 200)
 * @returns SVG string
 */
export function generateProfessionalAvatar(
  opts: AvatarOptions
): string {
  const { name, style = "corporate", size = 200 } = opts;

  const initials = extractInitials(name);
  const hash = hashString(name.toLowerCase().trim());

  const palette = PALETTES[style];
  const stops = GRADIENT_STOPS[style];

  const colorIndex = hash % palette.length;
  const primary = palette[colorIndex];
  const secondary = stops[colorIndex];

  switch (style) {
    case "creative":
      return buildCreativeSvg(initials, size, primary, secondary);
    case "tech":
      return buildTechSvg(initials, size, primary, secondary);
    case "corporate":
    default:
      return buildCorporateSvg(initials, size, primary, secondary);
  }
}

/**
 * Generate a professional avatar and return it as a data URL
 * suitable for use in an `<img>` tag's `src` attribute.
 */
export function generateProfessionalAvatarDataUrl(
  opts: AvatarOptions
): string {
  const svg = generateProfessionalAvatar(opts);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}
