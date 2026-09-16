// ─────────────────────────────────────────────────────────────────────────────
// FLIPBOOK — StPageFlip realistic book (click edge or swipe to turn)
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
  const el = document.getElementById('flipbook');
  if (!el || typeof St === 'undefined') return;

  const pageFlip = new St.PageFlip(el, {
    width:         400,      // exactly matches aspect ratio (857x1024)
    height:        478,
    size:          'fixed',
    minWidth:      200,
    maxWidth:      450,
    minHeight:     239,
    maxHeight:     538,
    startPage:     0,
    drawShadow:    true,
    flippingTime:  750,
    usePortrait:   false,   // always show 2-page landscape spread
    startZIndex:   0,
    autoSize:      true,
    maxShadowOpacity: 0.5,
    showCover:     true,    // treats first & last pages as hard covers
    mobileScrollSupport: true,
    swipeDistance: 30,
    clickEventForward: true,
    useMouseEvents: true,
  });

  pageFlip.loadFromHTML(document.querySelectorAll("#flipbook .page"));
  el.classList.add("is-initialized");

  // Center the book dynamically:
  // Front cover is drawn on the right half. Shift left by 25% to center it.
  // Back cover is drawn on the left half. Shift right by 25% to center it.
  // Inner spreads take up the full wrapper. Shift is 0%.
  const wrap = document.querySelector('.flipbook-wrap');
  wrap.style.transform = 'translateX(-25%)'; // start at front cover

  // Trigger the slide the instant the user starts interacting (drag or click)
  pageFlip.on('changeState', (e) => {
    if (e.data === 'user_fold' || e.data === 'flipping') {
      const currentPage = pageFlip.getCurrentPageIndex();
      if (currentPage === 0) {
        wrap.style.transform = 'translateX(0%)'; // opening front cover
      } else if (currentPage >= 10) {
        wrap.style.transform = 'translateX(0%)'; // opening back cover backward
      }
    }
  });

  // Final settle check when flip commits
  pageFlip.on('flip', (e) => {
    if (e.data === 0) {
      wrap.style.transform = 'translateX(-25%)'; // Front cover
    } else if (e.data >= 10) {
      // 12 pages total (0 to 11). The last page event might return 10 or 11.
      wrap.style.transform = 'translateX(25%)';  // Back cover
    } else {
      wrap.style.transform = 'translateX(0%)';      // Inner spread
    }
  });

  // Trigger a subtle wiggle after a few seconds to show it's interactive
  setTimeout(() => {
    // Only wiggle if they haven't already interacted (still on cover)
    if (pageFlip.getCurrentPageIndex() === 0) {
      el.classList.add('book-wiggle');
      setTimeout(() => el.classList.remove('book-wiggle'), 1000);
    }
  }, 2500);
});




/**
 * openNotifyModal(context)
 * context = 'android' | 'book' | default
 * Customises modal title/description based on what the user clicked.
 */
function openNotifyModal(context) {
  const icon  = document.getElementById('modal-icon');
  const title = document.getElementById('modal-title');
  const desc  = document.getElementById('modal-desc');

  if (context === 'android') {
    icon.textContent  = '🤖';
    title.textContent = 'Android Is Coming';
    desc.textContent  = "We're working on the Google Play version. Drop your email and you'll be the first to know when it launches.";
  } else if (context === 'book') {
    icon.textContent  = '📖';
    title.textContent = 'New Book Coming Soon';
    desc.textContent  = "Enter your email to get notified the moment this is available — plus an exclusive early-access discount.";
  } else {
    icon.textContent  = '🌑';
    title.textContent = 'Coming Soon';
    desc.textContent  = "Enter your email and we'll let you know the moment it's available.";
  }

  // Reset form state from any previous open
  document.getElementById('modal-success').style.display = 'none';
  document.getElementById('modal-form').style.display    = '';
  document.getElementById('modal-form').reset();
  const btn = document.getElementById('modal-btn');
  btn.textContent = 'Notify Me';
  btn.disabled    = false;

  document.getElementById('modal-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('modal-email')?.focus(), 320);
}

// Keep old openModal() alias so "Notify Me" buttons still work
function openModal() { openNotifyModal('book'); }

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function handleBgClick(e) {
  if (e.target === document.getElementById('modal-bg')) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─────────────────────────────────────────────────────────────────────────────
// FORM SUBMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

function handleModalSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('modal-email').value.trim();
  if (!email) return;

  const btn = document.getElementById('modal-btn');
  btn.textContent = 'Saving…';
  btn.disabled    = true;

  fetch("https://1uw0j.mjt.lu/wgt/1uw0j/09m3/subscribe?c=d37bf206", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email, Fields: [] })
  }).then(() => {
    document.getElementById('modal-form').style.display = 'none';
    document.getElementById('modal-success').style.display = 'block';
    setTimeout(closeModal, 2600);
  }).catch(() => {
    btn.textContent = 'Error';
    setTimeout(() => {
      btn.textContent = 'Notify Me';
      btn.disabled = false;
    }, 2000);
  });
}

function handleSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('nl-email').value.trim();
  if (!email) return;

  const btn = document.getElementById('nl-submit');
  btn.textContent = '…';
  btn.disabled    = true;

  // ── TODO: Replace with your real newsletter signup API call ──
  setTimeout(() => {
    document.getElementById('nl-form').style.display    = 'none';
    document.getElementById('nl-success').style.display = 'block';
  }, 900);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL — fade-up on enter viewport
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll(
    '.product-card, .section-header, .hero-inner, .newsletter-inner, .download-group, .platform-note, .hero-divider'
  );

  targets.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger cards in the same grid
        const delay = entry.target.classList.contains('product-card') ? i * 60 : 0;
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => obs.observe(el));
});
