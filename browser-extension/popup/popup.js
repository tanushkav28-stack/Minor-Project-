/**
 * Cognivibe AI - Personal Mindful Wellness Companion Popup Script
 */

const API_BASE = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', () => {
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');

  // Wellbeing elements
  const wbTime = document.getElementById('wb-time');
  const wbItems = document.getElementById('wb-items');
  const wbBarPos = document.getElementById('wb-bar-pos');
  const wbBarNeu = document.getElementById('wb-bar-neu');
  const wbBarNeg = document.getElementById('wb-bar-neg');
  const wbPosPct = document.getElementById('wb-pos-pct');
  const wbNeuPct = document.getElementById('wb-neu-pct');
  const wbNegPct = document.getElementById('wb-neg-pct');

  // Mood buttons
  const moodBtns = document.querySelectorAll('.mood-btn');
  const moodFeedback = document.getElementById('mood-feedback');

  // Breathe & Shield test
  const btnPopupBreathe = document.getElementById('btn-popup-breathe');
  const btnPopupShieldTest = document.getElementById('btn-popup-shield-test');

  // Settings & Pairing
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsPanel = document.getElementById('settings-panel');
  const tokenInput = document.getElementById('token-input');
  const btnSaveToken = document.getElementById('btn-save-token');
  const pairStatus = document.getElementById('pair-status');

  // Check backend status
  fetch(`${API_BASE}`, { cache: 'no-store' })
    .then((res) => res.json())
    .then(() => {
      if (statusText) statusText.textContent = 'Protected';
      if (statusPill) statusPill.className = 'status-badge';
    })
    .catch(() => {
      if (statusText) statusText.textContent = 'Offline';
      if (statusPill) statusPill.className = 'status-badge offline';
    });

  // Settings panel toggle
  if (btnToggleSettings && settingsPanel) {
    btnToggleSettings.addEventListener('click', () => {
      const isHidden = settingsPanel.style.display === 'none';
      settingsPanel.style.display = isHidden ? 'block' : 'none';
    });
  }

  // Load saved token & fetch today's wellbeing metrics
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['cognivibe_token'], (res) => {
      if (res.cognivibe_token) {
        if (tokenInput) tokenInput.value = res.cognivibe_token;
        if (pairStatus) {
          pairStatus.textContent = '✓ Active token: ' + res.cognivibe_token.substring(0, 10) + '...';
          pairStatus.style.color = '#2F5E54';
        }
        loadTodaySummary();
      } else {
        // Defaults if no token is paired yet
        if (wbTime) wbTime.textContent = '4h 39m';
        if (wbItems) wbItems.textContent = '145 items analysed';
      }
    });
  }

  // Fetch today's summary from background worker or backend
  function loadTodaySummary() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'get_today_summary' }, (response) => {
        if (response && response.success && response.data) {
          const d = response.data;
          if (wbTime) wbTime.textContent = d.total_consumption_formatted || '4h 39m';
          if (wbItems) wbItems.textContent = `${d.total_items_analyzed || 145} items analysed`;

          const dist = d.emotional_distribution || {};
          const pos = dist.positive_pct !== undefined ? dist.positive_pct : 32;
          const neu = dist.neutral_pct !== undefined ? dist.neutral_pct : 44;
          const neg = dist.negative_pct !== undefined ? dist.negative_pct : 24;

          if (wbBarPos) wbBarPos.style.width = `${pos}%`;
          if (wbBarNeu) wbBarNeu.style.width = `${neu}%`;
          if (wbBarNeg) wbBarNeg.style.width = `${neg}%`;

          if (wbPosPct) wbPosPct.textContent = `${pos}%`;
          if (wbNeuPct) wbNeuPct.textContent = `${neu}%`;
          if (wbNegPct) wbNegPct.textContent = `${neg}%`;

          if (d.mood_checkin && d.mood_checkin.mood) {
            const m = d.mood_checkin.mood.toLowerCase();
            moodBtns.forEach((btn) => {
              if (btn.getAttribute('data-mood') === m) {
                btn.classList.add('active');
              }
            });
            if (moodFeedback) {
              moodFeedback.textContent = `Today's check-in: Feeling ${m}.`;
              moodFeedback.style.display = 'block';
            }
          }
        }
      });
    }
  }

  // Mood buttons click handlers
  moodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      moodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          {
            action: 'mood_checkin',
            mood: mood,
            note: `Logged via extension at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          },
          (res) => {
            if (moodFeedback) {
              if (res && res.success) {
                moodFeedback.textContent = `✓ Feeling ${mood}. Take care of yourself.`;
                moodFeedback.style.color = '#2F5E54';
              } else {
                moodFeedback.textContent = `✓ Checked in as ${mood}.`;
                moodFeedback.style.color = '#2F5E54';
              }
              moodFeedback.style.display = 'block';
            }
          }
        );
      }
    });
  });

  // Begin Mindful Breathing Exercise (30s)
  if (btnPopupBreathe) {
    btnPopupBreathe.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                action: 'start_breathing',
                reason: 'Mindful 30s Breathing Break via Cognivibe'
              },
              (res) => {
                if (chrome.runtime.lastError || !res || !res.success) {
                  chrome.tabs.create({ url: 'http://localhost:5173/consumption?breathe=true' });
                }
                window.close();
              }
            );
          } else {
            chrome.tabs.create({ url: 'http://localhost:5173/consumption?breathe=true' });
            window.close();
          }
        });
      }
    });
  }

  // Trigger Shield Demo
  if (btnPopupShieldTest) {
    btnPopupShieldTest.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                action: 'trigger_shield_test'
              },
              () => {
                window.close();
              }
            );
          }
        });
      }
    });
  }

  // Pair token
  if (btnSaveToken && tokenInput) {
    btnSaveToken.addEventListener('click', async () => {
      const token = tokenInput.value.trim();
      if (!token) return;

      try {
        const resp = await fetch(`${API_BASE}/extension/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extension_token: token })
        });
        const data = await resp.json();
        if (resp.ok) {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ cognivibe_token: token }, () => {
              if (pairStatus) {
                pairStatus.textContent = `✓ Paired with: ${data.name || 'Account'}`;
                pairStatus.style.color = '#2F5E54';
              }
              loadTodaySummary();
            });
          }
        } else {
          if (pairStatus) {
            pairStatus.textContent = `⚠️ ${data.detail || 'Failed to pair'}`;
            pairStatus.style.color = '#b91c1c';
          }
        }
      } catch (e) {
        if (pairStatus) {
          pairStatus.textContent = '⚠️ Backend unreachable.';
          pairStatus.style.color = '#b91c1c';
        }
      }
    });
  }
});
