/**
 * Cognivibe AI - Digital Content Consumption & Real-Time Mood Intelligence Tracker
 * Automatically analyzes every visited page on load (extracts title, snippets, emotional tone)
 * and displays an ambient on-screen live mood pill in the bottom-right corner.
 * Strictly respects privacy: ignores banking, login, and sensitive domain credentials.
 */

(function () {
  'use strict';

  // Exclusion list for user privacy
  const EXCLUDED_DOMAINS = [
    'accounts.google.com', 'login.', 'signin.', 'bank', 'paypal.com', 'stripe.com',
    'chase.com', 'wellsfargo.com', 'hdfcbank.com', 'icicibank.com', 'sbi.co.in',
    'mail.google.com', 'outlook.live.com', 'chrome://', 'edge://', 'about:'
  ];

  const currentUrl = window.location.href;
  const currentHost = window.location.hostname.toLowerCase();

  // If excluded domain, abort tracking
  if (EXCLUDED_DOMAINS.some(domain => currentHost.includes(domain) || currentUrl.includes(domain))) {
    return;
  }

  let isTrackingEnabled = true;
  let isBadgeEnabled = true;
  let activeSeconds = 0;
  let distressingActiveSeconds = 0;
  let shieldNudgeDismissedUntil = 0;
  let breathingOverlayEl = null;
  let breathingInterval = null;
  let lastUserActivityTime = Date.now();
  let hasExtractedContent = false;
  let currentContentData = null;
  let latestClassification = null;
  let liveIndicatorContainer = null;
  let liveBadgeMode = 'pill'; // 'pill', 'expanded', 'bubble', 'closed'

  // Check storage for user preferences
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['cognivibe_autotrack', 'cognivibe_page_badge'], (res) => {
      if (res.cognivibe_autotrack !== undefined) {
        isTrackingEnabled = res.cognivibe_autotrack;
      }
      if (res.cognivibe_page_badge !== undefined) {
        isBadgeEnabled = res.cognivibe_page_badge;
        if (!isBadgeEnabled && liveIndicatorContainer) {
          liveIndicatorContainer.remove();
        }
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') {
        if (changes.cognivibe_autotrack) {
          isTrackingEnabled = changes.cognivibe_autotrack.newValue;
        }
        if (changes.cognivibe_page_badge) {
          isBadgeEnabled = changes.cognivibe_page_badge.newValue;
          if (!isBadgeEnabled && liveIndicatorContainer) {
            liveIndicatorContainer.remove();
          } else if (isBadgeEnabled && latestClassification) {
            renderLiveBadge();
          }
        }
      }
    });
  }

  // 1. User Activity Listener to prevent idle tab inflation
  function recordUserActivity() {
    lastUserActivityTime = Date.now();
  }
  window.addEventListener('mousemove', recordUserActivity, { passive: true });
  window.addEventListener('scroll', recordUserActivity, { passive: true });
  window.addEventListener('keydown', recordUserActivity, { passive: true });
  window.addEventListener('click', recordUserActivity, { passive: true });

  // 2. Content Extraction Engine
  function extractPageContent() {
    let title = document.title || '';
    let snippet = '';
    let platform = 'Web';
    let category = 'Other';

    // A. YouTube
    if (currentHost.includes('youtube.com')) {
      platform = 'YouTube';
      category = 'Entertainment';

      const ytTitleEl = document.querySelector('ytd-watch-metadata #title yt-formatted-string, h1.title yt-formatted-string, h1.ytd-video-primary-info-renderer');
      if (ytTitleEl && ytTitleEl.innerText.trim()) {
        title = ytTitleEl.innerText.trim();
      }

      const descEl = document.querySelector('#description-inline-expander, ytd-text-inline-expander');
      if (descEl) {
        snippet = descEl.innerText.substring(0, 400).trim();
      }

      if (/tutorial|learn|course|guide|lecture|explained|science|history|algorithm/i.test(title)) {
        category = 'Education';
      }
    }
    // B. Reddit
    else if (currentHost.includes('reddit.com')) {
      platform = 'Reddit';
      category = 'Social media';

      const redditTitle = document.querySelector('h1, shreddit-post[post-title], .Post h1');
      if (redditTitle) {
        title = redditTitle.getAttribute('post-title') || redditTitle.innerText.trim();
      }
      const postText = document.querySelector('[data-click-id="text"], shreddit-post div[slot="text-body"]');
      if (postText) {
        snippet = postText.innerText.substring(0, 400).trim();
      }
    }
    // C. Twitter / X
    else if (currentHost.includes('twitter.com') || currentHost.includes('x.com')) {
      platform = 'X/Twitter';
      category = 'Social media';

      const tweetEl = document.querySelector('article [data-testid="tweetText"]');
      if (tweetEl) {
        snippet = tweetEl.innerText.substring(0, 350).trim();
        title = `Tweet: "${snippet.substring(0, 60)}..."`;
      }
    }
    // D. Instagram
    else if (currentHost.includes('instagram.com')) {
      platform = 'Instagram';
      category = 'Social media';

      const captionEl = document.querySelector('article h1, article span._aacl');
      if (captionEl) {
        snippet = captionEl.innerText.substring(0, 300).trim();
      }
    }
    // E. News Websites & General Articles
    else {
      const isNews = /bbc|cnn|nytimes|theguardian|reuters|ndtv|thehindu|indianexpress|indiatoday|timesofindia|hindustantimes|aljazeera|bloomberg/i.test(currentHost);
      if (isNews || document.querySelector('meta[property="og:type"][content*="article"]')) {
        category = 'News & current affairs';
        platform = 'News';
      }

      const h1 = document.querySelector('h1');
      if (h1 && h1.innerText.trim().length > 5) {
        title = h1.innerText.trim();
      }

      const metaDesc = document.querySelector('meta[name="description"], meta[property="og:description"]');
      if (metaDesc && metaDesc.content) {
        snippet = metaDesc.content.trim();
      } else {
        const paragraphs = document.querySelectorAll('article p, main p, .article-body p, p');
        for (let i = 0; i < Math.min(paragraphs.length, 3); i++) {
          const t = paragraphs[i].innerText.trim();
          if (t.length > 30) {
            snippet += t + ' ';
            if (snippet.length > 350) break;
          }
        }
      }
    }

    title = title.replace(/\s+/g, ' ').trim();
    snippet = snippet.replace(/\s+/g, ' ').trim();

    return {
      title: title || 'Web Browsing',
      snippet: snippet || title,
      domain: currentHost,
      url: currentUrl.split('?')[0],
      platform: platform,
      category: category
    };
  }

  function getToneInfo(tone) {
    const t = (tone || 'neutral').toLowerCase();
    if (t === 'positive') return { label: 'Positive & Uplifting', dotClass: 'cognivibe-dot-positive', icon: '🟢' };
    if (t === 'negative') return { label: 'Distressing / Sensitive', dotClass: 'cognivibe-dot-negative', icon: '🟠' };
    if (t === 'mixed') return { label: 'Mixed Emotional', dotClass: 'cognivibe-dot-mixed', icon: '🟣' };
    return { label: 'Informative & Neutral', dotClass: 'cognivibe-dot-neutral', icon: '🔵' };
  }

  function formatSeconds(sec) {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }

  // ==========================================================================
  // COGNIVIBE DOOMSCROLLING SHIELD & 30-SECOND BREATHING BREAK (4-4-4-4 BOX)
  // ==========================================================================
  const BOX_PHASES = [
    { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', cls: 'cognivibe-orb-inhale', bg: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' },
    { name: 'Hold', duration: 4, instruction: 'Hold your breath gently. Relax your shoulders...', cls: 'cognivibe-orb-hold', bg: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
    { name: 'Exhale', duration: 4, instruction: 'Slowly release all tension through your mouth...', cls: 'cognivibe-orb-exhale', bg: 'linear-gradient(135deg, #0284c7, #6366f1)' },
    { name: 'Rest', duration: 4, instruction: 'Pause and let your body settle into calm...', cls: 'cognivibe-orb-rest', bg: 'linear-gradient(135deg, #64748b, #0ea5e9)' }
  ];

  function startBoxBreathing(triggerReason) {
    // Dismiss ambient nudge if active
    const existingNudge = document.getElementById('cognivibe-shield-nudge');
    if (existingNudge) existingNudge.remove();

    if (breathingOverlayEl) {
      breathingOverlayEl.remove();
      if (breathingInterval) clearInterval(breathingInterval);
    }

    breathingOverlayEl = document.createElement('div');
    breathingOverlayEl.id = 'cognivibe-breathing-overlay';
    document.body.appendChild(breathingOverlayEl);

    let phaseIndex = 0;
    let secondsLeft = 4;
    let cycle = 1;
    const totalCycles = 2; // 2 cycles = 32s (~30s box breathing reset)
    let isPaused = false;
    let isCompleted = false;

    function renderModal() {
      if (isCompleted) {
        breathingOverlayEl.innerHTML = `
          <div class="cognivibe-breathing-card">
            <button class="cognivibe-breathing-close" id="cognivibe-breath-close-btn" title="Close">✕</button>
            <div class="cognivibe-breathing-header-badge">
              <span>✓</span> Mindful Reset Complete
            </div>
            <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 6px 0;">
              Breath Complete. Well Done.
            </h2>
            <p style="font-size: 13px; color: #475569; line-height: 1.5; max-width: 340px; margin: 0 auto 20px auto;">
              You took a conscious 32-second pause to regulate your nervous system. Notice how your body feels right now before returning to browsing.
            </p>
            <div class="cognivibe-breathing-controls">
              <button class="cognivibe-ctrl-btn primary" id="cognivibe-breath-finish-btn">Return Grounded</button>
              <button class="cognivibe-ctrl-btn secondary" id="cognivibe-breath-restart-btn">Another Cycle</button>
            </div>
          </div>
        `;
        const closeBtn = document.getElementById('cognivibe-breath-close-btn');
        if (closeBtn) closeBtn.onclick = closeBreathingModal;
        const finishBtn = document.getElementById('cognivibe-breath-finish-btn');
        if (finishBtn) finishBtn.onclick = closeBreathingModal;
        const restartBtn = document.getElementById('cognivibe-breath-restart-btn');
        if (restartBtn) restartBtn.onclick = restartBreathing;
        return;
      }

      const p = BOX_PHASES[phaseIndex];
      breathingOverlayEl.innerHTML = `
        <div class="cognivibe-breathing-card">
          <button class="cognivibe-breathing-close" id="cognivibe-breath-close-btn" title="Close">✕</button>
          
          <div class="cognivibe-breathing-header-badge">
            <span>🌿</span> Cognivibe Doomscrolling Shield
          </div>
          
          <div class="cognivibe-breathing-reason">
            ${triggerReason || '30-Second Box Breathing Micro-Intervention'}
          </div>

          <div class="cognivibe-orb-stage">
            <div class="cognivibe-orb-glow ${p.cls}"></div>
            <div class="cognivibe-orb-dashed-guide ${p.cls}"></div>
            <div class="cognivibe-orb-circle ${p.cls}" style="background: ${p.bg};">
              <div class="cognivibe-orb-phase-name" id="cognivibe-orb-phase">${p.name}</div>
              <div class="cognivibe-orb-seconds" id="cognivibe-orb-sec">${secondsLeft}s</div>
            </div>
          </div>

          <div class="cognivibe-breathing-instruction" id="cognivibe-breath-instruction">
            ${p.instruction}
          </div>

          <div class="cognivibe-breathing-cycle-info" id="cognivibe-breath-cycle">
            Box Cycle ${cycle} of ${totalCycles} • (Inhale 4s → Hold 4s → Exhale 4s → Rest 4s)
          </div>

          <div class="cognivibe-breathing-controls">
            <button class="cognivibe-ctrl-btn secondary" id="cognivibe-breath-pause-btn">
              ${isPaused ? 'Resume' : 'Pause'}
            </button>
            <button class="cognivibe-ctrl-btn secondary" id="cognivibe-breath-reset-btn">
              Restart
            </button>
          </div>
        </div>
      `;

      const closeBtn = document.getElementById('cognivibe-breath-close-btn');
      if (closeBtn) closeBtn.onclick = closeBreathingModal;
      const pauseBtn = document.getElementById('cognivibe-breath-pause-btn');
      if (pauseBtn) pauseBtn.onclick = togglePause;
      const resetBtn = document.getElementById('cognivibe-breath-reset-btn');
      if (resetBtn) resetBtn.onclick = restartBreathing;
    }

    function updateLiveOrb() {
      const p = BOX_PHASES[phaseIndex];
      const secEl = document.getElementById('cognivibe-orb-sec');
      const phaseEl = document.getElementById('cognivibe-orb-phase');
      const instrEl = document.getElementById('cognivibe-breath-instruction');
      const cycleEl = document.getElementById('cognivibe-breath-cycle');
      const circleEl = document.querySelector('.cognivibe-orb-circle');
      const glowEl = document.querySelector('.cognivibe-orb-glow');
      const guideEl = document.querySelector('.cognivibe-orb-dashed-guide');

      if (secEl) secEl.textContent = `${secondsLeft}s`;
      if (phaseEl) phaseEl.textContent = p.name;
      if (instrEl) instrEl.textContent = p.instruction;
      if (cycleEl) cycleEl.textContent = `Box Cycle ${cycle} of ${totalCycles} • (Inhale 4s → Hold 4s → Exhale 4s → Rest 4s)`;

      if (circleEl) {
        circleEl.className = `cognivibe-orb-circle ${p.cls}`;
        circleEl.style.background = p.bg;
      }
      if (glowEl) glowEl.className = `cognivibe-orb-glow ${p.cls}`;
      if (guideEl) guideEl.className = `cognivibe-orb-dashed-guide ${p.cls}`;
    }

    function togglePause() {
      isPaused = !isPaused;
      const pauseBtn = document.getElementById('cognivibe-breath-pause-btn');
      if (pauseBtn) pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    }

    function restartBreathing() {
      phaseIndex = 0;
      secondsLeft = 4;
      cycle = 1;
      isPaused = false;
      isCompleted = false;
      renderModal();
    }

    function closeBreathingModal() {
      if (breathingInterval) clearInterval(breathingInterval);
      if (breathingOverlayEl) {
        breathingOverlayEl.remove();
        breathingOverlayEl = null;
      }
    }

    renderModal();

    if (breathingInterval) clearInterval(breathingInterval);
    breathingInterval = setInterval(() => {
      if (isPaused || isCompleted) return;

      secondsLeft -= 1;
      if (secondsLeft > 0) {
        updateLiveOrb();
      } else {
        if (phaseIndex === BOX_PHASES.length - 1) {
          if (cycle >= totalCycles) {
            isCompleted = true;
            clearInterval(breathingInterval);
            renderModal();
            return;
          } else {
            cycle += 1;
            phaseIndex = 0;
          }
        } else {
          phaseIndex += 1;
        }
        secondsLeft = 4;
        updateLiveOrb();
      }
    }, 1000);
  }

  function triggerDoomscrollingNudge(minutes) {
    if (!isBadgeEnabled) return;
    if (Date.now() < shieldNudgeDismissedUntil) return;
    if (document.getElementById('cognivibe-shield-nudge')) return;
    if (breathingOverlayEl) return;

    const topic = latestClassification?.topic || latestClassification?.category || 'Sensitive Topic';

    const nudge = document.createElement('div');
    nudge.id = 'cognivibe-shield-nudge';
    nudge.innerHTML = `
      <div class="cognivibe-nudge-badge">
        <span>🌿</span> A Gentle Moment For You • 20m Mindful Shield
      </div>
      <div class="cognivibe-nudge-topic">
        Detected topic: <strong>${topic}</strong>
      </div>
      <div class="cognivibe-nudge-text">
        You've been reading heavy content for ${minutes} minutes. Please remember to be gentle with yourself. You don't have to carry the weight of everything you read online right now.
      </div>
      <div class="cognivibe-nudge-quote">
        "You are allowed to step back, take a soft breath, and let your mind rest."
      </div>
      <div class="cognivibe-nudge-actions">
        <button id="cognivibe-nudge-breathe-btn" class="cognivibe-nudge-btn primary">🌿 Take 30s Breath</button>
        <button id="cognivibe-nudge-journal-btn" class="cognivibe-nudge-btn secondary">✍️ Write How I Feel</button>
        <button id="cognivibe-nudge-helpline-btn" class="cognivibe-nudge-btn tertiary">📞 Helplines</button>
        <button id="cognivibe-nudge-dismiss-btn" class="cognivibe-nudge-btn ghost">Maybe later</button>
      </div>
      <div id="cognivibe-nudge-helpline-box" style="display: none; margin-top: 10px; padding: 10px; background: rgba(20, 184, 166, 0.15); border: 1px solid rgba(45, 212, 191, 0.4); border-radius: 12px; font-size: 11px;">
        <strong style="color: #5eead4;">24x7 Free & Confidential India Helplines:</strong>
        <div style="margin-top: 4px; color: #e0f2fe;">• <strong>Tele-MANAS:</strong> 14416 / 1800-891-4416</div>
        <div style="color: #e0f2fe;">• <strong>KIRAN:</strong> 1800-599-0019</div>
        <div style="color: #e0f2fe;">• <strong>Vandrevala Foundation:</strong> 9999 666 555</div>
      </div>
    `;

    document.body.appendChild(nudge);

    const breatheBtn = document.getElementById('cognivibe-nudge-breathe-btn');
    if (breatheBtn) {
      breatheBtn.onclick = () => {
        nudge.remove();
        startBoxBreathing(`Doomscrolling Shield: Regulating stress after ${minutes} minutes of heavy reading.`);
      };
    }

    const journalBtn = document.getElementById('cognivibe-nudge-journal-btn');
    if (journalBtn) {
      journalBtn.onclick = () => {
        nudge.remove();
        window.open('http://localhost:5173', '_blank');
      };
    }

    const helplineBtn = document.getElementById('cognivibe-nudge-helpline-btn');
    if (helplineBtn) {
      helplineBtn.onclick = () => {
        const box = document.getElementById('cognivibe-nudge-helpline-box');
        if (box) {
          box.style.display = box.style.display === 'none' ? 'block' : 'none';
        }
      };
    }

    const dismissBtn = document.getElementById('cognivibe-nudge-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        shieldNudgeDismissedUntil = Date.now() + 15 * 60 * 1000; // Snooze for 15 mins
        nudge.remove();
      };
    }
  }

  // 3. Render Floating Live Page Mood Badge
  function renderLiveBadge() {
    if (!isBadgeEnabled || liveBadgeMode === 'closed' || !latestClassification) return;

    if (!liveIndicatorContainer) {
      liveIndicatorContainer = document.createElement('div');
      liveIndicatorContainer.id = 'cognivibe-live-indicator';
      document.body.appendChild(liveIndicatorContainer);
    }

    const toneInfo = getToneInfo(latestClassification.emotional_tone);
    const topic = latestClassification.topic || latestClassification.category || 'General';
    const constructiveness = latestClassification.constructiveness || 'Informative';
    const isDistressing = latestClassification.is_distressing === 1;

    // A. Bubble Mode
    if (liveBadgeMode === 'bubble') {
      liveIndicatorContainer.innerHTML = `
        <div class="cognivibe-bubble" title="Cognivibe AI: Click to open live page mood breakdown">
          <span>🧠</span>
        </div>
      `;
      const bubble = liveIndicatorContainer.querySelector('.cognivibe-bubble');
      if (bubble) {
        bubble.onclick = () => {
          liveBadgeMode = 'pill';
          renderLiveBadge();
        };
      }
      return;
    }

    // B. Expanded Card Mode
    if (liveBadgeMode === 'expanded') {
      liveIndicatorContainer.innerHTML = `
        <div class="cognivibe-expanded-card">
          <div class="cognivibe-card-header">
            <div class="cognivibe-brand-title">
              <span>🧠</span> Cognivibe AI Live Intelligence
            </div>
            <div class="cognivibe-pill-actions">
              <button class="cognivibe-action-icon" id="cognivibe-collapse-btn" title="Collapse">▾</button>
              <button class="cognivibe-action-icon" id="cognivibe-close-btn" title="Dismiss">✕</button>
            </div>
          </div>

          <div class="cognivibe-page-title" title="${currentContentData?.title || ''}">
            ${currentContentData?.title || 'Web Browsing'}
          </div>

          <div class="cognivibe-meta-row">
            <div class="cognivibe-meta-item">
              <div class="cognivibe-meta-label">Emotional Tone</div>
              <div class="cognivibe-meta-val" style="display:flex;align-items:center;gap:4px;">
                <span class="cognivibe-pill-dot ${toneInfo.dotClass}"></span>
                <span>${(latestClassification.emotional_tone || 'Neutral').toUpperCase()}</span>
              </div>
            </div>
            <div class="cognivibe-meta-item">
              <div class="cognivibe-meta-label">Topic / Focus</div>
              <div class="cognivibe-meta-val">${topic}</div>
            </div>
            <div class="cognivibe-meta-item">
              <div class="cognivibe-meta-label">Nature</div>
              <div class="cognivibe-meta-val">${constructiveness}</div>
            </div>
            <div class="cognivibe-meta-item">
              <div class="cognivibe-meta-label">Distress Risk</div>
              <div class="cognivibe-meta-val" style="color: ${isDistressing ? '#e11d48' : '#059669'};">
                ${isDistressing ? '⚠️ Flagged' : '✓ Low'}
              </div>
            </div>
          </div>

          <div class="cognivibe-timer-row">
            <span>⏱ Active: <strong id="cognivibe-active-timer">${formatSeconds(activeSeconds)}</strong></span>
            <a href="http://localhost:5173/consumption" target="_blank" class="cognivibe-dashboard-link">Open Dashboard ↗</a>
          </div>

          <button class="cognivibe-ctrl-btn primary" id="cognivibe-card-breathe-btn" style="width: 100%; margin-top: 10px;">
            🌿 Take 30s Mindful Breath
          </button>
        </div>
      `;

      const cardBreatheBtn = document.getElementById('cognivibe-card-breathe-btn');
      if (cardBreatheBtn) {
        cardBreatheBtn.onclick = (e) => {
          e.stopPropagation();
          startBoxBreathing('Mindful Reset from Cognivibe Live Inspector');
        };
      }

      const collapseBtn = document.getElementById('cognivibe-collapse-btn');
      if (collapseBtn) {
        collapseBtn.onclick = (e) => {
          e.stopPropagation();
          liveBadgeMode = 'pill';
          renderLiveBadge();
        };
      }
      const closeBtn = document.getElementById('cognivibe-close-btn');
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          liveBadgeMode = 'closed';
          if (liveIndicatorContainer) liveIndicatorContainer.remove();
        };
      }
      return;
    }

    // C. Default Pill Mode
    liveIndicatorContainer.innerHTML = `
      <div class="cognivibe-pill" title="Click to view live page mood details">
        <span class="cognivibe-pill-dot ${toneInfo.dotClass}"></span>
        <span class="cognivibe-pill-text">
          <span>Cognivibe AI:</span>
          <span>${toneInfo.label}</span>
        </span>
        <span class="cognivibe-pill-sub">${topic}</span>
        <button class="cognivibe-breathe-trigger" id="cognivibe-pill-breathe-btn" title="Take a gentle 30-second box breathing reset">🌿 30s Breath</button>
        <div class="cognivibe-pill-actions">
          <button class="cognivibe-action-icon" id="cognivibe-expand-btn" title="Expand breakdown">▴</button>
          <button class="cognivibe-action-icon" id="cognivibe-min-btn" title="Minimize to icon">—</button>
          <button class="cognivibe-action-icon" id="cognivibe-close-pill-btn" title="Dismiss">✕</button>
        </div>
      </div>
    `;

    const pillBreatheBtn = document.getElementById('cognivibe-pill-breathe-btn');
    if (pillBreatheBtn) {
      pillBreatheBtn.onclick = (e) => {
        e.stopPropagation();
        startBoxBreathing('Mindful Reset from Cognivibe Live Pill');
      };
    }

    const expandBtn = document.getElementById('cognivibe-expand-btn');
    if (expandBtn) {
      expandBtn.onclick = (e) => {
        e.stopPropagation();
        liveBadgeMode = 'expanded';
        renderLiveBadge();
      };
    }
    const minBtn = document.getElementById('cognivibe-min-btn');
    if (minBtn) {
      minBtn.onclick = (e) => {
        e.stopPropagation();
        liveBadgeMode = 'bubble';
        renderLiveBadge();
      };
    }
    const closePillBtn = document.getElementById('cognivibe-close-pill-btn');
    if (closePillBtn) {
      closePillBtn.onclick = (e) => {
        e.stopPropagation();
        liveBadgeMode = 'closed';
        if (liveIndicatorContainer) liveIndicatorContainer.remove();
      };
    }
  }

  // 4. Send Consumption Log via Background Proxy
  function sendConsumptionData(seconds, callback) {
    if (!currentContentData) {
      currentContentData = extractPageContent();
    }
    if (!currentContentData) return;

    const payload = {
      title: currentContentData.title,
      text: currentContentData.snippet,
      domain: currentContentData.domain,
      url: currentContentData.url,
      platform: currentContentData.platform,
      category: currentContentData.category,
      time_spent_seconds: seconds
    };

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({
          action: 'log_consumption',
          payload: payload
        }, (res) => {
          if (callback) callback(res);
        });
      } catch (e) {}
    }
  }

  // 5. Automatic Instant Page Analysis on Load (1.2 seconds after DOM loads)
  setTimeout(() => {
    if (!isTrackingEnabled) return;
    currentContentData = extractPageContent();
    hasExtractedContent = true;

    sendConsumptionData(1, (res) => {
      if (res && res.success && res.data && res.data.items && res.data.items.length > 0) {
        latestClassification = res.data.items[0];
        renderLiveBadge();
      }
    });
  }, 1200);

  // 6. Periodic Active Time Accumulator (Every 1 second)
  setInterval(() => {
    if (!isTrackingEnabled) return;

    const isVisible = document.visibilityState === 'visible';
    const hasFocus = document.hasFocus();
    const isRecentlyActive = (Date.now() - lastUserActivityTime) < 45000;

    if (isVisible && hasFocus && isRecentlyActive) {
      activeSeconds += 1;

      // Update timer inside expanded card if open
      const timerEl = document.getElementById('cognivibe-active-timer');
      if (timerEl) {
        timerEl.textContent = formatSeconds(activeSeconds);
      }

      // Sync active reading time in chunks of 30 seconds
      if (activeSeconds > 0 && activeSeconds % 30 === 0) {
        sendConsumptionData(30);
      }

      // Doomscrolling Shield: Monitor exposure to distressing / negative content
      if (latestClassification && (latestClassification.is_distressing === 1 || latestClassification.emotional_tone === 'negative')) {
        distressingActiveSeconds += 1;
        // Trigger gentle ambient nudge at 15 minutes (900s) or at 60s for demo/viva testing
        if (distressingActiveSeconds === 60 || distressingActiveSeconds === 900 || (distressingActiveSeconds > 900 && distressingActiveSeconds % 900 === 0)) {
          const mins = Math.max(1, Math.round(distressingActiveSeconds / 60));
          triggerDoomscrollingNudge(mins);
        }
      }
    }
  }, 1000);

  // 7. Sync on Tab Unload or Visibility Change
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden' && activeSeconds >= 3) {
      sendConsumptionData(activeSeconds % 30 || 3);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', () => {
    if (activeSeconds >= 3) {
      sendConsumptionData(activeSeconds % 30 || 3);
    }
  });

  // 8. Runtime message listener for popup actions
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === 'start_breathing') {
        startBoxBreathing(req.reason || 'Gentle 30-Second Box Breathing Reset');
        sendResponse({ success: true });
      }
      if (req.action === 'trigger_shield_test') {
        triggerDoomscrollingNudge(18);
        sendResponse({ success: true });
      }
    });
  }

})();
