'use strict';

const BaseImageProvider = require('./provider');

/**
 * fallbackImageProvider.js
 *
 * Procedural Cover Artwork Generator.
 * Generates beautiful high-resolution SVG artwork Data URLs with custom style-tailored palettes,
 * soft lighting gradients, typography accents, and organic patterns.
 */
class FallbackImageProvider extends BaseImageProvider {
  get name() {
    return 'fallback';
  }

  isConfigured() {
    return true; // Fallback is always available
  }

  async generateImage(prompt, options = {}) {
    const style = options.style || 'Classic Memoir';
    const title = options.title || 'Story Book';
    const subtitle = options.subtitle || 'Memories & Reflection';

    const svgDataUrl = this._createSvgCover(style, title, subtitle);

    return {
      imageUrl: svgDataUrl,
      thumbnailUrl: svgDataUrl,
      provider: 'StoryNest Canvas (Fallback)',
      model: 'procedural-art-v1'
    };
  }

  _createSvgCover(style, title, subtitle) {
    const PALETTES = {
      'Classic Memoir': { bg: ['#2c221e', '#523a31', '#1a1310'], text: '#f3e8d7', accent: '#d4af37', pattern: 'classic' },
      'Vintage Album': { bg: ['#3e3529', '#63533e', '#231d16'], text: '#f5edd6', accent: '#c49a45', pattern: 'vintage' },
      'Minimalist': { bg: ['#1e232a', '#343c47', '#121519'], text: '#f8fafc', accent: '#94a3b8', pattern: 'minimalist' },
      'Watercolor': { bg: ['#2b3a4a', '#4a6785', '#192430'], text: '#f0f7ff', accent: '#e8a598', pattern: 'watercolor' },
      'Modern Hardcover': { bg: ['#1a2e26', '#2d4e41', '#0d1814'], text: '#e6f4ed', accent: '#5eead4', pattern: 'modern' },
      "Children's Storybook": { bg: ['#4a2637', '#7c3f5d', '#2b141f'], text: '#fff0f5', accent: '#f472b6', pattern: 'storybook' },
      'Handwritten Journal': { bg: ['#3b2f2f', '#5e4b4b', '#241a1a'], text: '#faefeb', accent: '#fb923c', pattern: 'journal' }
    };

    const p = PALETTES[style] || PALETTES['Classic Memoir'];

    const escapedTitle = this._escapeXml(title);
    const escapedSubtitle = this._escapeXml(subtitle);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg[0]}"/>
      <stop offset="50%" stop-color="${p.bg[1]}"/>
      <stop offset="100%" stop-color="${p.bg[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="600" height="900" fill="url(#bgGrad)"/>

  <!-- Ambient Glow -->
  <circle cx="300" cy="380" r="280" fill="url(#glow)"/>

  <!-- Artistic Pattern Elements -->
  ${this._getPatternElements(p.pattern, p.accent)}

  <!-- Decorative Outer Frame -->
  <rect x="30" y="30" width="540" height="840" rx="12" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.35"/>
  <rect x="42" y="42" width="516" height="816" rx="8" fill="none" stroke="${p.accent}" stroke-width="0.75" stroke-opacity="0.2"/>

  <!-- Spine Highlight Bar -->
  <rect x="0" y="0" width="18" height="900" fill="#ffffff" fill-opacity="0.04"/>
  <line x1="18" y1="0" x2="18" y2="900" stroke="#000000" stroke-opacity="0.25" stroke-width="2"/>

  <!-- Typography Content -->
  <g text-anchor="middle" filter="url(#shadow)">
    <!-- Category / Sub-header -->
    <text x="300" y="140" fill="${p.accent}" font-family="Georgia, serif" font-size="14" letter-spacing="6" font-weight="bold" opacity="0.95">
      STORYNEST MEMOIR
    </text>

    <!-- Main Title -->
    <text x="300" y="340" fill="${p.text}" font-family="Georgia, serif" font-size="38" font-weight="bold" letter-spacing="1.5">
      ${escapedTitle.slice(0, 24)}
    </text>
    ${escapedTitle.length > 24 ? `<text x="300" y="390" fill="${p.text}" font-family="Georgia, serif" font-size="34" font-weight="bold" letter-spacing="1.5">${escapedTitle.slice(24, 50)}</text>` : ''}

    <!-- Divider Line -->
    <line x1="220" y1="440" x2="380" y2="440" stroke="${p.accent}" stroke-width="2" opacity="0.6"/>
    <circle cx="300" cy="440" r="4" fill="${p.accent}"/>

    <!-- Subtitle -->
    <text x="300" y="490" fill="${p.text}" font-family="Georgia, serif" font-size="16" font-style="italic" opacity="0.85">
      ${escapedSubtitle.slice(0, 42)}
    </text>

    <!-- Style Badge Footnote -->
    <text x="300" y="760" fill="${p.accent}" font-family="sans-serif" font-size="12" letter-spacing="4" font-weight="600" opacity="0.9">
      ✦ ${style.toUpperCase()} EDITION ✦
    </text>
    <text x="300" y="790" fill="${p.text}" font-family="Georgia, serif" font-size="13" font-style="italic" opacity="0.7">
      Crafted with AI Art Studio
    </text>
  </g>
</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  _getPatternElements(pattern, accent) {
    switch (pattern) {
      case 'classic':
        return `<g opacity="0.25">
          <circle cx="300" cy="380" r="160" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="8 6"/>
          <polygon points="300,240 320,380 300,520 280,380" fill="${accent}" opacity="0.3"/>
        </g>`;
      case 'vintage':
        return `<g opacity="0.2">
          <rect x="180" y="240" width="240" height="280" fill="none" stroke="${accent}" stroke-width="2" rx="16"/>
          <circle cx="300" cy="380" r="90" fill="none" stroke="${accent}" stroke-width="1"/>
        </g>`;
      case 'minimalist':
        return `<g opacity="0.3">
          <line x1="120" y1="200" x2="480" y2="560" stroke="${accent}" stroke-width="1"/>
          <circle cx="300" cy="380" r="8" fill="${accent}"/>
        </g>`;
      case 'watercolor':
        return `<g opacity="0.35">
          <path d="M 200,320 Q 300,220 400,320 T 200,440 Z" fill="${accent}"/>
          <path d="M 180,380 Q 300,480 420,380 T 180,320 Z" fill="${accent}" opacity="0.5"/>
        </g>`;
      case 'modern':
        return `<g opacity="0.25">
          <polygon points="140,180 460,180 300,580" fill="none" stroke="${accent}" stroke-width="2"/>
          <rect x="220" y="300" width="160" height="160" fill="${accent}" opacity="0.15"/>
        </g>`;
      case 'storybook':
        return `<g opacity="0.3">
          <circle cx="240" cy="320" r="30" fill="${accent}"/>
          <circle cx="360" cy="340" r="45" fill="${accent}" opacity="0.7"/>
          <circle cx="290" cy="420" r="25" fill="${accent}" opacity="0.8"/>
        </g>`;
      case 'journal':
        return `<g opacity="0.25">
          <path d="M 150,250 C 250,180 350,300 450,220" fill="none" stroke="${accent}" stroke-width="2"/>
          <path d="M 150,550 C 250,620 350,500 450,580" fill="none" stroke="${accent}" stroke-width="2"/>
        </g>`;
      default:
        return '';
    }
  }

  _escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

module.exports = FallbackImageProvider;
