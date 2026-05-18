let brandLogoCounter = 0;
const createBrandLogoSvg = (seed) => `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" class="brand-logo__svg" role="img">
  <defs>
    <linearGradient id="yjLogoGradient-${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#eef2ff" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#yjLogoGradient-${seed})" stroke-width="4" opacity="0.65" />
  <path d="M28 28 L44 46 L50 40 L56 46 L72 28" fill="none" stroke="url(#yjLogoGradient-${seed})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M44 46 L44 66" fill="none" stroke="url(#yjLogoGradient-${seed})" stroke-width="5" stroke-linecap="round" />
  <path d="M56 46 L56 62 C56 72 46 72 46 72" fill="none" stroke="url(#yjLogoGradient-${seed})" stroke-width="5" stroke-linecap="round" />
</svg>`;

const brandLogoMarkup = (options = {}) => {
  const compact = options.compact || false;
  const title = options.title || 'YJ';
  const subtitle = options.subtitle || 'Watches';
  const logoSvg = createBrandLogoSvg(brandLogoCounter++);
  return `
    <a class="brand-logo${compact ? ' brand-logo--compact' : ''}" href="Home.html" aria-label="YJ Watches Home">
      <span class="brand-logo__icon">${logoSvg}</span>
      <span class="brand-logo__copy">
        <span class="brand-logo__title">${title}</span>
        ${compact ? '' : `<span class="brand-logo__subtitle">${subtitle}</span>`}
      </span>
    </a>
  `.trim();
};

function injectBrandStyles() {
  if (document.getElementById('brand-logo-styles')) return;

  const style = document.createElement('style');
  style.id = 'brand-logo-styles';
  style.textContent = `
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
      color: #f8fbff;
      text-decoration: none;
      transition: transform 0.28s ease, filter 0.28s ease, opacity 0.28s ease;
      letter-spacing: 0.08em;
      will-change: transform;
    }

    .brand-logo:hover,
    .brand-logo:focus-visible {
      transform: translateY(-1px);
      filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.45));
    }

    .brand-logo__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      min-width: 48px;
      height: 48px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.06);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 10px 30px rgba(56, 189, 248, 0.08);
      backdrop-filter: blur(16px);
    }

    .brand-logo__svg {
      width: 38px;
      height: 38px;
      display: block;
      color: #eef2ff;
    }

    .brand-logo__title {
      display: block;
      font-family: 'Orbitron', sans-serif;
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      color: #f8fbff;
    }

    .brand-logo__subtitle {
      display: block;
      font-family: 'Poppins', sans-serif;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #9bb7ff;
      margin-top: 2px;
    }

    .brand-logo--compact {
      gap: 0.6rem;
    }

    .brand-logo--compact .brand-logo__copy {
      display: none;
    }

    .brand-logo--centered {
      justify-content: center;
      margin: 0 auto;
    }

    .brand-logo--centered .brand-logo__icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
    }

    .logo {
      display: inline-block;
    }

    .logo .brand-logo,
    .cart-logo .brand-logo,
    .footer-brand h2 .brand-logo,
    .terms-header h1 .brand-logo {
      font-size: inherit;
    }

    .hero-brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.6rem 0.95rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(14px);
      color: #e2e8f0;
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      animation: hero-badge-appear 0.7s ease both;
      margin-bottom: 1.4rem;
    }

    .hero-brand-badge::before {
      content: 'YJ';
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.26), rgba(59, 130, 246, 0.05));
      color: #ffffff;
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      letter-spacing: 0.2em;
    }

    @keyframes hero-badge-appear {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .brand-logo {
        gap: 0.5rem;
      }
      .brand-logo__icon {
        width: 40px;
        height: 40px;
      }
      .brand-logo__title {
        font-size: 16px;
      }
      .hero-brand-badge {
        font-size: 11px;
        gap: 0.5rem;
      }
    }
  `;
  document.head.appendChild(style);
}

function upgradeBrandElements() {
  document.querySelectorAll('.logo').forEach(el => {
    if (el.querySelector('.brand-logo')) return;
    el.innerHTML = brandLogoMarkup();
  });

  document.querySelectorAll('.cart-logo').forEach(el => {
    if (el.querySelector('.brand-logo')) return;
    el.innerHTML = brandLogoMarkup({ compact: true });
  });

  const footerTitle = document.querySelector('.footer-brand h2');
  if (footerTitle && !footerTitle.querySelector('.brand-logo')) {
    footerTitle.innerHTML = brandLogoMarkup({ compact: true });
  }

  const termsHeader = document.querySelector('.terms-header h1');
  if (termsHeader && termsHeader.textContent.trim().toUpperCase() === 'YJ WATCHES') {
    termsHeader.innerHTML = `<a class="brand-logo brand-logo--centered" href="Home.html" aria-label="YJ Watches Home">${brandLogoSvg}<span class="brand-logo__copy"><span class="brand-logo__title">YJ Watches</span></span></a>`;
  }
}

function insertHeroBadge() {
  const heroColumn = document.querySelector('.hero-text-col');
  if (!heroColumn || heroColumn.querySelector('.hero-brand-badge')) return;
  const badge = document.createElement('div');
  badge.className = 'hero-brand-badge';
  badge.textContent = 'Luxury Timepieces';
  const eyebrow = heroColumn.querySelector('.hero-eyebrow');
  if (eyebrow) {
    eyebrow.insertAdjacentElement('afterend', badge);
  } else {
    heroColumn.prepend(badge);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  injectBrandStyles();
  upgradeBrandElements();
  insertHeroBadge();
});
