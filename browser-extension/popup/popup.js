const API_BASE = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', () => {
  const statusPill = document.getElementById('status-pill');
  const inputText = document.getElementById('input-text');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnScanPage = document.getElementById('btn-scan-page');
  const resultBox = document.getElementById('result-box');
  const tokenInput = document.getElementById('token-input');
  const btnSaveToken = document.getElementById('btn-save-token');
  const pairStatus = document.getElementById('pair-status');

  // Tabs
  const tabBtnAnalyze = document.getElementById('tab-btn-analyze');
  const tabBtnSettings = document.getElementById('tab-btn-settings');
  const tabAnalyze = document.getElementById('tab-analyze');
  const tabSettings = document.getElementById('tab-settings');

  tabBtnAnalyze.addEventListener('click', () => {
    tabBtnAnalyze.classList.add('active');
    tabBtnSettings.classList.remove('active');
    tabAnalyze.classList.add('active');
    tabSettings.classList.remove('active');
  });

  tabBtnSettings.addEventListener('click', () => {
    tabBtnSettings.classList.add('active');
    tabBtnAnalyze.classList.remove('active');
    tabSettings.classList.add('active');
    tabAnalyze.classList.remove('active');
  });

  // Fast check backend status
  fetch(`${API_BASE}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      statusPill.textContent = 'Backend Online';
      statusPill.className = 'status-pill online';
    })
    .catch(() => {
      statusPill.textContent = 'Backend Offline';
      statusPill.className = 'status-pill offline';
    });

  // Load saved token
  if (chrome && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['cognivibe_token'], (res) => {
      if (res.cognivibe_token) {
        tokenInput.value = res.cognivibe_token;
        pairStatus.textContent = '✓ Paired with token: ' + res.cognivibe_token.substring(0, 10) + '...';
        pairStatus.style.color = '#15803d';
      }
    });
  }

  // Save token
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
        chrome.storage.sync.set({ cognivibe_token: token }, () => {
          pairStatus.textContent = `✓ Paired successfully with account: ${data.name}`;
          pairStatus.style.color = '#15803d';
        });
      } else {
        pairStatus.textContent = `⚠️ ${data.detail || 'Failed to pair'}`;
        pairStatus.style.color = '#b91c1c';
      }
    } catch (e) {
      pairStatus.textContent = '⚠️ Backend unreachable.';
      pairStatus.style.color = '#b91c1c';
    }
  });

  // Analyze text via fast background proxy
  btnAnalyze.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) return;

    btnAnalyze.disabled = true;
    btnAnalyze.textContent = 'Analyzing...';
    resultBox.style.display = 'none';

    chrome.runtime.sendMessage(
      {
        action: 'fast_analyze',
        text: text,
        platform: 'popup_quick_tool',
        element_type: 'manual_input'
      },
      (response) => {
        btnAnalyze.disabled = false;
        btnAnalyze.textContent = 'Analyze Language';

        if (response && response.success && response.data) {
          resultBox.style.display = 'block';
          const data = response.data;
          const emo = data.task_1_emotion.predicted_emotion;
          const isDep = data.task_2_depression_language.depression_related;
          const ind = data.task_2_depression_language.indicator;
          const unc = Math.round(data.uncertainty.score * 100);

          const emoEl = document.getElementById('res-emotion');
          emoEl.textContent = emo;
          emoEl.style.background = emo === 'Sadness' ? '#fee2e2' : emo === 'Joy' ? '#dcfce7' : '#f1f5f9';
          emoEl.style.color = emo === 'Sadness' ? '#991b1b' : emo === 'Joy' ? '#166534' : '#334155';

          const depEl = document.getElementById('res-depression');
          depEl.textContent = isDep ? 'Flagged Language' : 'Non-Depressive';
          depEl.style.background = isDep ? '#fee2e2' : '#dcfce7';
          depEl.style.color = isDep ? '#991b1b' : '#166534';

          document.getElementById('res-indicator').textContent = ind.replace('_', ' ').toUpperCase();
          document.getElementById('res-uncertainty').textContent = `${unc}% (${data.uncertainty.status})`;

          const cuesBox = document.getElementById('res-cues');
          cuesBox.innerHTML = '<strong>Linguistic cues:</strong> ' + (data.linguistic_cues || []).join(', ');

          const helplineBox = document.getElementById('res-helpline');
          if (isDep || data.metadata.crisis_flag) {
            helplineBox.style.display = 'block';
            helplineBox.innerHTML = '📞 <strong>Helpline:</strong> Tele-MANAS (14416) | KIRAN (1800-599-0019)';
          } else {
            helplineBox.style.display = 'none';
          }
        } else {
          alert((response && response.error) || 'Analysis failed. Make sure python backend/server.py is running.');
        }
      }
    );
  });

  // Scan current page
  btnScanPage.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            alert('Cognivibe AI: Scanned page. Look for "🧠 Analyze Post" buttons on visible posts!');
          }
        });
      }
    });
  });
});
